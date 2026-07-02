# ONBOARDING.md — Guia para Novos Desenvolvedores
## Af.nail

---

## 1. O que ler primeiro

Nesta ordem:
1. Este arquivo (ONBOARDING.md)
2. [`../../CLAUDE.md`](../../CLAUDE.md) — comandos de build e convenções
3. [`../../MEMORY.md`](../../MEMORY.md) — estado atual do projeto e decisões tomadas
4. [`../tecnico/ARCHITECTURE.md`](../tecnico/ARCHITECTURE.md) — arquitetura detalhada
5. [`../tecnico/API.md`](../tecnico/API.md) — todos os endpoints

---

## 2. Pré-requisitos

| Ferramenta | Versão | Onde instalar |
|-----------|--------|--------------|
| Node.js | 20+ | https://nodejs.org (LTS) |
| npm | 10+ | Incluso com Node.js |
| Wrangler CLI | 3.x | `npm install -g wrangler` |
| Git | Qualquer | https://git-scm.com |
| Conta Cloudflare | — | https://dash.cloudflare.com/sign-up |

---

## 3. Setup Inicial

```bash
# 1. Clonar o repositório
git clone https://github.com/H3n2ry/af-nail.git
cd af-nail

# 2. Login na Cloudflare
wrangler login

# 3. Instalar todas as dependências
npm install
cd client && npm install && cd ..
cd worker && npm install && cd ..

# 4. Criar banco D1
cd worker && npm run db:create
# Copiar o database_id retornado → colar em wrangler.toml

# 5. Aplicar schema local
wrangler d1 execute af-nail-db --local --file=../schema.sql
cd ..

# 6. Configurar JWT_SECRET no wrangler.toml
# [vars]
# JWT_SECRET = "uma-string-aleatoria-aqui"

# 7. Configurar VITE_API_URL
cd client && cp .env.example .env
# Editar .env: VITE_API_URL=http://localhost:8787/api
cd ..
```

---

## 4. Rodando Localmente

Abrir dois terminais:

**Terminal 1 — Worker API:**
```bash
cd worker && npm run dev
# Rodando em http://localhost:8787
```

**Terminal 2 — Frontend:**
```bash
cd client && npm run dev
# Rodando em http://localhost:5173
# /api é proxiado automaticamente para :8787
```

---

## 5. Estrutura de Arquivos — O Essencial

```
client/src/
├── App.tsx                    ← Roteamento — adicionar rotas aqui
├── lib/api.ts                 ← ÚNICO lugar para chamadas HTTP + tipos TS
│                                Editar para adicionar/mudar endpoints
├── store/auth.ts              ← Estado de login — não editar sem necessidade
├── store/notifications.ts     ← Estado de notificações
├── portals/client/pages/      ← Adicionar novas páginas do portal cliente aqui
├── portals/pro/pages/         ← Adicionar novas páginas do portal pro aqui
└── components/                ← Componentes compartilhados entre portais

worker/src/
├── index.ts                   ← Registra todas as rotas + handler cron
├── types.ts                   ← Tipos TypeScript — atualizar ao mudar schema
├── middleware/auth.ts         ← JWT + hash — cuidado ao editar
└── routes/                    ← Adicionar nova rota aqui + registrar no index.ts
```

---

## 6. Primeiras Tarefas Sugeridas

1. **Fácil:** Mudar um texto no dashboard do pro — entender o fluxo React
2. **Fácil:** Adicionar campo "observações" visível na lista de agendamentos do pro
3. **Médio:** Implementar filtro de data na lista de agendamentos do cliente
4. **Médio:** Criar endpoint `DELETE /api/appointments/:id` (cancelamento pelo cliente)
5. **Difícil:** Integrar gateway de pagamento (Stripe/Mercado Pago) na subscription

---

## 7. Como Fazer Mudanças

### Adicionar um novo endpoint de API

1. Criar ou editar arquivo em `worker/src/routes/<domínio>.ts`
2. Adicionar o tipo TypeScript em `worker/src/types.ts`
3. Registrar a rota em `worker/src/index.ts`
4. Adicionar a função correspondente em `client/src/lib/api.ts`
5. Atualizar `docs/tecnico/API.md`

### Adicionar uma nova coluna no banco

1. Escrever a migration SQL: `ALTER TABLE <tabela> ADD COLUMN <col> <tipo>`
2. Aplicar local: `wrangler d1 execute af-nail-db --local --command "ALTER TABLE..."`
3. Atualizar `schema.sql` para refletir o estado atual
4. Atualizar `worker/src/types.ts` e `client/src/lib/api.ts`
5. Aplicar em produção: `wrangler d1 execute af-nail-db --command "ALTER TABLE..."`

### Modificar o design

- Cores: editar `client/tailwind.config.js` e `client/src/design-system/globals.css`
- Componentes: editar classes existentes em `globals.css`
- Nunca usar cores hex hardcoded nos componentes — sempre as classes do design system

---

## 8. Armadilhas Comuns

| Armadilha | O que acontece | Como evitar |
|-----------|---------------|-------------|
| Esquecer de aplicar schema após criar banco | Erro "table not found" | Sempre rodar `db:migrate:local` após `db:create` |
| JWT_SECRET em texto no wrangler.toml commitado | Secret exposto no GitHub | Usar `wrangler secret put JWT_SECRET` para produção |
| Preço como float no D1 | Erros de arredondamento monetário | Sempre `price_cents INTEGER` — converter para R$ só na UI |
| Criar rota no worker mas não registrar no index.ts | Rota retorna 404 | Sempre `app.route('/api/novo', novaRoute)` no index.ts |
| Editar `api.ts` sem atualizar tipos | TypeScript passa mas runtime falha | Manter tipos sincronizados entre `types.ts` e `api.ts` |
| `wrangler dev` sem `cd worker` | Wrangler não encontra `wrangler.toml` | Sempre rodar dentro da pasta `worker/` |
| Usar `console.log` com senha ou token | Log exposto no Cloudflare Dashboard | Logar apenas IDs e operações, nunca credenciais |

---

## 9. Glossário

| Termo | Significado |
|-------|-------------|
| "portal cliente" | Rotas `/app/*` para quem agenda |
| "portal pro" | Rotas `/pro/*` para manicures (requer assinatura) |
| "booking flow" | Componente `BookingFlow.tsx` — modal de 3 passos para agendar |
| "slots" | Horários disponíveis calculados por `GET /api/professionals/:id/slots` |
| "gating" | Verificações `RequireProSubscription` e `RequireProSalon` no ProLayout |
| "test mode" | Assinatura que ativa sem cobrança real — remover antes de ir ao ar |
| "D1" | Banco SQLite edge da Cloudflare vinculado ao Worker via `env.DB` |
| "price_cents" | Preço em centavos — ex: R$85,00 = `8500` |
| "nanoid" | Função para gerar IDs únicos dos registros (`nanoid()` no worker) |
| "day_of_week" | 0=Domingo, 1=Segunda, ..., 6=Sábado |

---

## 10. Contato

- **Dúvidas técnicas:** afd3vs@gmail.com
- **Bugs:** usar template em `docs/qa/BUG_REPORT_TEMPLATE.md`
