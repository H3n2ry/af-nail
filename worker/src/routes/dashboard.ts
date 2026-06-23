import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { authMiddleware } from '../middleware/auth';

const dashboard = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function getPeriodDates(period: string): { start: string; end: string } {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (period === 'today') {
    const today = fmt(now);
    return { start: today, end: today };
  }

  if (period === 'week') {
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: fmt(monday), end: fmt(sunday) };
  }

  // month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: fmt(start), end: fmt(end) };
}

// Earnings dashboard (professional only)
dashboard.get('/earnings', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  const period = c.req.query('period') ?? 'month';
  if (!['today', 'week', 'month'].includes(period)) {
    return c.json({ error: 'Invalid period', code: 'VALIDATION_ERROR' }, 400);
  }

  const { start, end } = getPeriodDates(period);

  const summary = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count, COALESCE(SUM(price_cents), 0) AS total_cents
     FROM appointments
     WHERE professional_id = ? AND status = 'completed'
     AND scheduled_date >= ? AND scheduled_date <= ?`
  ).bind(user.sub, start, end).first<{ count: number; total_cents: number }>();

  // Completed appointments list
  const completed = await c.env.DB.prepare(
    `SELECT a.id, a.scheduled_date, a.scheduled_time, a.price_cents,
            s.name AS service_name,
            u.name AS client_name
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     JOIN users u ON u.id = a.client_id
     WHERE a.professional_id = ? AND a.status = 'completed'
     AND a.scheduled_date >= ? AND a.scheduled_date <= ?
     ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`
  ).bind(user.sub, start, end).all();

  // Weekly chart (last 4 weeks)
  const weeklyData: Array<{ week_start: string; total_cents: number }> = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - (day === 0 ? 6 : day - 1) - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const pad = (n: number) => n.toString().padStart(2, '0');
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    const row = await c.env.DB.prepare(
      `SELECT COALESCE(SUM(price_cents), 0) AS total_cents
       FROM appointments
       WHERE professional_id = ? AND status = 'completed'
       AND scheduled_date >= ? AND scheduled_date <= ?`
    ).bind(user.sub, fmt(weekStart), fmt(weekEnd)).first<{ total_cents: number }>();

    weeklyData.push({ week_start: fmt(weekStart), total_cents: row?.total_cents ?? 0 });
  }

  return c.json({
    period,
    start,
    end,
    count: summary?.count ?? 0,
    total_cents: summary?.total_cents ?? 0,
    appointments: completed.results,
    weekly_chart: weeklyData,
  });
});

// Appointment count dashboard
dashboard.get('/appointments', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional') {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  const period = c.req.query('period') ?? 'today';
  if (!['today', 'week', 'month'].includes(period)) {
    return c.json({ error: 'Invalid period', code: 'VALIDATION_ERROR' }, 400);
  }

  const { start, end } = getPeriodDates(period);

  const summary = await c.env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM appointments
     WHERE professional_id = ? AND status != 'cancelled'
     AND scheduled_date >= ? AND scheduled_date <= ?`
  ).bind(user.sub, start, end).first<{ count: number }>();

  // Today's appointments with client info
  const todayDate = getPeriodDates('today');
  const todayAppts = await c.env.DB.prepare(
    `SELECT a.id, a.scheduled_time, a.status, a.price_cents, a.notes,
            s.name AS service_name, s.duration_minutes, s.is_combo,
            u.name AS client_name, u.phone AS client_phone
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     JOIN users u ON u.id = a.client_id
     WHERE a.professional_id = ? AND a.scheduled_date = ?
     ORDER BY a.scheduled_time ASC`
  ).bind(user.sub, todayDate.start).all();

  return c.json({
    period,
    start,
    end,
    count: summary?.count ?? 0,
    today_appointments: todayAppts.results,
  });
});

export default dashboard;
