# Memória de Contexto — Af.salon

> Este arquivo é lido automaticamente pelo Claude Code no início de cada sessão. Garante continuidade entre conversas. **Atualize sempre que houver decisões importantes, mudanças de direção ou contexto novo relevante.**

---

## Identidade do Projeto

- **Nome:** Af.salon (renomeado de Af.nail em 2026-07-02)
- **Versão atual:** 1.1.0
- **Status:** Em desenvolvimento (pré-lançamento)
- **Objetivo:** Marketplace PWA para agendamento em salões de beleza (manicure, cabelo e barbearia) — dois portais (cliente + profissional)
- **Stack:** React 18 + TypeScript + Vite + Zustand + Cloudflare Workers + Hono.js + D1
- **Repositório:** https://github.com/H3n2ry/af-nail · local: `C:\Users\Jean\Desktop\af-nail\`
- **Deploy atual:** https://af-nail.vercel.app (frontend) · Cloudflare Workers (API)

---

## Estado Atual do Desenvolvimento

### O que está funcionando
- Autenticação completa: registro, login, JWT (7 dias), persistência em localStorage
- Portal cliente: busca de salões (debounce 400ms), conexão a salão, booking flow (serviço → profissional → data/hora), histórico de agendamentos, notificações
- Portal profissional: assinatura (test mode R$150/mês), onboarding de salão, dashboard, agenda (dia/semana/mês), disponibilidade semanal, serviços CRUD, clientes, faturamento
- Cron job horário para despacho de notificações
- D1 schema completo com 9 tabelas e índices

### O que ainda não foi feito
- Gateway de pagamento real (assinatura está em test mode)
- Entrega real de notificações (FCM / e-mail)
- Testes automatizados (zero cobertura)
- Modo offline
- iOS/Android nativo (é PWA — funciona via browser)

---

## Decisões Tomadas (e Por Quê)

| Decisão | Motivo | Data |
|---------|--------|------|
| Cloudflare Workers + D1 | Edge computing sem servidor, free tier generoso, latência baixa | início do projeto |
| Hono.js | Framework leve e tipado para Workers (sem overhead do Express) | início do projeto |
| JWT customizado (HS256 Web Crypto) | Sem dependência de biblioteca JWT; funciona no runtime Workers | início do projeto |
| Hash SHA-256 custom (não bcrypt real) | bcryptjs tem incompatibilidades com o runtime Workers Cloudflare | início do projeto |
| Zustand para estado | Simples, pequeno, persiste facilmente no localStorage sem boilerplate | início do projeto |
| Preços em centavos (INTEGER) | Evita erros de ponto flutuante em cálculos monetários | início do projeto |
| Datas como TEXT 'YYYY-MM-DD' | SQLite não tem tipo DATE nativo; TEXT ordenável funciona bem | início do projeto |
| Relação 1:1 pro↔salão | Modelo de negócio: cada profissional gerencia um único salão | início do projeto |
| Assinatura em test mode | Gateway de pagamento ainda não integrado; R$150/mês é o plano definido | início do projeto |
| `_redirects` no `client/public/` | SPA routing no Cloudflare Pages (/*  /index.html  200) | início do projeto |

---

## Convenções Estabelecidas

- **Nomenclatura:** camelCase em TypeScript; rotas da API em `/api/kebab-case`
- **IDs:** gerados com `nanoid()` no worker — strings únicas sem UUID
- **Timestamps:** `INTEGER` (Unix epoch em ms) no D1
- **Moeda:** sempre `price_cents` / `amount_cents` — nunca `price` float
- **Token:** armazenado em localStorage como `af_salon_token`; auth store persiste como `af-salon-auth`
- **CORS:** worker só aceita requests do `FRONTEND_URL` env var
- **Role guard:** `requireRole('professional')` no middleware do worker para rotas do portal pro

---

## Contexto de Negócio

- **Usuário cliente:** pessoa que quer agendar serviços de beleza (manicure, cabelo, barbearia) sem ligar para o salão
- **Usuário profissional:** manicure, cabeleireira ou barbeiro autônomo — ou salão pequeno — que quer agenda digital
- **Tipos de salão:** `nail` (manicure), `hair` (cabelo/escova), `barber` (barbearia) — campo `type` em `salons`
- **Monetização:** profissionais pagam R$150/mês; clientes são gratuitos
- **Prazo:** projeto pessoal em evolução — sem prazo fixo
- **Restrições:** Cloudflare free tier — Workers 100k req/dia, D1 5GB storage

---

## Problemas Resolvidos Anteriormente

| Problema | Solução aplicada |
|----------|-----------------|
| bcryptjs incompatível com Workers runtime | Hash SHA-256 custom com salt `'af-nail-salt'` em `middleware/auth.ts` |
| SPA routing 404 no Cloudflare Pages | `client/public/_redirects` com `/* /index.html 200` |
| Proxy CORS em dev | `vite.config.ts` proxia `/api` → `http://localhost:8787` |

---

## Instruções Permanentes para o Claude

1. Ler este arquivo e o `CLAUDE.md` no início de cada sessão antes de qualquer alteração
2. Atualizar "O que está funcionando" quando uma feature for concluída
3. Registrar em "Decisões Tomadas" qualquer escolha técnica nova com data e motivo
4. Manter Cloudflare como stack de deploy — não migrar para Vercel, AWS ou outro provider sem discussão
5. Preços sempre em centavos — nunca introduzir floats para dinheiro
6. `JWT_SECRET` nunca em texto plano no código ou wrangler.toml de produção — usar `wrangler secret put`
7. Todo texto exibido ao usuário deve estar em português brasileiro
8. Datas como `TEXT 'YYYY-MM-DD'`, timestamps como `INTEGER` (epoch ms)

---

## Glossário do Projeto

| Termo | Significado |
|-------|-------------|
| "portal cliente" | Seção `/app/*` para quem agenda serviços |
| "portal profissional" / "portal pro" | Seção `/pro/*` para manicures (requer assinatura) |
| "conectar ao salão" | `POST /api/salons/:id/connect` — cria linha em `salon_clients` |
| "disponibilidade" | Horários semanais de atendimento por `day_of_week` (0=dom, 6=sáb) |
| "slot" | Horário disponível calculado: disponibilidade menos agendamentos existentes |
| "assinatura" | `subscriptions.status = 'active'` — R$150/mês, atualmente test mode |
| "reminder_2d / reminder_2h" | Tipos de notificação automática (lembrete 2 dias / 2 horas antes) |
| "test mode" | Assinatura que aprova automaticamente sem gateway de pagamento real |
| "price_cents" | Preço em centavos (ex: R$85,00 = 8500) |

---

## Última Atualização

- **Atualizado em:** 2026-06-25
- **Por:** Claude Code
- **O que mudou:** Primeira versão do arquivo criada após documentação completa do projeto via engenharia reversa.
