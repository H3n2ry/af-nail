# SDD — Software Design Document
## Af.nail · v1.0.0
### Metodologia IEEE 1016 — 5 Visões

---

## 1. Visão de Contexto

### 1.1 O que o sistema faz
Af.nail é um marketplace PWA de agendamento para manicures que permite:
- Clientes buscarem salões e agendarem serviços online
- Profissionais gerenciarem agenda, serviços, disponibilidade e faturamento
- O sistema disparar lembretes automáticos de agendamento

### 1.2 Para quem
Manicures autônomas e pequenos salões brasileiros que querem substituir a gestão de agenda por WhatsApp por uma solução digital.

### 1.3 Atores e casos de uso

| Ator | Casos de uso |
|------|-------------|
| Cliente (não autenticado) | Criar conta, fazer login |
| Cliente (autenticado) | Buscar salões, conectar a salão, agendar serviço, ver agendamentos, ver notificações |
| Profissional (não autenticado) | Criar conta, fazer login |
| Profissional (autenticado) | Assinar, criar salão, gerenciar serviços, configurar disponibilidade, ver agenda, ver clientes, ver ganhos |
| Sistema (cron job) | Disparar notificações pendentes a cada hora |

### 1.4 Escopo do sistema
```
[Cliente] ──────── React SPA ──────── [Worker API]
[Profissional] ──┘                         │
                                    [D1 SQLite edge]
```

Sem servidor próprio. Todo o backend vive no Cloudflare Workers + D1.

---

## 2. Visão de Composição

### 2.1 Camadas da aplicação

```
┌──────────────────────────────────────────────────────┐
│  PRESENTATION (React)                                │
│  Pages → Zustand Stores → api.ts (fetch)            │
├──────────────────────────────────────────────────────┤
│  TRANSPORT                                           │
│  api.ts → fetch → Authorization: Bearer <token>     │
├──────────────────────────────────────────────────────┤
│  API (Cloudflare Workers / Hono.js)                  │
│  Routes → authMiddleware → D1 queries (SQL raw)     │
├──────────────────────────────────────────────────────┤
│  DADOS                                               │
│  Cloudflare D1 (SQLite edge)                        │
└──────────────────────────────────────────────────────┘
```

### 2.2 Módulos e responsabilidades

| Módulo | Localização | Responsabilidade |
|--------|-------------|-----------------|
| Auth (client) | `store/auth.ts` | Estado de login, token, salon, subscription |
| Notifications (client) | `store/notifications.ts` | Lista e unread count; refresh a cada 60s |
| API Client | `lib/api.ts` | Todos os tipos TS + todas as chamadas HTTP |
| Portal Cliente | `portals/client/` | Páginas do portal de agendamento |
| Portal Pro | `portals/pro/` | Páginas do portal de gestão |
| Auth (worker) | `routes/auth.ts` | register, login, /me |
| Salons (worker) | `routes/salons.ts` | CRUD + busca + connect |
| Services (worker) | `routes/services.ts` | CRUD de serviços |
| Availability (worker) | `routes/availability.ts` | Disponibilidade semanal + slots |
| Appointments (worker) | `routes/appointments.ts` | Agendamentos CRUD |
| Notifications (worker) | `routes/notifications.ts` | Listagem + mark-read |
| Dashboard (worker) | `routes/dashboard.ts` | Ganhos + stats |
| Subscription (worker) | `routes/subscription.ts` | Ativar/cancelar |
| Cron (worker) | `index.ts` | Handler scheduled — despacha notificações |

### 2.3 Diagrama de componentes

```
App.tsx (React Router DOM)
  ├── /login → LoginPage
  ├── /register → RegisterPage
  ├── ClientLayout (auth guard: role=client)
  │     ├── /app → HomePage
  │     ├── /app/salon/:id → SalonPage
  │     │     └── BookingFlow (modal)
  │     ├── /app/appointments → AppointmentsPage
  │     └── /app/notifications → NotificationsPage
  └── ProLayout (auth guard: role=professional)
        ├── /pro/login → ProLoginPage
        ├── /pro/register → ProRegisterPage
        ├── /pro/subscription → SubscriptionPage (sem assinatura ativa)
        ├── /pro/create-salon → CreateSalonPage (sem salão)
        ├── /pro → DashboardPage
        ├── /pro/agenda → AgendaPage
        ├── /pro/availability → AvailabilityPage
        ├── /pro/services → ServicesPage
        ├── /pro/clients → ClientsPage
        ├── /pro/earnings → EarningsPage
        └── /pro/notifications → ProNotificationsPage
```

---

## 3. Visão de Dependências

### 3.1 Dependências externas

| Serviço | Protocolo | Disponibilidade |
|---------|-----------|-----------------|
| Cloudflare Workers | HTTPS (edge) | 99.9% uptime SLA (free: sem SLA) |
| Cloudflare D1 | Interno ao Worker | Vinculado ao Worker — mesma disponibilidade |
| Vercel (frontend) | HTTPS (CDN) | Sem SLA no free tier |

### 3.2 Grafo de dependências internas

```
SalonPage
  ├── api.getSalon(id) → GET /api/salons/:id
  └── BookingFlow
        ├── api.getSlots(profId, date) → GET /api/professionals/:id/slots
        └── api.createAppointment(...) → POST /api/appointments

ProLayout
  └── useAuthStore.subscription → /pro/subscription se inativa
      useAuthStore.salon → /pro/create-salon se null
```

---

## 4. Visão de Interface

### 4.1 D1 — Tabelas

| Tabela | Operações |
|--------|-----------|
| `users` | INSERT (register), SELECT (login, /me, search) |
| `salons` | INSERT (create), SELECT (search, get), UPDATE |
| `salon_professionals` | INSERT, SELECT |
| `salon_clients` | INSERT (connect), SELECT |
| `services` | INSERT, SELECT, UPDATE, DELETE |
| `availability` | INSERT/UPDATE (upsert por day_of_week), SELECT |
| `appointments` | INSERT (book), SELECT (list), UPDATE (status) |
| `notifications` | INSERT (on book), SELECT (list), UPDATE (is_read, sent_at) |
| `subscriptions` | INSERT/UPDATE (upsert por professional_id), SELECT |

### 4.2 JWT — Estrutura do Token

```json
{
  "sub": "nanoid-do-usuario",
  "role": "client | professional",
  "exp": 1234567890
}
```
Algoritmo: HS256. Expiração: 7 dias. Secret: `JWT_SECRET` env var.

### 4.3 Variáveis de configuração

| Config | Onde | Valor |
|--------|------|-------|
| `JWT_SECRET` | `wrangler secret put` | string aleatória ≥32 chars |
| `FRONTEND_URL` | `wrangler.toml [vars]` | `https://af-nail.vercel.app` |
| `VITE_API_URL` | `client/.env` | URL do Worker |
| D1 `database_id` | `wrangler.toml` | `2076ca40-362f-4fd2-87b3-c49b0727a726` |

---

## 5. Visão de Comportamento

### 5.1 Fluxo de autenticação

```
/login ou /pro/login
  → POST /api/auth/login { email, password }
  → Worker: SELECT user WHERE email = ?
  → hashPassword(password) === stored_hash
  → signJWT(userId, role, 7d)
  → response: { token, user }
  → authStore.login() → localStorage 'af-nail-auth'
  → Redirect: role=client → /app | role=professional → /pro (ou /pro/subscription)
```

### 5.2 Fluxo de agendamento

```
SalonPage → selecionar serviço → abrir BookingFlow
  → selecionar profissional
  → selecionar data (DatePicker)
  → GET /api/professionals/:id/slots?date=YYYY-MM-DD
    → Worker: lê availability para day_of_week
    → Worker: lê appointments WHERE scheduled_date = date AND professional_id = id
    → Calcula slots livres (horários da disponibilidade não ocupados por agendamentos existentes)
  → selecionar horário
  → POST /api/appointments
    → Worker: INSERT appointments (status='confirmed')
    → Worker: INSERT notifications reminder_2d + reminder_2h
    → Response: { appointment }
  → notificationStore.fetch() — atualiza badge
```

### 5.3 Fluxo do cron de notificações

```
0 * * * * (cron Cloudflare)
  → scheduled() handler em index.ts
  → SELECT * FROM notifications
      WHERE sent_at IS NULL
        AND scheduled_for <= UNIX_TIMESTAMP_NOW
  → Para cada notificação:
    → (futuro: enviar push / e-mail)
    → UPDATE notifications SET sent_at = NOW()
```

### 5.4 Cálculo de slots disponíveis

```
GET /api/professionals/:id/slots?date=2025-10-15

1. Busca availability WHERE professional_id = id AND day_of_week = 2 (terça)
   → { start_time: "09:00", end_time: "18:00" }

2. Busca service.duration_minutes (ex: 60)

3. Gera todos os slots possíveis:
   09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00

4. Busca appointments WHERE scheduled_date = '2025-10-15' AND professional_id = id
   → ['10:00', '14:00'] (já ocupados)

5. Retorna slots = gerados - ocupados
   → ['09:00', '11:00', '12:00', '13:00', '15:00', '16:00', '17:00']
```

---

## 6. SharedPreferences / LocalStorage

| Chave | Tipo | Usado em |
|-------|------|---------|
| `af-nail-auth` | JSON | Zustand auth store — user, token, salon, subscription |
| `af_nail_token` | String | Token JWT bruto (legacy / alternativo) |

---

## 7. Débitos Técnicos e Riscos

| Item | Severidade | Descrição |
|------|-----------|-----------|
| Hash SHA-256 custom com salt fixo | 🔴 Alto | `'af-nail-salt'` hardcoded — vulnerável a rainbow table attacks |
| JWT_SECRET hardcoded em [vars] no wrangler.toml | 🔴 Alto | Risco se o repo for público |
| Pagamento em test mode | 🔴 Alto | R$150/mês sem cobrança real — não gera receita |
| Notificações sem entrega real | 🟡 Médio | Cron marca como enviado mas usuário não recebe nada |
| Zero cobertura de testes | 🟡 Médio | Sem testes automatizados |
| Sem rate limiting | 🟡 Médio | Endpoints abertos a abuso |
| bcryptjs importado mas não usado | 🟢 Baixo | Dead import no middleware |
