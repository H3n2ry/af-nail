export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  FRONTEND_URL: string;
};

export type Role = 'client' | 'professional';

export type JWTPayload = {
  sub: string;       // user id
  name: string;
  email: string;
  role: Role;
  iat: number;
  exp: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: number;
};

export type SalonType = 'nail' | 'hair' | 'barber';

export type Salon = {
  id: string;
  name: string;
  slug: string;
  type: SalonType;
  description: string | null;
  address: string | null;
  created_at: number;
};

export type Service = {
  id: string;
  salon_id: string;
  professional_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  duration_minutes: number;
  is_combo: number;
  is_active: number;
  created_at: number;
};

export type Availability = {
  id: string;
  professional_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
};

export type Appointment = {
  id: string;
  salon_id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  price_cents: number;
  notes: string | null;
  created_at: number;
};

export type Notification = {
  id: string;
  user_id: string;
  appointment_id: string;
  type: 'reminder_2d' | 'reminder_2h' | 'new_booking' | 'cancellation';
  message: string;
  is_read: number;
  scheduled_for: number;
  sent_at: number | null;
  created_at: number;
};
