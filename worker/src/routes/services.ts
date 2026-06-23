import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { authMiddleware } from '../middleware/auth';

const services = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function nanoid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 21);
}

// Create service
services.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Only professionals can create services', code: 'FORBIDDEN' }, 403);
  }

  const link = await c.env.DB.prepare(
    'SELECT salon_id FROM salon_professionals WHERE professional_id = ?'
  ).bind(user.sub).first<{ salon_id: string }>();
  if (!link) return c.json({ error: 'Not linked to a salon', code: 'NO_SALON' }, 400);

  const body = await c.req.json<{
    name: string;
    description?: string;
    price_cents: number;
    duration_minutes?: number;
    is_combo?: boolean;
  }>();

  if (!body.name || !body.price_cents) {
    return c.json({ error: 'Name and price_cents are required', code: 'VALIDATION_ERROR' }, 400);
  }

  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    `INSERT INTO services (id, salon_id, professional_id, name, description, price_cents, duration_minutes, is_combo, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  ).bind(
    id, link.salon_id, user.sub,
    body.name, body.description ?? null,
    body.price_cents, body.duration_minutes ?? 60,
    body.is_combo ? 1 : 0, now
  ).run();

  return c.json({ service: { id, salon_id: link.salon_id, name: body.name } }, 201);
});

// Update service
services.patch('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  const service = await c.env.DB.prepare(
    'SELECT id, professional_id FROM services WHERE id = ?'
  ).bind(c.req.param('id')).first<{ id: string; professional_id: string }>();

  if (!service) return c.json({ error: 'Service not found', code: 'NOT_FOUND' }, 404);
  if (service.professional_id !== user.sub) {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  const body = await c.req.json<Partial<{
    name: string;
    description: string;
    price_cents: number;
    duration_minutes: number;
    is_combo: boolean;
    is_active: boolean;
  }>>();

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name); }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description); }
  if (body.price_cents !== undefined) { fields.push('price_cents = ?'); values.push(body.price_cents); }
  if (body.duration_minutes !== undefined) { fields.push('duration_minutes = ?'); values.push(body.duration_minutes); }
  if (body.is_combo !== undefined) { fields.push('is_combo = ?'); values.push(body.is_combo ? 1 : 0); }
  if (body.is_active !== undefined) { fields.push('is_active = ?'); values.push(body.is_active ? 1 : 0); }

  if (fields.length === 0) return c.json({ error: 'No fields to update', code: 'VALIDATION_ERROR' }, 400);

  values.push(c.req.param('id'));
  await c.env.DB.prepare(`UPDATE services SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run();

  return c.json({ success: true });
});

// Soft delete service
services.delete('/:id', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  const service = await c.env.DB.prepare(
    'SELECT professional_id FROM services WHERE id = ?'
  ).bind(c.req.param('id')).first<{ professional_id: string }>();

  if (!service) return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
  if (service.professional_id !== user.sub) {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  await c.env.DB.prepare('UPDATE services SET is_active = 0 WHERE id = ?')
    .bind(c.req.param('id')).run();

  return c.json({ success: true });
});

// Get services by professional
services.get('/mine', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  const result = await c.env.DB.prepare(
    `SELECT id, name, description, price_cents, duration_minutes, is_combo, is_active, created_at
     FROM services WHERE professional_id = ? ORDER BY is_active DESC, created_at DESC`
  ).bind(user.sub).all();

  return c.json({ services: result.results });
});

export default services;
