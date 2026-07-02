# THREAT_MODEL.md — Modelo de Ameaças
## Af.nail · v1.0.0

> Metodologia STRIDE aplicada ao contexto de PWA React + Cloudflare Workers + D1.

---

## 1. Ativos a Proteger

| Ativo | Valor | Localização |
|-------|-------|-------------|
| Dados pessoais dos usuários | 🔴 Crítico | D1 `users` |
| JWT_SECRET | 🔴 Crítico | `wrangler.toml [vars]` — deve ser secret |
| Histórico de agendamentos | 🟡 Alto | D1 `appointments` |
| Dados de faturamento | 🟡 Alto | D1 `subscriptions` |
| Token JWT dos usuários | 🟡 Alto | localStorage do browser |
| Senhas hashadas | 🟡 Alto | D1 `users.password_hash` |

---

## 2. Vetores de Ataque por STRIDE

### S — Spoofing (Falsidade de Identidade)

| Ameaça | Probabilidade | Impacto | Status |
|--------|--------------|---------|--------|
| Login com credenciais roubadas (credential stuffing) | Média | Alto | ⚠️ Sem rate limit ou captcha |
| Token JWT forjado (secret vazado) | Baixa | Crítico | ⚠️ JWT_SECRET potencialmente em texto no wrangler.toml |
| Registro com e-mail de terceiro | Alta | Baixo | ⚠️ Sem verificação de e-mail implementada |

### T — Tampering (Adulteração)

| Ameaça | Probabilidade | Impacto | Status |
|--------|--------------|---------|--------|
| Editar serviço de outro profissional | Baixa | Médio | ⚠️ Verificar se routes/services.ts valida posse |
| Alterar status de agendamento de outro profissional | Baixa | Alto | ⚠️ Verificar se routes/appointments.ts valida posse |
| Injeção SQL via campos de texto | Baixa | Alto | ✅ D1 usa prepared statements (`.bind()`) |
| XSS via campos de nome/descrição | Baixa | Médio | ⚠️ React escapa por padrão; verificar dangerouslySetInnerHTML |

### R — Repudiation (Repúdio)

| Ameaça | Probabilidade | Impacto | Status |
|--------|--------------|---------|--------|
| Profissional nega ter cancelado agendamento | Média | Médio | ⚠️ Sem audit log de mudanças de status |
| Cliente nega ter feito agendamento | Baixa | Baixo | ⚠️ Sem log de IP/timestamp de criação exposto |

### I — Information Disclosure (Vazamento)

| Ameaça | Probabilidade | Impacto | Status |
|--------|--------------|---------|--------|
| JWT_SECRET exposto no repo | **Alta** | **Crítico** | ⚠️ Se wrangler.toml estiver commitado com o valor real |
| Dados de outros usuários via endpoint mal configurado | Baixa | Alto | ⚠️ Verificar se GET /appointments filtra por user_id |
| Hash SHA-256 + salt fixo → rainbow table | Média | Alto | ⚠️ Salt fixo `'af-nail-salt'` é público no código |
| Token no localStorage exposto via XSS | Baixa | Alto | ⚠️ Sem HttpOnly cookie; mitigado pela ausência de XSS |

### D — Denial of Service

| Ameaça | Probabilidade | Impacto | Status |
|--------|--------------|---------|--------|
| Esgotar free tier do Worker (100k req/dia) | Baixa | Alto | ⚠️ Sem rate limiting |
| Spam de cadastros | Baixa | Médio | ⚠️ Sem captcha |
| Spam de agendamentos | Baixa | Médio | ⚠️ Sem validação de slots duplicados no mesmo horário |

### E — Elevation of Privilege

| Ameaça | Probabilidade | Impacto | Status |
|--------|--------------|---------|--------|
| Cliente acessando rotas de profissional | Baixa | Alto | ✅ `requireRole('professional')` no middleware |
| Profissional sem assinatura acessando portal pro | Baixa | Médio | ✅ `RequireProSubscription` no frontend |
| Ativar assinatura sem pagar | Alta | Alto | ⚠️ Test mode — qualquer um ativa gratuitamente |

---

## 3. Priorização de Riscos

| # | Risco | Severidade | Prioridade |
|---|-------|-----------|-----------|
| 1 | JWT_SECRET em texto no wrangler.toml | Crítico | 🔴 Imediato |
| 2 | Hash SHA-256 + salt fixo | Alto | 🔴 Antes do lançamento |
| 3 | Sem verificação de posse em UPDATE/DELETE | Alto | 🔴 Antes do lançamento |
| 4 | Sem rate limiting no login | Médio | 🟡 Próximo sprint |
| 5 | Assinatura em test mode | Alto | 🟡 Antes de cobrar |
| 6 | Sem verificação de e-mail | Baixo | 🟢 Backlog |
