# TROUBLESHOOTING.md — Resolução de Problemas
## Af.nail

---

## Para Usuários

### Problema 1: Página em branco ou erro 404 ao recarregar
**Causa:** SPA routing — o Cloudflare Pages precisa do `_redirects`.
**Solução para usuários:** Volte à URL raiz e navegue normalmente; não use F5 em rotas internas.
**Solução para dev:** Verificar `client/public/_redirects` com `/* /index.html 200`.

---

### Problema 2: Login não funciona (erro "credenciais inválidas")
**Causas possíveis:**
- Senha digitada incorretamente (o hash é case-sensitive)
- E-mail com espaço antes/depois (testar com trim)
- Conta criada como profissional tentando entrar no portal de cliente (portais separados)

**Solução:** Confirmar portal correto (`/login` para clientes, `/pro/login` para profissionais).

---

### Problema 3: Nenhum horário disponível para agendar
**Causas possíveis:**
- Profissional não configurou disponibilidade para aquele dia da semana
- Todos os horários do dia estão ocupados
- Serviço selecionado tem duração que não cabe nos horários restantes

**Solução:** Tentar outro dia da semana ou outra profissional no salão.

---

### Problema 4: Portal profissional redireciona para `/pro/subscription`
**Causa:** Assinatura não está ativa.
**Solução:** Clicar em "ASSINAR" na tela de subscription. Em test mode, a ativação é imediata.

---

### Problema 5: Portal profissional redireciona para `/pro/create-salon`
**Causa:** Salão ainda não foi criado após assinar.
**Solução:** Preencher nome e endereço do salão e salvar.

---

## Para Desenvolvedores

### Worker não inicia (`wrangler dev` falha)

```bash
# Verificar se Node.js >= 20
node --version

# Reinstalar dependências
cd worker && rm -rf node_modules && npm install

# Verificar wrangler.toml — database_id deve estar preenchido
cat wrangler.toml | grep database_id
```

---

### D1 "table not found"

```bash
# Schema não foi aplicado — executar:
wrangler d1 execute af-nail-db --local --file=schema.sql

# Para produção (sem --local):
wrangler d1 execute af-nail-db --file=schema.sql
```

---

### CORS bloqueado em desenvolvimento

```bash
# Verificar se o vite.config.ts tem proxy configurado:
# proxy: { '/api': { target: 'http://localhost:8787' } }

# Verificar se o worker está rodando na porta 8787:
cd worker && npm run dev
# Deve mostrar: "Ready on http://localhost:8787"
```

---

### Build do frontend falha com erro de TypeScript

```bash
cd client
npx tsc --noEmit  # Ver erros específicos
npm run build     # Recriar
```

---

### `wrangler d1 create` retorna "database already exists"

```bash
# O banco já existe — pegar o database_id do dashboard Cloudflare
# Em vez de criar, listar:
wrangler d1 list

# Copiar o id e colocar no wrangler.toml
```

---

### Deploy do Worker retorna "account_id not found"

```bash
# Verificar se está logado na Cloudflare:
wrangler whoami

# Se não estiver:
wrangler login
```

---

### Token expirado no D1 local após reiniciar

O D1 local usa um banco SQLite em `.wrangler/state/`. Dados persistem entre runs mas são locais.

```bash
# Para resetar o banco local:
rm -rf .wrangler/state/
wrangler d1 execute af-nail-db --local --file=schema.sql
```
