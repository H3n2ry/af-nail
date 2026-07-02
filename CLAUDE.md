# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Build & Run Commands

All commands run from the root `C:\Users\Jean\Desktop\af-nail`.

### Environment setup

```bash
# Copy env template
cp client/.env.example client/.env
# Set VITE_API_URL=http://localhost:8787/api for local dev
```

### Common commands

```bash
# Install all dependencies (root + client + worker)
npm install

# Run worker API (http://localhost:8787)
npm run dev:worker

# Run React frontend (http://localhost:5173)
npm run dev:client

# Build frontend for production
npm run build:client

# Deploy worker to Cloudflare
npm run deploy:worker

# Database - create D1 database
npm run db:create

# Database - apply schema
npm run db:migrate
# or locally:
wrangler d1 execute af-nail-db --local --file=schema.sql

# Full local setup (first time)
npm run setup
```

### Wrangler (Cloudflare CLI)

```bash
# Set JWT secret
wrangler secret put JWT_SECRET

# Query local D1
wrangler d1 execute af-nail-db --local --command "SELECT * FROM users LIMIT 10"

# Tail worker logs
wrangler tail
```

## Architecture

Monorepo with two packages: `client/` (React SPA) and `worker/` (Cloudflare Workers API).

```
af-nail/
├── client/                        # React 18 + TypeScript + Vite + Tailwind
│   └── src/
│       ├── App.tsx                # Root routing (React Router DOM)
│       ├── components/            # Shared UI components
│       ├── design-system/
│       │   └── globals.css        # CSS variables + Tailwind component layer
│       ├── lib/
│       │   ├── api.ts             # Typed API client + all TypeScript types
│       │   └── utils.ts
│       ├── portals/
│       │   ├── client/            # Customer portal (/login, /register, /app/*)
│       │   └── pro/               # Professional portal (/pro/*)
│       └── store/
│           ├── auth.ts            # Zustand auth store (user, token, salon, subscription)
│           └── notifications.ts   # Zustand notification store
├── worker/                        # Cloudflare Workers (Hono.js)
│   └── src/
│       ├── index.ts               # Hono app + cron handler
│       ├── types.ts               # TypeScript types (User, Salon, Service, etc.)
│       ├── middleware/
│       │   └── auth.ts            # JWT sign/verify + password hashing
│       └── routes/                # One file per domain
│           ├── auth.ts            # register, login, /me
│           ├── salons.ts          # CRUD + search + connect
│           ├── services.ts        # Professional's services CRUD
│           ├── availability.ts    # Weekly availability slots
│           ├── appointments.ts    # Book, list, update status
│           ├── notifications.ts   # List + mark-read
│           ├── dashboard.ts       # Earnings + appointment stats
│           └── subscription.ts    # Activate/cancel subscription
├── schema.sql                     # D1 (SQLite) schema + indexes
├── wrangler.toml                  # Cloudflare config (D1 binding, cron, account)
└── package.json                   # Root workspace scripts
```

## Key Patterns

**State management**: Zustand stores in `client/src/store/`. Auth persisted to `localStorage` as `af-nail-auth`. Notifications auto-refreshed every 60 seconds.

**API client**: All requests go through `client/src/lib/api.ts` which reads the token from the auth store and sets `Authorization: Bearer <token>`. All types are defined here.

**Routing**: React Router DOM v6. Two separate portals:
- Client portal: `ClientLayout.tsx` wraps `/app/*` routes (requires `role === 'client'`)
- Pro portal: `ProLayout.tsx` wraps `/pro/*` routes — gated by `RequireProSubscription` and `RequireProSalon` components

**Auth**: Custom JWT (HS256 via Web Crypto API). Token expires in 7 days. Password hashed with custom SHA-256 + salt `'af-nail-salt'` (not bcrypt despite the import).

**Cron**: Worker runs hourly (`0 * * * *`) to dispatch pending notifications (2-day and 2-hour appointment reminders).

## Portals

### Client Portal (`/app/*`)

| Route | Page | Purpose |
|-------|------|---------|
| `/login` | LoginPage | Client login |
| `/register` | RegisterPage | Client signup |
| `/app` | HomePage | Browse/search salons (debounced, 400ms) |
| `/app/salon/:id` | SalonPage | View services + booking flow |
| `/app/appointments` | AppointmentsPage | Past & upcoming bookings |
| `/app/notifications` | NotificationsPage | Reminders + status alerts |

**Booking flow** (`BookingFlow.tsx`): select service → professional → date/time → confirm. Available slots calculated from `availability` table minus existing `appointments`.

### Professional Portal (`/pro/*`)

Access requires: authenticated + active subscription + salon created.

| Route | Page | Purpose |
|-------|------|---------|
| `/pro/login` | ProLoginPage | Pro login |
| `/pro/register` | ProRegisterPage | Pro signup |
| `/pro/subscription` | SubscriptionPage | Paywall (R$150/mês, test mode) |
| `/pro/create-salon` | CreateSalonPage | Salon onboarding |
| `/pro` | DashboardPage | Today's appointments + earnings |
| `/pro/agenda` | AgendaPage | Calendar (day/week/month) |
| `/pro/availability` | AvailabilityPage | Weekly hours per day |
| `/pro/services` | ServicesPage | CRUD: name, price, duration |
| `/pro/clients` | ClientsPage | Clients who booked |
| `/pro/earnings` | EarningsPage | Revenue stats + chart |
| `/pro/notifications` | ProNotificationsPage | New bookings + cancellations |

## Database Schema (D1 / SQLite)

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `users` | All accounts | `role` ('client'\|'professional'), `email`, `password_hash` |
| `salons` | Salon profiles | `name`, `slug`, `type` ('nail'\|'hair'\|'barber'), `address` |
| `salon_professionals` | Pro ↔ salon link | 1:1 relationship |
| `salon_clients` | Client ↔ salon link | N:N (client connects to multiple salons) |
| `services` | Salon's services | `price_cents`, `duration_minutes`, `is_combo` |
| `availability` | Weekly hours | `day_of_week` (0-6), `start_time`, `end_time`, `active` |
| `appointments` | Bookings | `status` (confirmed\|cancelled\|completed), `scheduled_date`, `scheduled_time` |
| `notifications` | Reminders + alerts | `type` (reminder_2d\|reminder_2h\|new_booking\|cancellation), `sent_at` |
| `subscriptions` | Pro billing | `status` (active\|inactive\|cancelled), `amount_cents` (15000 = R$150) |

**Currency rule**: all prices stored as cents (`price_cents`, `amount_cents`) — never use floats for money.

**Indexes**: `idx_appointments_date`, `idx_appointments_status`, `idx_notifications_user`, `idx_notifications_scheduled`, `idx_services_salon`, `idx_salon_professionals`, `idx_salon_clients`, `idx_subscriptions_prof`.

## API Routes (Worker)

All routes under `/api/`. Auth routes are public; everything else requires `Authorization: Bearer <token>`.

```
POST   /api/auth/register         { name, email, password, phone?, role }
POST   /api/auth/login            { email, password }
GET    /api/auth/me               → { user, salon?, subscription? }

GET    /api/salons/search?q=&type=  → { salons[] }   # type: nail|hair|barber (opcional)
POST   /api/salons                { name, type, description?, address? }
GET    /api/salons/:id            → { salon, professionals[] }
POST   /api/salons/:id/connect    (client only)

GET    /api/services/mine         (professional) → { services[] }
POST   /api/services              { name, price_cents, duration_minutes?, is_combo? }
PUT    /api/services/:id
DELETE /api/services/:id

GET    /api/professionals/:id/slots?date=YYYY-MM-DD → { slots[], date }
PUT    /api/availability          [{ day_of_week, start_time, end_time, active }]

GET    /api/appointments?role=client|professional
POST   /api/appointments          { salon_id, professional_id, service_id, scheduled_date, scheduled_time }
PATCH  /api/appointments/:id/status { status: 'completed'|'cancelled' }

GET    /api/notifications         → { notifications[], unread_count }
PATCH  /api/notifications/:id/read

GET    /api/dashboard/earnings?period=today|week|month
GET    /api/dashboard/appointments?period=today|week|month

POST   /api/subscription/activate
POST   /api/subscription/cancel
```

## Design System

**Colors (Tailwind theme):**
- Primary: `#C9A84C` (dourado) — main brand color
- Accent: `#1A1A1A` (charcoal)
- Neutrals: `#1A1A1A` (dark), `#6B5E56` (mid), `#F5F1ED` (light)
- Success: `#5C9E7F`, Warning: `#D4A853`, Error: `#C0392B`

**Typography:**
- Display: `Cormorant Garamond` (serif) — headings
- Body: `DM Sans` (sans-serif) — UI text
- Mono: `DM Mono`

**Radius:** sm=8px, md=16px, lg=24px, full=9999px

**Component classes (globals.css):**
- `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- `.card` — surface with shadow + border
- `.input` — form field with focus ring
- `.badge-confirmed`, `.badge-completed`, `.badge-cancelled`
- `.slot-available`, `.slot-occupied`, `.slot-selected`
- `.page-container` — `max-w-xl mx-auto px-4 pb-24 min-h-screen`

**Mobile-first**: all pages wrap content in `.page-container`. Bottom nav (`BottomNav.tsx`) adds `pb-24` padding.

## External Services

| Service | Purpose | Config |
|---------|---------|--------|
| Cloudflare Workers | Serverless API | `wrangler.toml` — account `590158c3bae74495df33a55405add5ef` |
| Cloudflare D1 | SQLite edge database | binding `DB`, id `2076ca40-362f-4fd2-87b3-c49b0727a726` |
| Cloudflare Pages | Frontend hosting | Build: `cd client && npm run build`, output: `client/dist` |

## Security

**JWT**: HS256 with `JWT_SECRET` env var (set via `wrangler secret put JWT_SECRET`). Never hardcode it.

**Password hashing**: custom SHA-256 + static salt in `middleware/auth.ts`. Consider upgrading to bcrypt (already imported) for production.

**CORS**: worker allows requests from `FRONTEND_URL` env var only.

**Role enforcement**: `requireRole('professional')` middleware on all `/pro` API routes.

**Subscription gate**: `RequireProSubscription` component in `ProLayout.tsx` redirects to `/pro/subscription` if no active sub. `RequireProSalon` redirects to `/pro/create-salon` if no salon yet.

**No secrets in client**: `VITE_API_URL` is the only env var in the frontend. JWT_SECRET lives server-side only.

## Local Dev Notes

- Client proxies `/api` to `http://localhost:8787` via Vite config — no CORS issues locally
- D1 runs locally via Wrangler's built-in SQLite emulator (`--local` flag)
- SPA routing on Cloudflare Pages is handled by `client/public/_redirects` (`/* /index.html 200`)
- Subscription is in test mode — `POST /api/subscription/activate` always succeeds without real payment
