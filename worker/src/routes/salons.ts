import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { authMiddleware } from '../middleware/auth';

const salons = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function nanoid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 21);
}

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Search salons
salons.get('/search', authMiddleware, async (c) => {
  const q = c.req.query('q') ?? '';
  const type = c.req.query('type');
  const validTypes = ['nail', 'hair', 'barber'];

  let query: string;
  let bindings: unknown[];

  const baseSelect = `SELECT s.id, s.name, s.slug, s.type, s.description, s.address,
             COUNT(sc.client_id) AS client_count
             FROM salons s
             LEFT JOIN salon_clients sc ON sc.salon_id = s.id`;
  const orderBy = `GROUP BY s.id ORDER BY client_count DESC LIMIT 20`;

  if (type && validTypes.includes(type)) {
    query = `${baseSelect} WHERE LOWER(s.name) LIKE LOWER(?) AND s.type = ? ${orderBy}`;
    bindings = [`%${q}%`, type];
  } else {
    query = `${baseSelect} WHERE LOWER(s.name) LIKE LOWER(?) ${orderBy}`;
    bindings = [`%${q}%`];
  }

  const results = await c.env.DB.prepare(query).bind(...bindings).all();
  return c.json({ salons: results.results });
});

// Create salon (professional only)
salons.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Only professionals can create salons', code: 'FORBIDDEN' }, 403);
  }

  const existing = await c.env.DB.prepare(
    'SELECT id FROM salon_professionals WHERE professional_id = ?'
  ).bind(user.sub).first();
  if (existing) {
    return c.json({ error: 'Already linked to a salon', code: 'ALREADY_LINKED' }, 409);
  }

  const body = await c.req.json<{ name: string; type?: string; description?: string; address?: string }>();
  if (!body.name) return c.json({ error: 'Name is required', code: 'VALIDATION_ERROR' }, 400);

  const validTypes = ['nail', 'hair', 'barber'];
  const type = body.type && validTypes.includes(body.type) ? body.type : 'nail';

  const id = nanoid();
  const slug = slugify(body.name) + '-' + nanoid().slice(0, 6);
  const now = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    'INSERT INTO salons (id, name, slug, type, description, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.name, slug, type, body.description ?? null, body.address ?? null, now).run();

  const linkId = nanoid();
  await c.env.DB.prepare(
    'INSERT INTO salon_professionals (id, salon_id, professional_id, joined_at) VALUES (?, ?, ?, ?)'
  ).bind(linkId, id, user.sub, now).run();

  return c.json({ salon: { id, name: body.name, slug, type, description: body.description ?? null, address: body.address ?? null } }, 201);
});

// Get salon details
salons.get('/:id', authMiddleware, async (c) => {
  const salon = await c.env.DB.prepare(
    'SELECT id, name, slug, type, description, address, created_at FROM salons WHERE id = ?'
  ).bind(c.req.param('id')).first();
  if (!salon) return c.json({ error: 'Salon not found', code: 'NOT_FOUND' }, 404);

  const professionals = await c.env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.avatar_url
     FROM users u
     JOIN salon_professionals sp ON sp.professional_id = u.id
     WHERE sp.salon_id = ?`
  ).bind(c.req.param('id')).all();

  return c.json({ salon, professionals: professionals.results });
});

// Client connects to salon
salons.post('/:id/connect', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'client') {
    return c.json({ error: 'Only clients can connect to salons', code: 'FORBIDDEN' }, 403);
  }

  const salon = await c.env.DB.prepare('SELECT id FROM salons WHERE id = ?').bind(c.req.param('id')).first();
  if (!salon) return c.json({ error: 'Salon not found', code: 'NOT_FOUND' }, 404);

  const already = await c.env.DB.prepare(
    'SELECT 1 FROM salon_clients WHERE salon_id = ? AND client_id = ?'
  ).bind(c.req.param('id'), user.sub).first();

  if (!already) {
    const now = Math.floor(Date.now() / 1000);
    await c.env.DB.prepare(
      'INSERT INTO salon_clients (salon_id, client_id, connected_at) VALUES (?, ?, ?)'
    ).bind(c.req.param('id'), user.sub, now).run();
  }

  return c.json({ success: true });
});

// Get services of a salon
salons.get('/:id/services', authMiddleware, async (c) => {
  const services = await c.env.DB.prepare(
    `SELECT s.id, s.name, s.description, s.price_cents, s.duration_minutes, s.is_combo, s.professional_id,
            u.name AS professional_name
     FROM services s
     JOIN users u ON u.id = s.professional_id
     WHERE s.salon_id = ? AND s.is_active = 1`
  ).bind(c.req.param('id')).all();
  return c.json({ services: services.results });
});

// Get clients of a salon (professional who owns the salon only)
salons.get('/:id/clients', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  // Ensure the professional actually owns this salon (prevent cross-salon data access)
  const owns = await c.env.DB.prepare(
    'SELECT 1 FROM salon_professionals WHERE salon_id = ? AND professional_id = ?'
  ).bind(c.req.param('id'), user.sub).first();
  if (!owns) {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  const clients = await c.env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.phone, u.avatar_url,
            COUNT(a.id) AS total_appointments,
            MAX(a.scheduled_date) AS last_appointment
     FROM users u
     JOIN salon_clients sc ON sc.client_id = u.id
     LEFT JOIN appointments a ON a.client_id = u.id AND a.salon_id = sc.salon_id AND a.status != 'cancelled'
     WHERE sc.salon_id = ?
     GROUP BY u.id`
  ).bind(c.req.param('id')).all();
  return c.json({ clients: clients.results });
});

// Get salons a client is connected to
salons.get('/my/connected', authMiddleware, async (c) => {
  const user = c.get('user');
  const connected = await c.env.DB.prepare(
    `SELECT s.id, s.name, s.slug, s.type, s.description, s.address
     FROM salons s
     JOIN salon_clients sc ON sc.salon_id = s.id
     WHERE sc.client_id = ?`
  ).bind(user.sub).all();
  return c.json({ salons: connected.results });
});

export default salons;
