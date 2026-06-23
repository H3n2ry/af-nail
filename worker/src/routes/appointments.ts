import { Hono } from 'hono';
import { Env, JWTPayload } from '../types';
import { authMiddleware } from '../middleware/auth';

const appointments = new Hono<{ Bindings: Env; Variables: { user: JWTPayload } }>();

function nanoid() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 21);
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
}

async function scheduleNotifications(
  db: D1Database,
  appointmentId: string,
  clientId: string,
  professionalId: string,
  scheduledDate: string,
  scheduledTime: string,
  clientName: string,
  professionalName: string,
  serviceName: string
) {
  const [year, month, day] = scheduledDate.split('-').map(Number);
  const [hour, minute] = scheduledTime.split(':').map(Number);
  const appointmentTs = Math.floor(new Date(year, month - 1, day, hour, minute).getTime() / 1000);

  const now = Math.floor(Date.now() / 1000);
  const twoDaysBefore = appointmentTs - 2 * 24 * 3600;
  const twoHoursBefore = appointmentTs - 2 * 3600;

  const notifications = [
    {
      userId: clientId,
      type: 'reminder_2d' as const,
      message: `Lembrete: você tem um agendamento de ${serviceName} amanhã às ${scheduledTime}.`,
      scheduledFor: twoDaysBefore,
    },
    {
      userId: clientId,
      type: 'reminder_2h' as const,
      message: `Seu atendimento de ${serviceName} começa em 2 horas (${scheduledTime}).`,
      scheduledFor: twoHoursBefore,
    },
    {
      userId: professionalId,
      type: 'new_booking' as const,
      message: `Nova cliente: ${clientName} agendou ${serviceName} para ${scheduledDate} às ${scheduledTime}.`,
      scheduledFor: now,
    },
  ].filter(n => n.scheduledFor > now || n.type === 'new_booking');

  const stmt = db.prepare(
    `INSERT INTO notifications (id, user_id, appointment_id, type, message, is_read, scheduled_for, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`
  );

  await Promise.all(notifications.map(n =>
    stmt.bind(nanoid(), n.userId, appointmentId, n.type, n.message, n.scheduledFor, now).run()
  ));
}

// Get slots (convenience endpoint)
appointments.get('/slots', async (c) => {
  const profId = c.req.query('professional_id');
  const date = c.req.query('date');
  if (!profId || !date) {
    return c.json({ error: 'professional_id and date required', code: 'VALIDATION_ERROR' }, 400);
  }
  return c.redirect(`/api/professionals/${profId}/slots?date=${date}`);
});

// Create appointment
appointments.post('/', authMiddleware, async (c) => {
  const user = c.get('user');
  if (user.role !== 'client') {
    return c.json({ error: 'Only clients can book appointments', code: 'FORBIDDEN' }, 403);
  }

  const body = await c.req.json<{
    salon_id: string;
    professional_id: string;
    service_id: string;
    scheduled_date: string;
    scheduled_time: string;
    notes?: string;
  }>();

  const { salon_id, professional_id, service_id, scheduled_date, scheduled_time } = body;
  if (!salon_id || !professional_id || !service_id || !scheduled_date || !scheduled_time) {
    return c.json({ error: 'Missing required fields', code: 'VALIDATION_ERROR' }, 400);
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduled_date)) {
    return c.json({ error: 'Invalid date format, use YYYY-MM-DD', code: 'VALIDATION_ERROR' }, 400);
  }

  // Get service info
  const service = await c.env.DB.prepare(
    'SELECT id, price_cents, duration_minutes, is_combo, is_active FROM services WHERE id = ? AND salon_id = ?'
  ).bind(service_id, salon_id).first<{ id: string; price_cents: number; duration_minutes: number; is_combo: number; is_active: number }>();

  if (!service || !service.is_active) {
    return c.json({ error: 'Service not found or inactive', code: 'NOT_FOUND' }, 404);
  }

  // Check for conflicts
  const conflict = await c.env.DB.prepare(
    `SELECT id FROM appointments
     WHERE professional_id = ? AND scheduled_date = ? AND scheduled_time = ? AND status = 'confirmed'`
  ).bind(professional_id, scheduled_date, scheduled_time).first();

  if (conflict) {
    return c.json({ error: 'Slot already taken', code: 'SLOT_TAKEN' }, 409);
  }

  // For combo, check next slot too
  if (service.is_combo) {
    const nextSlot = addMinutesToTime(scheduled_time, 60);
    const nextConflict = await c.env.DB.prepare(
      `SELECT id FROM appointments
       WHERE professional_id = ? AND scheduled_date = ? AND scheduled_time = ? AND status = 'confirmed'`
    ).bind(professional_id, scheduled_date, nextSlot).first();

    if (nextConflict) {
      return c.json({ error: 'Next slot for combo is already taken', code: 'SLOT_TAKEN' }, 409);
    }
  }

  // Get names for notifications
  const [clientRow, professionalRow] = await Promise.all([
    c.env.DB.prepare('SELECT name FROM users WHERE id = ?').bind(user.sub).first<{ name: string }>(),
    c.env.DB.prepare('SELECT name FROM users WHERE id = ?').bind(professional_id).first<{ name: string }>(),
    c.env.DB.prepare('SELECT name FROM services WHERE id = ?').bind(service_id).first<{ name: string }>(),
  ]);

  const serviceRow = await c.env.DB.prepare('SELECT name FROM services WHERE id = ?').bind(service_id).first<{ name: string }>();

  const id = nanoid();
  const now = Math.floor(Date.now() / 1000);

  await c.env.DB.prepare(
    `INSERT INTO appointments (id, salon_id, client_id, professional_id, service_id, scheduled_date, scheduled_time, status, price_cents, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?, ?)`
  ).bind(id, salon_id, user.sub, professional_id, service_id, scheduled_date, scheduled_time, service.price_cents, body.notes ?? null, now).run();

  // Schedule notifications
  await scheduleNotifications(
    c.env.DB, id, user.sub, professional_id,
    scheduled_date, scheduled_time,
    clientRow?.name ?? 'Cliente',
    professionalRow?.name ?? 'Profissional',
    serviceRow?.name ?? 'Serviço'
  );

  return c.json({ appointment: { id, scheduled_date, scheduled_time, status: 'confirmed', price_cents: service.price_cents } }, 201);
});

// Get appointments
appointments.get('/', authMiddleware, async (c) => {
  const user = c.get('user');
  const role = c.req.query('role') ?? user.role;

  let query: string;
  let bindId: string;

  if (role === 'client') {
    bindId = user.sub;
    query = `SELECT a.id, a.scheduled_date, a.scheduled_time, a.status, a.price_cents, a.notes,
                    s.name AS service_name, s.duration_minutes, s.is_combo,
                    u.name AS professional_name,
                    sl.name AS salon_name, sl.id AS salon_id
             FROM appointments a
             JOIN services s ON s.id = a.service_id
             JOIN users u ON u.id = a.professional_id
             JOIN salons sl ON sl.id = a.salon_id
             WHERE a.client_id = ?
             ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`;
  } else {
    bindId = user.sub;
    query = `SELECT a.id, a.scheduled_date, a.scheduled_time, a.status, a.price_cents, a.notes,
                    s.name AS service_name, s.duration_minutes, s.is_combo,
                    u.name AS client_name, u.phone AS client_phone,
                    sl.name AS salon_name
             FROM appointments a
             JOIN services s ON s.id = a.service_id
             JOIN users u ON u.id = a.client_id
             JOIN salons sl ON sl.id = a.salon_id
             WHERE a.professional_id = ?
             ORDER BY a.scheduled_date DESC, a.scheduled_time DESC`;
  }

  const result = await c.env.DB.prepare(query).bind(bindId).all();
  return c.json({ appointments: result.results });
});

// Update appointment status
appointments.patch('/:id/status', authMiddleware, async (c) => {
  const user = c.get('user');
  const body = await c.req.json<{ status: 'completed' | 'cancelled' }>();

  if (!['completed', 'cancelled'].includes(body.status)) {
    return c.json({ error: 'Invalid status', code: 'VALIDATION_ERROR' }, 400);
  }

  const appt = await c.env.DB.prepare(
    'SELECT id, client_id, professional_id, status, scheduled_date, scheduled_time FROM appointments WHERE id = ?'
  ).bind(c.req.param('id')).first<{ id: string; client_id: string; professional_id: string; status: string; scheduled_date: string; scheduled_time: string }>();

  if (!appt) return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
  if (appt.client_id !== user.sub && appt.professional_id !== user.sub) {
    return c.json({ error: 'Forbidden', code: 'FORBIDDEN' }, 403);
  }
  if (appt.status !== 'confirmed') {
    return c.json({ error: 'Can only update confirmed appointments', code: 'INVALID_STATE' }, 400);
  }
  if (body.status === 'completed' && user.role !== 'professional') {
    return c.json({ error: 'Only professionals can mark as completed', code: 'FORBIDDEN' }, 403);
  }

  await c.env.DB.prepare('UPDATE appointments SET status = ? WHERE id = ?')
    .bind(body.status, appt.id).run();

  // Send cancellation notifications
  if (body.status === 'cancelled') {
    const now = Math.floor(Date.now() / 1000);
    const msg = `Agendamento de ${appt.scheduled_date} às ${appt.scheduled_time} foi cancelado.`;
    const notifStmt = c.env.DB.prepare(
      `INSERT INTO notifications (id, user_id, appointment_id, type, message, is_read, scheduled_for, created_at)
       VALUES (?, ?, ?, 'cancellation', ?, 0, ?, ?)`
    );
    await Promise.all([
      notifStmt.bind(nanoid(), appt.client_id, appt.id, msg, now, now).run(),
      notifStmt.bind(nanoid(), appt.professional_id, appt.id, msg, now, now).run(),
    ]);
  }

  return c.json({ success: true, status: body.status });
});

export default appointments;
