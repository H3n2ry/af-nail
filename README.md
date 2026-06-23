# Af.nail 💅

Sistema de agendamento para salões de manicure com dois portais: **Cliente** e **Profissional**.

PWA mobile-first, multi-salão, com lógica de disponibilidade compartilhada em tempo real.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React + Vite + TypeScript (Cloudflare Pages) |
| Backend | Cloudflare Workers + Hono.js |
| Banco | Cloudflare D1 (SQLite edge) |
| Auth | JWT custom via Workers |
| Estado | Zustand |
| Estilo | Tailwind CSS v3 + CSS Variables |

## Estrutura

```
af-nail/
├── client/          # React SPA (portais /app e /pro)
├── worker/          # Cloudflare Worker (API REST)
├── schema.sql       # Schema D1 completo
└── wrangler.toml    # Config Cloudflare
```

## Como rodar

Requer Node.js 20+ e Wrangler CLI. Veja o guia completo em [DEPLOY.md](DEPLOY.md).

```bash
npm install -g wrangler
wrangler login

cd af-nail
wrangler d1 create af-nail-db          # copie o database_id para wrangler.toml
wrangler d1 execute af-nail-db --local --file=schema.sql

# Terminal 1 — API
cd worker && npm install && npm run dev

# Terminal 2 — Frontend
cd client && npm install && npm run dev
```

## Portais

- **Cliente** (`/app/*`): busca salões, conecta, agenda serviços, recebe lembretes
- **Profissional** (`/pro/*`): cria salão, gerencia serviços/disponibilidade, agenda (dia/semana/mês), dashboard de ganhos
