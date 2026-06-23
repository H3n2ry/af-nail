# Af.nail — Guia de Deploy

## Pré-requisitos

- Node.js 20+
- Conta no Cloudflare (gratuita serve)
- Wrangler CLI: `npm install -g wrangler`
- Autenticado: `wrangler login`

---

## 1. Instalação

```bash
cd af-nail
npm install
```

---

## 2. Banco de dados D1

### Criar o banco
```bash
wrangler d1 create af-nail-db
```
Copie o `database_id` retornado e cole em `wrangler.toml`:
```toml
[[d1_databases]]
database_id = "COLE_O_ID_AQUI"
```

### Aplicar o schema
```bash
# Produção
wrangler d1 execute af-nail-db --file=schema.sql

# Desenvolvimento local
wrangler d1 execute af-nail-db --local --file=schema.sql
```

---

## 3. Variáveis de ambiente do Worker

Edite `wrangler.toml` e configure:
```toml
[vars]
JWT_SECRET = "gere-uma-string-aleatoria-forte-com-32-chars"
FRONTEND_URL = "https://af-nail.pages.dev"
```

Para produção, use secrets (mais seguro):
```bash
wrangler secret put JWT_SECRET
```

---

## 4. Deploy do Worker

```bash
cd worker
npm install
npm run deploy
```

Anote a URL retornada: `https://af-nail-worker.SEU_SUBDOMAIN.workers.dev`

---

## 5. Deploy do Frontend (Cloudflare Pages)

### Via CLI
```bash
cd client
npm install
echo "VITE_API_URL=https://af-nail-worker.SEU_SUBDOMAIN.workers.dev/api" > .env.production
npm run build
wrangler pages deploy dist --project-name af-nail
```

### Via Dashboard (alternativa)
1. Acesse dash.cloudflare.com → Pages → Create project
2. Connect ao seu repositório Git (GitHub/GitLab)
3. Configure o build:
   - **Build command:** `cd client && npm run build`
   - **Build output directory:** `client/dist`
   - **Root directory:** `/` (raiz do monorepo)
4. Adicione variável de ambiente:
   - `VITE_API_URL` = `https://af-nail-worker.SEU_SUBDOMAIN.workers.dev/api`

---

## 6. Desenvolvimento local

Terminal 1 — Worker:
```bash
cd worker
npm run dev
# Rodando em http://localhost:8787
```

Terminal 2 — Cliente:
```bash
cd client
npm run dev
# Rodando em http://localhost:5173
# Proxy /api → http://localhost:8787 já configurado no vite.config.ts
```

---

## Estrutura de URLs

| Rota | Portal |
|------|--------|
| `/login` | Login da cliente |
| `/register` | Cadastro da cliente |
| `/app` | Home da cliente |
| `/app/salon/:id` | Página do salão |
| `/app/appointments` | Agendamentos da cliente |
| `/pro/login` | Login da profissional |
| `/pro/register` | Cadastro da profissional |
| `/pro/create-salon` | Onboarding — criar salão |
| `/pro` | Dashboard da profissional |
| `/pro/agenda` | Agenda (dia/semana/mês) |
| `/pro/clients` | Lista de clientes |
| `/pro/services` | Gerenciar serviços |
| `/pro/earnings` | Dashboard de ganhos |
| `/pro/availability` | Configurar disponibilidade |

---

## Checklist de produção

- [ ] `JWT_SECRET` com string forte (32+ chars aleatórios)
- [ ] `FRONTEND_URL` apontando para o domínio real do Pages
- [ ] `VITE_API_URL` no env do Pages apontando para o Worker
- [ ] Schema aplicado no D1 de produção
- [ ] `_redirects` presente em `client/public/` (SPA routing)
- [ ] Cron trigger configurado no `wrangler.toml` (já está em `triggers.crons`)
