import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { signJWT, authMiddleware, hashPassword, verifyPassword } from '../middleware/auth';
import { getSubscription } from './subscription';

const auth = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function nanoid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 21);
}

auth.post('/register', async (c) => {
  const body = await c.req.json<{ name: string; email: string; password: string; phone?: string; role: 'client' | 'professional' }>();

  if (!body.name || !body.email || !body.password || !body.role) {
    return c.json({ error: 'Missing required fields', code: 'VALIDATION_ERROR' }, 400);
  }
  if (!['client', 'professional'].includes(body.role)) {
    return c.json({ error: 'Invalid role', code: 'VALIDATION_ERROR' }, 400);
  }
  if (body.password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters', code: 'VALIDATION_ERROR' }, 400);
  }

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
  if (existing) {
    return c.json({ error: 'Email already registered', code: 'EMAIL_EXISTS' }, 409);
  }

  const id = nanoid();
  const passwordHash = await hashPassword(body.password);
  const now = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    'INSERT INTO users (id, name, email, phone, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, body.name, body.email, body.phone ?? null, passwordHash, body.role, now).run();

  const token = await signJWT({ sub: id, name: body.name, email: body.email, role: body.role }, c.env.JWT_SECRET);

  return c.json({ token, user: { id, name: body.name, email: body.email, role: body.role } }, 201);
});

auth.post('/login', async (c) => {
  const body = await c.req.json<{ email: string; password: string }>();

  if (!body.email || !body.password) {
    return c.json({ error: 'Missing credentials', code: 'VALIDATION_ERROR' }, 400);
  }

  const user = await c.env.DB.prepare(
    'SELECT id, name, email, role, password_hash FROM users WHERE email = ?'
  ).bind(body.email).first<{ id: string; name: string; email: string; role: 'client' | 'professional'; password_hash: string }>();

  if (!user || !(await verifyPassword(body.password, user.password_hash))) {
    return c.json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' }, 401);
  }

  const token = await signJWT({ sub: user.id, name: user.name, email: user.email, role: user.role }, c.env.JWT_SECRET);

  return c.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

auth.get('/me', authMiddleware, async (c) => {
  const jwtUser = c.get('user');
  const user = await c.env.DB.prepare(
    'SELECT id, name, email, phone, role, avatar_url, created_at FROM users WHERE id = ?'
  ).bind(jwtUser.sub).first();

  if (!user) return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404);

  // Check if professional has a salon + subscription
  let salon = null;
  let subscription = null;
  if (jwtUser.role === 'professional') {
    salon = await c.env.DB.prepare(
      `SELECT s.id, s.name, s.slug, s.description, s.address
       FROM salons s
       JOIN salon_professionals sp ON sp.salon_id = s.id
       WHERE sp.professional_id = ?`
    ).bind(jwtUser.sub).first();
    subscription = await getSubscription(c.env.DB, jwtUser.sub);
  }

  return c.json({ user, salon, subscription });
});

export default auth;
