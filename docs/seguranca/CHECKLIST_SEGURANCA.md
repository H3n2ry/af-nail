# CHECKLIST DE SEGURANÇA — Pré-Deploy
## Af.nail

> Executar este checklist antes de cada release em produção.

---

## 🔴 Crítico — Bloqueia o Deploy

- [ ] **JWT_SECRET configurado via secret** — `wrangler secret put JWT_SECRET` (não em texto no wrangler.toml)
- [ ] **Nenhuma senha ou secret commitada** no repositório — verificar `git log --all -S 'JWT_SECRET'`
- [ ] **HTTPS em todos os endpoints** — nenhuma URL `http://` no código de produção
- [ ] **CORS restrito** — `FRONTEND_URL` aponta para o domínio de produção real

---

## 🟡 Alto — Deve ser Verificado

- [ ] **Verificar posse em UPDATE/DELETE** — routes de services, appointments, availability verificam que o recurso pertence ao usuário autenticado
- [ ] **GET /appointments filtra por user_id** — cliente não vê agendamentos de outros
- [ ] **`tsc --noEmit` sem erros** — `cd client && npx tsc --noEmit`
- [ ] **Worker compila sem erros** — `cd worker && npx tsc --noEmit`
- [ ] **Sem `console.log` com dados pessoais** — `grep -r "console.log" worker/src/ | grep -i "email\|password\|token"`
- [ ] **Inputs validados** — preço > 0, duração > 0, day_of_week 0-6, role válido

---

## 🟢 Recomendado

- [ ] **Verificar dependências desatualizadas** — `npm outdated` em client/ e worker/
- [ ] **Schema D1 aplicado em produção** — `wrangler d1 execute af-nail-db --file=schema.sql`
- [ ] **`_redirects` presente em `client/public/`** — SPA routing no Pages
- [ ] **FRONTEND_URL no wrangler.toml** aponta para o domínio correto

---

## Deploy Worker

- [ ] `cd worker && npm run deploy`
- [ ] Verificar URL retornada do worker
- [ ] Testar `GET https://af-nail-worker.SEU.workers.dev/api/auth/me` — deve retornar 401

---

## Deploy Frontend (Cloudflare Pages / Vercel)

- [ ] `cd client && echo "VITE_API_URL=URL_DO_WORKER/api" > .env.production`
- [ ] `npm run build` — sem erros de TypeScript
- [ ] Deploy para Pages/Vercel
- [ ] Acessar URL de produção e testar login + agendamento
- [ ] Verificar console do browser — sem erros de CORS

---

## Pós-Deploy

- [ ] Testar fluxo completo: cadastro → login → buscar salão → agendar
- [ ] Testar portal pro: cadastro → assinar → criar salão → adicionar serviço → configurar disponibilidade
- [ ] Monitorar Cloudflare Dashboard por erros nas primeiras 24h
- [ ] Atualizar `RELEASE_NOTES.md` com as mudanças desta versão
- [ ] Atualizar `MEMORY.md` com o estado atual

---

## Histórico de Execuções

| Data | Versão | Executado por | Resultado |
|------|--------|--------------|-----------|
| — | 1.0.0 | — | Pendente primeiro deploy oficial |
