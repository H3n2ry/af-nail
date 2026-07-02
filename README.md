# Af.nail 💅

App de agendamento para salões de manicure. PWA mobile-first com dois portais separados: **Cliente** e **Profissional**.

**Live:** https://af-nail.vercel.app

## Funcionalidades

- **Portal Cliente** — busca salões, conecta, agenda serviços e recebe lembretes automáticos
- **Portal Profissional** — cria salão, gerencia serviços e disponibilidade, visualiza agenda (dia/semana/mês) e acompanha faturamento
- **Assinatura mensal** — profissionais pagam R$150/mês para desbloquear o portal (test mode)
- **Notificações automáticas** — cron job horário dispara lembretes 2 dias e 2 horas antes de cada agendamento

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS v3 |
| State management | Zustand |
| Backend | Cloudflare Workers + Hono.js |
| Banco | Cloudflare D1 (SQLite edge) |
| Auth | JWT customizado (HS256 via Web Crypto API) |
| Deploy | Cloudflare Pages (frontend) + Cloudflare Workers (API) |

## Setup

### Pré-requisitos

- Node.js 20+
- Wrangler CLI: `npm install -g wrangler`
- Conta Cloudflare (gratuita serve)

### Configuração local

```bash
# 1. Instalar dependências (client + worker)
npm install

# 2. Criar banco D1 e aplicar schema
cd worker && npm run db:create
wrangler d1 execute af-nail-db --local --file=../schema.sql
cd ..

# 3. Configurar JWT_SECRET no wrangler.toml (dev)
# [vars]
# JWT_SECRET = "sua-string-secreta-aqui"

# 4. Terminal 1 — API
npm run dev:worker

# 5. Terminal 2 — Frontend
cd client && cp .env.example .env
npm run dev:client
```

## Estrutura do projeto

```
af-nail/
├── client/          # React SPA (portais /app/* e /pro/*)
│   └── src/
│       ├── portals/client/   # Portal da cliente
│       ├── portals/pro/      # Portal da profissional
│       ├── store/            # Zustand (auth + notifications)
│       └── lib/api.ts        # API client tipado
├── worker/          # Cloudflare Workers (Hono.js REST API)
│   └── src/routes/ # Um arquivo por domínio
├── schema.sql       # Schema D1 completo (9 tabelas)
└── wrangler.toml    # Config Cloudflare (D1, cron, account)
```

Ver `DEPLOY.md` para instruções completas de produção.
