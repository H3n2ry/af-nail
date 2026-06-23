import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { authMiddleware } from '../middleware/auth';

const availability = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function nanoid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 21);
}

function generateSlots(startTime: string, endTime: string, durationMinutes: number = 60): string[] {
  const slots: string[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60).toString().padStart(2, '0');
    const m = (current % 60).toString().padStart(2, '0');
    slots.push(`${h}:${m}`);
    current += 60; // always 1h intervals
  }
  return slots;
}

// Get availability for a professional
availability.get('/:professionalId', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT id, day_of_week, start_time, end_time FROM availability WHERE professional_id = ? ORDER BY day_of_week'
  ).bind(c.req.param('professionalId')).all();

  return c.json({ availability: rows.results });
});

// Update availability (professional only)
availability.put('/:professionalId', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'professional' || user.sub !== c.req.param('professionalId')) {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }

  const body = await c.req.json<Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    active: boolean;
  }>>();

  if (!Array.isArray(body)) {
    return c.json({ error: 'Expected array of availability entries', code: 'VALIDATION_ERROR' }, 400);
  }

  const profId = c.req.param('professionalId');

  // Delete all existing and re-insert
  await c.env.DB.prepare('DELETE FROM availability WHERE professional_id = ?').bind(profId).run();

  const stmt = c.env.DB.prepare(
    'INSERT INTO availability (id, professional_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?)'
  );

  const active = body.filter(e => e.active && e.start_time && e.end_time);
  await Promise.all(active.map(e =>
    stmt.bind(nanoid(), profId, e.day_of_week, e.start_time, e.end_time).run()
  ));

  return c.json({ success: true, saved: active.length });
});

// Get available slots for a date
availability.get('/:professionalId/slots', async (c) => {
  const profId = c.req.param('professionalId');
  const date = c.req.query('date'); // "2025-07-10"

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: 'date query param required (YYYY-MM-DD)', code: 'VALIDATION_ERROR' }, 400);
  }

  const dayOfWeek = new Date(date + 'T12:00:00Z').getDay();

  const avail = await c.env.DB.prepare(
    'SELECT start_time, end_time FROM availability WHERE professional_id = ? AND day_of_week = ?'
  ).bind(profId, dayOfWeek).first<{ start_time: string; end_time: string }>();

  if (!avail) return c.json({ slots: [] });

  const allSlots = generateSlots(avail.start_time, avail.end_time);

  // Get booked times
  const booked = await c.env.DB.prepare(
    `SELECT scheduled_time, s.is_combo, s.duration_minutes
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     WHERE a.professional_id = ? AND a.scheduled_date = ? AND a.status = 'confirmed'`
  ).bind(profId, date).all<{ scheduled_time: string; is_combo: number; duration_minutes: number }>();

  const occupiedTimes = new Set<string>();
  for (const appt of booked.results) {
    occupiedTimes.add(appt.scheduled_time);
    if (appt.is_combo) {
      // Combo occupies next slot too
      const [h, m] = appt.scheduled_time.split(':').map(Number);
      const nextMin = h * 60 + m + 60;
      const nextH = Math.floor(nextMin / 60).toString().padStart(2, '0');
      const nextM = (nextMin % 60).toString().padStart(2, '0');
      occupiedTimes.add(`${nextH}:${nextM}`);
    }
  }

  const slots = allSlots.map(time => ({
    time,
    available: !occupiedTimes.has(time),
  }));

  return c.json({ slots, date, professional_id: profId });
});

export { generateSlots };
export default availability;
