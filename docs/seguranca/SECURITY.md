# SECURITY.md — Política de Segurança
## Af.nail

---

## Como Reportar uma Vulnerabilidade

Se você encontrar uma vulnerabilidade de segurança, **não abra uma issue pública**.

Entre em contato:
- **E-mail:** afd3vs@gmail.com
- **Assunto:** `[SECURITY] Af.nail - <descrição breve>`

**O que incluir:** descrição, passos para reproduzir, impacto potencial, sugestão de correção.

**Prazo de resposta:** confirmação em até 72 horas.

---

## Mecanismos de Segurança Implementados

### Autenticação
- ✅ JWT (HS256) com expiração de 7 dias
- ✅ Token verificado no middleware do Worker em todas as rotas protegidas
- ✅ `role` incluída no token — verificada por `requireRole('professional')`

### Senhas
- ⚠️ Hash customizado SHA-256 + salt fixo `'af-nail-salt'` em `middleware/auth.ts`
- ⚠️ `bcryptjs` está importado mas não é usado no hash atual
- **Recomendação:** migrar para bcryptjs real com salt gerado por conta

### Autorização
- ✅ Gating de subscription: `RequireProSubscription` no ProLayout
- ✅ Gating de salão: `RequireProSalon` no ProLayout
- ✅ `requireRole('professional')` no middleware do worker para rotas do portal pro
- ⚠️ Sem verificação de posse de recurso (ex: profissional pode editar serviços de outro salão se souber o ID?)

### Comunicação
- ✅ HTTPS em todos os endpoints (Cloudflare Workers + Vercel)
- ✅ CORS restrito ao `FRONTEND_URL` no worker

### Segredos
- ⚠️ `JWT_SECRET` deve ser configurado via `wrangler secret put` — não em texto no wrangler.toml

---

## O que Precisa ser Implementado

| Item | Prioridade | Descrição |
|------|-----------|-----------|
| Migrar para bcryptjs real | 🔴 Alta | SHA-256 + salt fixo é vulnerável a rainbow table |
| JWT_SECRET via wrangler secret | 🔴 Alta | Não colocar em [vars] de repo público |
| Verificar posse de recursos | 🟡 Média | Garantir que profissional só edita/deleta seus próprios serviços/slots |
| Rate limiting | 🟡 Média | Sem proteção contra brute force no login |
| Input validation | 🟡 Média | Validar ranges (preço > 0, duração > 0, day_of_week 0-6) |
| Content-Security-Policy | 🟢 Baixa | Adicionar headers no Cloudflare Pages |

---

## Boas Práticas para Contribuidores

1. **Nunca commitar `JWT_SECRET`** no wrangler.toml — usar `wrangler secret put`
2. **Validar todos os inputs** antes de inserir no D1
3. **Não logar dados pessoais** — sem `console.log` com e-mail ou senha
4. **Verificar posse** antes de UPDATE/DELETE — garantir que o recurso pertence ao usuário autenticado
5. **HTTPS obrigatório** — nunca usar URLs `http://` em produção
