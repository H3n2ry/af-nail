-- Af.salon — Schema D1 (SQLite edge)
-- Execute via: wrangler d1 execute af-salon-db --file=schema.sql
-- Migration para bancos existentes: wrangler d1 execute af-salon-db --command "ALTER TABLE salons ADD COLUMN type TEXT NOT NULL DEFAULT 'nail' CHECK(type IN ('nail','hair','barber'))"

-- Salões
CREATE TABLE IF NOT EXISTS salons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'nail' CHECK(type IN ('nail','hair','barber')),
  description TEXT,
  address TEXT,
  created_at INTEGER NOT NULL
);

-- Usuários (clientes e profissionais)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('client','professional')),
  avatar_url TEXT,
  created_at INTEGER NOT NULL
);

-- Vínculo profissional <-> salão (1:1)
CREATE TABLE IF NOT EXISTS salon_professionals (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL REFERENCES salons(id),
  professional_id TEXT NOT NULL REFERENCES users(id),
  joined_at INTEGER NOT NULL,
  UNIQUE(professional_id)
);

-- Vínculo cliente <-> salão (N:N)
CREATE TABLE IF NOT EXISTS salon_clients (
  salon_id TEXT NOT NULL REFERENCES salons(id),
  client_id TEXT NOT NULL REFERENCES users(id),
  connected_at INTEGER NOT NULL,
  PRIMARY KEY(salon_id, client_id)
);

-- Serviços do salão
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL REFERENCES salons(id),
  professional_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  is_combo INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

-- Disponibilidade semanal
CREATE TABLE IF NOT EXISTS availability (
  id TEXT PRIMARY KEY,
  professional_id TEXT NOT NULL REFERENCES users(id),
  day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  UNIQUE(professional_id, day_of_week)
);

-- Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  salon_id TEXT NOT NULL REFERENCES salons(id),
  client_id TEXT NOT NULL REFERENCES users(id),
  professional_id TEXT NOT NULL REFERENCES users(id),
  service_id TEXT NOT NULL REFERENCES services(id),
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK(status IN ('confirmed','cancelled','completed')),
  price_cents INTEGER NOT NULL,
  notes TEXT,
  created_at INTEGER NOT NULL
);

-- Notificações
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  appointment_id TEXT NOT NULL REFERENCES appointments(id),
  type TEXT NOT NULL CHECK(type IN ('reminder_2d','reminder_2h','new_booking','cancellation')),
  message TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  scheduled_for INTEGER NOT NULL,
  sent_at INTEGER,
  created_at INTEGER NOT NULL
);

-- Assinatura mensal da profissional (R$50/mês destrava o portal)
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  professional_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK(status IN ('active','inactive','cancelled')),
  amount_cents INTEGER NOT NULL DEFAULT 15000,  -- R$ 150,00
  started_at INTEGER,
  expires_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE(professional_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_subscriptions_prof ON subscriptions(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date, professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status, professional_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for, sent_at);
CREATE INDEX IF NOT EXISTS idx_services_salon ON services(salon_id, is_active);
CREATE INDEX IF NOT EXISTS idx_salon_professionals ON salon_professionals(salon_id);
CREATE INDEX IF NOT EXISTS idx_salon_clients ON salon_clients(client_id);
