import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import authRoutes from './routes/auth';
import salonRoutes from './routes/salons';
import serviceRoutes from './routes/services';
import availabilityRoutes from './routes/availability';
import appointmentRoutes from './routes/appointments';
import notificationRoutes from './routes/notifications';
import dashboardRoutes from './routes/dashboard';

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: (origin) => origin ?? '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'af-nail-worker' }));

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/salons', salonRoutes);
app.route('/api/services', serviceRoutes);
app.route('/api/professionals', availabilityRoutes);
app.route('/api/appointments', appointmentRoutes);
app.route('/api/notifications', notificationRoutes);
app.route('/api/dashboard', dashboardRoutes);

// Cron trigger — process pending notifications
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return app.fetch(request, env, ctx);
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(processNotifications(env));
  },
};

async function processNotifications(env: Env): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  // Get pending notifications that are due
  const pending = await env.DB.prepare(
    `SELECT id, user_id, type, message FROM notifications
     WHERE sent_at IS NULL AND scheduled_for <= ? AND is_read = 0
     LIMIT 100`
  ).bind(now).all<{ id: string; user_id: string; type: string; message: string }>();

  if (!pending.results.length) return;

  // Mark them as sent (in a real system, you'd push via WebPush or email here)
  const ids = pending.results.map(n => n.id);
  await Promise.all(ids.map(id =>
    env.DB.prepare('UPDATE notifications SET sent_at = ? WHERE id = ?').bind(now, id).run()
  ));
}
