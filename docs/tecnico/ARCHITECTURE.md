# ARCHITECTURE.md — Arquitetura Detalhada
## Af.nail · v1.0.0

---

## 1. Padrão Arquitetural

**Monorepo com separação Client/Server + Store Pattern (Zustand)**

Sem Clean Architecture formal. Separação clara por responsabilidade:
- Client: páginas simples que chamam `api.ts` e leem stores Zustand
- Worker: routes Hono com middleware de auth + queries SQL diretas no D1

```
af-nail/
├── client/src/
│   ├── App.tsx                    ← Roteamento raiz
│   ├── lib/api.ts                 ← ÚNICO ponto de acesso à API + tipos TS
│   ├── store/auth.ts              ← Estado global de auth (Zustand + persist)
│   ├── store/notifications.ts     ← Estado global de notificações
│   ├── components/                ← Componentes compartilhados entre portais
│   ├── design-system/globals.css  ← CSS variables + Tailwind component layer
│   └── portals/
│       ├── client/                ← Portal /app/* (ClientLayout + páginas)
│       └── pro/                   ← Portal /pro/* (ProLayout + páginas + gating)
│
└── worker/src/
    ├── index.ts                   ← Hono app + cron handler
    ├── types.ts                   ← Tipos compartilhados
    ├── middleware/auth.ts         ← JWT + hash de senha
    └── routes/                    ← Um arquivo por domínio (8 arquivos)
```

---

## 2. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│  React SPA (Vite)                                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Presentation Layer                                      │  │
│  │  Pages — ClientLayout / ProLayout / componentes          │  │
│  │    SalonPage  BookingFlow  DashboardPage  AgendaPage     │  │
│  │        ↕           ↕           ↕             ↕          │  │
│  │  lib/api.ts (fetch + tipos TypeScript)                   │  │
│  │        ↕                                                 │  │
│  │  Zustand Stores                                          │  │
│  │    useAuthStore  useNotificationStore                    │  │
│  └──────────────────┬───────────────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────────────┘
                      │ HTTPS fetch
┌─────────────────────▼───────────────────────────────────────────┐
│  Cloudflare Workers (Hono.js)                                   │
│                                                                 │
│  authMiddleware (JWT verify)                                    │
│  Routes: auth / salons / services / availability /             │
│          appointments / notifications / dashboard / subscription│
│                    ↓                                            │
│  D1 queries (SQL raw via env.DB.prepare().bind().run())        │
│                    ↓                                            │
│  Cloudflare D1 (SQLite)                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Padrões de Estado (Zustand)

### useAuthStore (`store/auth.ts`)
```typescript
{
  user: User | null
  token: string | null
  salon: { id, name, slug } | null
  subscription: Subscription | null
  isLoading: boolean

  login(email, password): Promise<void>  // POST /api/auth/login
  register(data): Promise<void>           // POST /api/auth/register
  logout(): void                          // limpa estado + localStorage
  refreshMe(): Promise<void>              // GET /api/auth/me
  setSalon(salon): void
  setSubscription(subscription): void
}
// Persistido em localStorage: 'af-nail-auth'
```

### useNotificationStore (`store/notifications.ts`)
```typescript
{
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean

  fetch(): Promise<void>          // GET /api/notifications
  markRead(id): Promise<void>     // PATCH /api/notifications/:id/read
  markAllRead(): Promise<void>
}
// Auto-refresh: setInterval 60s quando autenticado
```

---

## 4. Roteamento

React Router DOM v6. Dois grupos de rotas com guards:

**Rotas públicas:**
- `/login`, `/register` → ClientLayout sem auth guard
- `/pro/login`, `/pro/register` → ProLayout sem auth guard

**Portal Cliente (ClientLayout):**
- Verifica `user !== null && user.role === 'client'`
- Redireciona para `/login` se não autenticado

**Portal Profissional (ProLayout):**
- Verifica `user !== null && user.role === 'professional'`
- `RequireProSubscription` → redireciona para `/pro/subscription` se `subscription?.status !== 'active'`
- `RequireProSalon` → redireciona para `/pro/create-salon` se `salon === null`

---

## 5. Design System

Definido em `client/src/design-system/globals.css` e `tailwind.config.js`:

```css
:root {
  --color-primary: #C9607A;        /* rosa/mauve — ação principal */
  --color-primary-light: #F2A7BB;
  --color-primary-pale: #FDF0F4;
  --color-accent: #A0522D;         /* warm brown */
  --color-neutral-900: #1A1219;
  --color-neutral-500: #7A6872;
  --color-neutral-100: #F7F3F5;
  --color-success: #5C9E7F;
  --color-warning: #D4A853;
  --color-error: #C0392B;
}
```

**Classes de componente (globals.css):**
- `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- `.card` — superfície com sombra + borda
- `.input` — campo com focus ring
- `.badge-confirmed`, `.badge-completed`, `.badge-cancelled`
- `.slot-available`, `.slot-occupied`, `.slot-selected`
- `.page-container` — `max-w-xl mx-auto px-4 pb-24 min-h-screen`

---

## 6. Separação de Responsabilidades

### ✅ Bem feito
- `lib/api.ts` é o único arquivo que faz `fetch` — páginas não fazem chamadas diretas
- Stores Zustand encapsulam persistência no localStorage
- Routes Hono separadas por domínio — fácil de navegar
- Schema SQL normalizado com constraints e índices adequados

### ⚠️ Acoplamentos a monitorar
- `api.ts` é um arquivo único grande — cresce com o projeto
- Pages fazem `useEffect` + `useState` locais em vez de usar stores para dados transientes
- Hash customizado em `middleware/auth.ts` acoplado ao salt literal `'af-nail-salt'`

---

## 7. Pontos de Extensão

| Feature nova | Onde adicionar |
|-------------|---------------|
| Nova rota de API | `worker/src/routes/<novo>.ts` + registrar em `index.ts` |
| Nova página cliente | `portals/client/pages/` + rota em `App.tsx` |
| Nova página profissional | `portals/pro/pages/` + rota em `App.tsx` |
| Novo tipo global | `lib/api.ts` (tipos) + `worker/src/types.ts` |
| Novo store Zustand | `store/<nome>.ts` + importar onde necessário |
| Gateway de pagamento | Substituir `routes/subscription.ts` test mode |
| Push notifications | Adicionar Web Push API no cron handler + client subscription |
