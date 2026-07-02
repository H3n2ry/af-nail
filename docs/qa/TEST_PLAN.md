# TEST_PLAN.md — Plano de Testes
## Af.nail · v1.0.0

---

## 1. Estado Atual

**Cobertura de testes:** 0% — nenhum arquivo de teste encontrado no projeto.

Todos os testes realizados até agora foram manuais (browser).

---

## 2. Escopo

### Dentro do escopo
- Testes unitários de funções utilitárias (`lib/utils.ts`, cálculo de slots)
- Testes de integração dos fluxos principais (auth, booking)
- Testes manuais de UI/UX nos dois portais

### Fora do escopo (por enquanto)
- Testes de performance (D1 edge tem latência adequada para o volume esperado)
- Testes de carga (free tier Worker não suporta carga alta)
- Testes automatizados E2E (Playwright/Cypress — a configurar)

---

## 3. Ambientes de Teste

| Ambiente | Configuração | Status |
|---------|-------------|--------|
| Local — Web | `npm run dev:client` + `npm run dev:worker` | ✅ Disponível |
| D1 local | `wrangler d1 execute --local` | ✅ Disponível |
| CI/CD | GitHub Actions (a configurar) | 🔴 Inexistente |

---

## 4. Critérios de Aceite para Deploy

**Validar manualmente antes de cada release:**

| Funcionalidade | Critério |
|--------------|---------|
| Cadastro cliente | Usuário cria conta e faz login |
| Cadastro profissional | Profissional cria conta, assina (test), cria salão |
| Busca de salões | Resultados aparecem ao digitar |
| Agendamento | Cliente completa booking flow end-to-end |
| Agenda pro | Agendamento aparece na agenda do profissional |
| Disponibilidade | Slots calculados corretamente após configurar disponibilidade |
| Serviços | CRUD completo — criar, editar, deletar serviço |
| Ganhos | Dashboard mostra total do período correto |
| Notificações | Badge atualiza após novo agendamento |

---

## 5. Plano de Implementação

### Fase 1 — Unitários (prioridade alta)

```bash
mkdir -p client/src/__tests__
mkdir -p worker/src/__tests__
```

Prioridade:
1. `worker/src/__tests__/auth.test.ts` — testar hash de senha + JWT sign/verify
2. `worker/src/__tests__/slots.test.ts` — testar cálculo de slots disponíveis
3. `client/src/__tests__/api.test.ts` — testar chamadas API com mock de fetch

### Fase 2 — Integração

1. Fluxo de cadastro + login
2. Fluxo completo de agendamento

---

## 6. Comandos

```bash
# Vitest (recomendado para projetos Vite)
cd client && npx vitest

# Worker (Cloudflare Workers test environment)
cd worker && npx wrangler dev --test
```
