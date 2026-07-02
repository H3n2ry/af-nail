# Architecture — Af.nail

## Overview

Monorepo com dois pacotes: `client/` (React SPA) e `worker/` (Cloudflare Workers API). Sem servidor próprio — toda lógica server-side vive no Worker Hono.js com banco D1 (SQLite edge da Cloudflare).

```
┌──────────────────────────────────────────────┐
│            React SPA (Vite)                  │
│  Pages ←→ Zustand Stores ←→ api.ts (fetch)  │
└────────────────────┬─────────────────────────┘
                     │ HTTPS
         ┌───────────▼────────────┐
         │  Cloudflare Workers    │
         │  Hono.js REST API      │
         │  + Cron (notificações) │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │  Cloudflare D1         │
         │  SQLite edge           │
         └────────────────────────┘
```

## Layer Breakdown

### Client (`client/src/`)

| Módulo | Responsabilidade |
|--------|-----------------|
| `App.tsx` | Roteamento raiz (React Router DOM v6) |
| `lib/api.ts` | Cliente HTTP tipado — todas as chamadas à API; define todos os tipos TypeScript |
| `store/auth.ts` | Zustand — user, token, salon, subscription; persiste em `localStorage` |
| `store/notifications.ts` | Zustand — notificações + unread count; auto-refresh a cada 60s |
| `portals/client/` | Portal da cliente (`/app/*`) — ClientLayout + páginas |
| `portals/pro/` | Portal da profissional (`/pro/*`) — ProLayout + gating de assinatura/salão |
| `components/` | Componentes compartilhados (BookingFlow, AppointmentCard, Modal, etc.) |
| `design-system/globals.css` | CSS variables + camada de componentes Tailwind |

### Worker (`worker/src/`)

| Módulo | Responsabilidade |
|--------|-----------------|
| `index.ts` | App Hono — registra rotas + handler do cron |
| `types.ts` | Tipos TypeScript compartilhados (User, Salon, Service, etc.) |
| `middleware/auth.ts` | JWT sign/verify + hash de senha (SHA-256 custom) |
| `routes/auth.ts` | Registro, login, `/me` |
| `routes/salons.ts` | CRUD + busca + conectar cliente ao salão |
| `routes/services.ts` | CRUD de serviços do profissional |
| `routes/availability.ts` | Disponibilidade semanal por dia da semana |
| `routes/appointments.ts` | Agendar, listar, atualizar status |
| `routes/notifications.ts` | Listar, marcar como lida |
| `routes/dashboard.ts` | Ganhos + stats de agendamentos |
| `routes/subscription.ts` | Ativar/cancelar assinatura |

## Data Flow

### Fluxo de agendamento (BookingFlow)

```
SalonPage → selecionar serviço
  → GET /api/professionals/:id/slots?date=YYYY-MM-DD
    → Worker: lê availability por dia_da_semana
    → Worker: lê appointments do dia
    → Calcula slots disponíveis (slots da disponibilidade - agendados)
  → selecionar slot
  → POST /api/appointments
    → INSERT appointments
    → INSERT notifications (reminder_2d, reminder_2h)
  → store.notifications.fetch() — atualiza badge
```

### Fluxo de notificações (cron)

```
Cron → 0 * * * * (a cada hora)
  → SELECT FROM notifications WHERE sent_at IS NULL AND scheduled_for <= NOW()
  → Para cada notificação pendente:
    → (implementação real enviaria push/email)
    → UPDATE notifications SET sent_at = NOW()
```

### Autenticação

```
Login → POST /api/auth/login
  → bcryptjs.compare / SHA-256 hash check
  → signJWT(userId, role, 7d)
  → response { token, user }
  → authStore.login() → localStorage 'af-nail-auth'

Requests autenticadas:
  api.ts → lê token do authStore → Authorization: Bearer <token>
  Worker → verifyJWT → injeta user no context Hono
```

## Portais e Gating

### Portal Cliente (`/app/*`)
- `ClientLayout.tsx` verifica `user.role === 'client'` → redireciona se profissional
- Sem assinatura necessária — clientes são gratuitos

### Portal Profissional (`/pro/*`)
- `ProLayout.tsx` verifica:
  1. Usuário autenticado como `professional`
  2. `RequireProSubscription` → `subscription.status === 'active'` → senão, vai para `/pro/subscription`
  3. `RequireProSalon` → `salon !== null` → senão, vai para `/pro/create-salon`

## Schema D1

| Tabela | Colunas-chave |
|--------|--------------|
| `users` | `id TEXT PK`, `role CHECK('client','professional')`, `password_hash`, `email UNIQUE` |
| `salons` | `id TEXT PK`, `slug TEXT UNIQUE`, `professional_id` via `salon_professionals` |
| `salon_professionals` | `professional_id UNIQUE` → relação 1:1 (um pro = um salão) |
| `salon_clients` | `PK(salon_id, client_id)` → relação N:N |
| `services` | `price_cents INTEGER`, `duration_minutes INTEGER DEFAULT 60`, `is_active` |
| `availability` | `day_of_week 0-6`, `start_time TEXT`, `end_time TEXT`, `UNIQUE(prof_id, day_of_week)` |
| `appointments` | `status CHECK(confirmed,cancelled,completed)`, `scheduled_date TEXT`, `scheduled_time TEXT` |
| `notifications` | `type CHECK(reminder_2d,reminder_2h,new_booking,cancellation)`, `sent_at INTEGER` |
| `subscriptions` | `status CHECK(active,inactive,cancelled)`, `amount_cents DEFAULT 15000`, `UNIQUE(professional_id)` |

**Regra de moeda:** todos os preços em centavos — nunca float.
**Datas:** `scheduled_date` como `TEXT 'YYYY-MM-DD'`; timestamps como `INTEGER` (Unix epoch).

## Design System

Cores definidas em `client/src/design-system/globals.css` e `tailwind.config.js`:

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#C9607A` | Rosa/mauve — ação principal, CTAs |
| `primary.light` | `#F2A7BB` | Hover states |
| `primary.pale` | `#FDF0F4` | Backgrounds leves |
| `accent` | `#A0522D` | Warm brown — detalhes |
| `neutral.900` | `#1A1219` | Texto principal |
| `neutral.100` | `#F7F3F5` | Background de página |

**Tipografia:** Cormorant Garamond (display/headings) + DM Sans (body) + DM Mono (mono).

## Dependências Críticas

**Client:**
- `react-router-dom ^6.27.0` — roteamento SPA
- `zustand ^5.0.0` — estado global + persistência localStorage
- `date-fns ^4.1.0` — formatação de datas nos calendários

**Worker:**
- `hono ^4.6.3` — web framework do worker
- `nanoid ^5.0.7` — geração de IDs únicos
- `bcryptjs ^2.4.3` — hash de senha (importado; hash customizado também presente)
- `wrangler ^3.80.0` — CLI Cloudflare

## Pontos de Extensão

| Feature nova | Onde adicionar |
|-------------|---------------|
| Nova rota de API | `worker/src/routes/<nome>.ts` + registrar em `index.ts` |
| Nova página cliente | `client/src/portals/client/pages/` + rota em `App.tsx` |
| Nova página profissional | `client/src/portals/pro/pages/` + rota em `App.tsx` |
| Novo campo no banco | Migrar com `wrangler d1 execute` + atualizar `types.ts` + `api.ts` |
| Novo componente UI | `client/src/components/` |
| Gateway de pagamento | `worker/src/routes/subscription.ts` — remover test mode |

## Limitações Conhecidas

| Limitação | Impacto |
|-----------|---------|
| Hash customizado SHA-256 + salt fixo | Menos seguro que bcrypt real — bcryptjs está importado mas não usado no hash |
| JWT_SECRET em `[vars]` no wrangler.toml | Risco de exposição no repositório — usar `wrangler secret put` em produção |
| Sem rate limiting | Qualquer usuário pode chamar todas as rotas sem restrição de frequência |
| Pagamento em test mode | `POST /api/subscription/activate` sempre retorna sucesso — sem gateway real |
| Cron sem entrega real | Notificações são marcadas como enviadas mas não chegam ao usuário (sem FCM/email) |
| Zero testes automatizados | Nenhum arquivo de teste encontrado |
| SPA routing via `_redirects` | Funciona no Cloudflare Pages; requer configuração equivalente em outros hosts |
