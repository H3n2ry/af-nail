import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { authMiddleware } from '../middleware/auth';

const notifications = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

// Get notifications for current user
notifications.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const now = Math.floor(Date.now() / 1000);

  const result = await c.env.DB.prepare(
    `SELECT id, appointment_id, type, message, is_read, scheduled_for, sent_at, created_at
     FROM notifications
     WHERE user_id = ? AND scheduled_for <= ?
     ORDER BY created_at DESC
     LIMIT 50`
  ).bind(user.sub, now).all();

  const unread = result.results.filter((n: Record<string, unknown>) => !n.is_read).length;
  return c.json({ notifications: result.results, unread_count: unread });
});

// Mark single notification as read
notifications.patch('/:id/read', authMiddleware, async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?'
  ).bind(c.req.param('id'), user.sub).run();
  return c.json({ success: true });
});

// Mark all notifications as read
notifications.patch('/read-all', authMiddleware, async (c) => {
  const user = c.get('user');
  await c.env.DB.prepare(
    'UPDATE notifications SET is_read = 1 WHERE user_id = ?'
  ).bind(user.sub).run();
  return c.json({ success: true });
});

export default notifications;
