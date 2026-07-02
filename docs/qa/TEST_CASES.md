# TEST_CASES.md — Casos de Teste por Funcionalidade
## Af.nail · v1.0.0

---

## 1. Autenticação

### TC-AUTH-01: Cadastro de cliente
- **Passos:** `/register` → preencher nome, e-mail, senha, role=client → confirmar
- **Esperado:** Redireciona para `/app`; dados salvos em localStorage

### TC-AUTH-02: Cadastro de profissional
- **Passos:** `/pro/register` → preencher nome, e-mail, senha, role=professional
- **Esperado:** Redireciona para `/pro/subscription`

### TC-AUTH-03: Login com credenciais válidas
- **Esperado:** Token JWT armazenado; redirect correto por role (client → `/app`, professional → `/pro`)

### TC-AUTH-04: Login com senha errada
- **Esperado:** Mensagem de erro em português; usuário permanece na tela de login

### TC-AUTH-05: E-mail duplicado no cadastro
- **Esperado:** Erro 409; mensagem clara; nenhuma conta duplicada criada

### TC-AUTH-06: Logout
- **Esperado:** localStorage limpo; redirect para `/login`; próxima abertura vai para login

### TC-AUTH-07: Token expirado
- **Passos:** Manipular localStorage com token expirado
- **Esperado:** Redirect automático para login ao tentar acessar rota protegida

---

## 2. Portal Cliente — Busca e Conexão

### TC-CLIENT-01: Busca de salões
- **Input:** Digitar "Ana" no campo de busca
- **Esperado:** Resultados aparecem com debounce; salões com "Ana" no nome listados

### TC-CLIENT-02: Busca sem resultados
- **Input:** Texto que não corresponde a nenhum salão
- **Esperado:** Mensagem "nenhum salão encontrado"; sem crash

### TC-CLIENT-03: Conectar ao salão
- **Passos:** Abrir página do salão → "CONECTAR"
- **Esperado:** Salão aparece nos favoritos; chamada `POST /api/salons/:id/connect` executada

### TC-CLIENT-04: Ver serviços do salão
- **Esperado:** Lista de serviços com nome, preço (R$) e duração em minutos

---

## 3. Booking Flow (Agendamento)

### TC-BOOK-01: Fluxo completo de agendamento
- **Passos:** Serviço → "AGENDAR" → selecionar profissional → selecionar data → selecionar slot → confirmar
- **Esperado:** Agendamento criado; aparece em `/app/appointments` com status "confirmado"

### TC-BOOK-02: Slots calculados corretamente
- **Pré-condição:** Profissional com disponibilidade seg-sex 9h-18h, serviços de 60min
- **Esperado:** Slots de 09:00, 10:00, ..., 17:00 disponíveis em dia útil

### TC-BOOK-03: Slot já ocupado não aparece
- **Pré-condição:** Agendamento existente às 10:00
- **Esperado:** 10:00 não aparece na lista de slots disponíveis

### TC-BOOK-04: Dia sem disponibilidade
- **Pré-condição:** Profissional sem disponibilidade no domingo
- **Esperado:** Nenhum slot disponível ao selecionar domingo

### TC-BOOK-05: Agendamento cria notificações
- **Esperado:** Após agendar, 2 notificações criadas no banco (reminder_2d + reminder_2h)

---

## 4. Portal Profissional

### TC-PRO-01: Assinatura test mode
- **Passos:** `/pro/subscription` → "ASSINAR"
- **Esperado:** `subscription.status = 'active'`; redirect para `/pro/create-salon`

### TC-PRO-02: Criar salão
- **Passos:** Preencher nome e endereço → salvar
- **Esperado:** Salão criado com slug único; redirect para `/pro`

### TC-PRO-03: Adicionar serviço
- **Passos:** `/pro/services` → "+ NOVO SERVIÇO" → preencher dados → salvar
- **Esperado:** Serviço aparece na lista; disponível para clientes agendarem

### TC-PRO-04: Editar preço de serviço
- **Passos:** Editar serviço existente → mudar preço
- **Esperado:** Preço atualizado; agendamentos anteriores mantêm o preço original (`price_cents` salvo no appointment)

### TC-PRO-05: Configurar disponibilidade
- **Passos:** `/pro/availability` → ativar segunda a sexta, 9h-18h → salvar
- **Esperado:** Slots disponíveis calculados a partir da disponibilidade salva

### TC-PRO-06: Agenda — visualização por dia
- **Esperado:** Agendamentos do dia listados em ordem de horário

### TC-PRO-07: Agenda — visualização por semana
- **Esperado:** Grid semanal com agendamentos posicionados no dia correto

### TC-PRO-08: Concluir agendamento
- **Passos:** Agenda → agendamento → "CONCLUÍDO"
- **Esperado:** Status muda para "completed"; aparece no dashboard de ganhos

### TC-PRO-09: Cancelar agendamento
- **Passos:** Agenda → agendamento → "CANCELAR"
- **Esperado:** Status muda para "cancelled"; notificação enviada ao cliente

### TC-PRO-10: Dashboard de ganhos — hoje
- **Esperado:** Total de agendamentos concluídos hoje com soma dos preços em R$

### TC-PRO-11: Dashboard de ganhos — mês
- **Esperado:** Total do mês com gráfico por dia da semana

---

## 5. Notificações

### TC-NOTIF-01: Badge atualiza após novo agendamento
- **Passos:** Cliente agenda serviço
- **Esperado:** Badge do sino no portal pro incrementa; notificação "new_booking" visível

### TC-NOTIF-02: Marcar como lida
- **Passos:** Clicar na notificação
- **Esperado:** `is_read = true`; badge decrementa

### TC-NOTIF-03: Notificações isoladas por usuário
- **Esperado:** Usuário A não vê notificações do usuário B

---

## 6. Casos de Borda Globais

| Caso | Comportamento Esperado |
|------|----------------------|
| Sem conexão com internet | Mensagem de erro; sem crash |
| Worker retorna 500 | Mensagem genérica em português |
| Token expirado | Redirect automático para login |
| Campos obrigatórios em branco | Validação no formulário; não envia request |
| Preço = 0 | Erro de validação; não permitir serviço gratuito sem intenção |
| Disponibilidade sem intervalo (fim ≤ início) | Erro de validação |
| Agendar em horário do passado | Idealmente bloquear na UI |
