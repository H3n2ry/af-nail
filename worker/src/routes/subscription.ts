import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { authMiddleware } from '../middleware/auth';

const subscription = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function nanoid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 21);
}

export const MONTHLY_PRICE_CENTS = 15000; // R$ 150,00
const THIRTY_DAYS = 30 * 24 * 3600;

export type SubscriptionInfo = {
  status: 'active' | 'inactive' | 'cancelled';
  amount_cents: number;
  started_at: number | null;
  expires_at: number | null;
  active: boolean;
};

// Busca a assinatura da profissional (sem criar registro). Calcula `active`.
export async function getSubscription(db: D1Database, professionalId: string): Promise<SubscriptionInfo> {
  const row = await db.prepare(
    'SELECT status, amount_cents, started_at, expires_at FROM subscriptions WHERE professional_id = ?'
  ).bind(professionalId).first<{ status: 'active' | 'inactive' | 'cancelled'; amount_cents: number; started_at: number | null; expires_at: number | null }>();

  const now = Math.floor(Date.now() / 1000);
  if (!row) {
    return { status: 'inactive', amount_cents: MONTHLY_PRICE_CENTS, started_at: null, expires_at: null, active: false };
  }
  const active = row.status === 'active' && (row.expires_at == null || row.expires_at > now);
  return { ...row, active };
}

// Status da assinatura (profissional logada)
subscription.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }
  const info = await getSubscription(c.env.DB, user.sub);
  return c.json({ subscription: info });
});

// Ativa a assinatura — MODO TESTE: sem cobrança real.
// (Aqui entraria a integração com gateway de pagamento no futuro.)
subscription.post('/activate', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Only professionals can subscribe', code: 'FORBIDDEN' }, 403);
  }

  const now = Math.floor(Date.now() / 1000);
  const expires = now + THIRTY_DAYS;

  await c.env.DB.prepare(
    `INSERT INTO subscriptions (id, professional_id, status, amount_cents, started_at, expires_at, created_at, updated_at)
     VALUES (?, ?, 'active', ?, ?, ?, ?, ?)
     ON CONFLICT(professional_id) DO UPDATE SET
       status = 'active',
       amount_cents = excluded.amount_cents,
       started_at = excluded.started_at,
       expires_at = excluded.expires_at,
       updated_at = excluded.updated_at`
  ).bind(nanoid(), user.sub, MONTHLY_PRICE_CENTS, now, expires, now, now).run();

  const info = await getSubscription(c.env.DB, user.sub);
  return c.json({ subscription: info, test_mode: true });
});

// Cancela a assinatura
subscription.post('/cancel', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }
  const now = Math.floor(Date.now() / 1000);
  await c.env.DB.prepare(
    `UPDATE subscriptions SET status = 'cancelled', expires_at = ?, updated_at = ? WHERE professional_id = ?`
  ).bind(now, now, user.sub).run();

  const info = await getSubscription(c.env.DB, user.sub);
  return c.json({ subscription: info });
});

export default subscription;
