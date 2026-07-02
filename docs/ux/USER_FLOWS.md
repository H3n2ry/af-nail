# USER_FLOWS.md — Fluxos do Usuário
## Af.nail

---

## 1. Fluxo de Cadastro — Cliente

```
Abrir app
    │
    ├── [sem token] ──→ /login
    │                       │
    │              ┌────────┴──────────┐
    │              │ Tem conta? Sim → login  │
    │              │ Não → /register        │
    │              └────────────────────────┘
    │                         │
    │              Preencher: nome, e-mail, senha, role=client
    │                         │
    │              POST /api/auth/register
    │                         │
    │              Salva token + user no localStorage
    │                         │
    └── /app ←────────────────┘
```

---

## 2. Fluxo de Cadastro — Profissional

```
/pro/register
    │
    Preencher: nome, e-mail, senha, role=professional
    │
    POST /api/auth/register
    │
    Login automático
    │
    /pro/subscription (sem assinatura ativa)
    │
    "ASSINAR" → POST /api/subscription/activate (test mode)
    │
    /pro/create-salon (sem salão)
    │
    Preencher: nome do salão, descrição, endereço
    │
    POST /api/salons
    │
    /pro (dashboard da profissional)
```

---

## 3. Fluxo de Agendamento (Cliente)

```
/app → campo de busca → digitar nome do salão
    │
    Resultados em tempo real (debounce 400ms)
    │
    Clicar no salão → /app/salon/:id
    │
    Ver profissionais e serviços
    │
    Clicar em "AGENDAR" em um serviço
    │
    BookingFlow (modal):
    ┌──────────────────────────────────────────┐
    │ Passo 1: Selecionar profissional         │
    │ (lista com nome + avatar)                │
    │                                          │
    │ Passo 2: Selecionar data                 │
    │ (calendário; dias sem disponibilidade    │
    │  ficam desabilitados)                    │
    │                                          │
    │ Passo 3: Selecionar horário              │
    │ GET /api/professionals/:id/slots?date=X  │
    │ → slots disponíveis como chips           │
    │ ┌──────┐ ┌──────┐ ┌──────┐             │
    │ │ 9:00 │ │10:00 │ │11:00 │ ...         │
    │ └──────┘ └──────┘ └──────┘             │
    │                                          │
    │ Confirmar → POST /api/appointments       │
    └──────────────────────────────────────────┘
    │
    Agendamento criado (status: confirmed)
    Notificações reminder_2d + reminder_2h criadas
    │
    Toast de sucesso → fecha modal
```

---

## 4. Fluxo de Gestão de Agenda (Profissional)

```
/pro → dashboard (resumo do dia)
    │
    ┌─────────────────────────────────────────────┐
    │  /pro/agenda                                │
    │                                             │
    │  [DIA] [SEMANA] [MÊS]  ←── tabs            │
    │                                             │
    │  Visualização DIA:                          │
    │  08:00 ─────────────────                    │
    │  09:00 ┌─────────────────────────────────┐ │
    │        │ Maria Silva — Manicure simples   │ │
    │        │ R$ 45,00 · confirmado            │ │
    │        └─────────────────────────────────┘ │
    │  10:00 ─────────────────                    │
    │  11:00 ┌─────────────────────────────────┐ │
    │        │ Ana Costa — Manicure + Pedicure  │ │
    │        └─────────────────────────────────┘ │
    │                                             │
    │  Clicar no card:                            │
    │  → Modal com detalhes                       │
    │  → [CONCLUIR] ou [CANCELAR]                │
    └─────────────────────────────────────────────┘
```

---

## 5. Fluxo de Configuração (Profissional — primeiro uso)

```
/pro (sem disponibilidade e sem serviços)
    │
    ┌─── 1. Configurar serviços (/pro/services)
    │    → + NOVO SERVIÇO
    │    → Nome, preço, duração, descrição
    │    → Salvar
    │
    └─── 2. Configurar disponibilidade (/pro/availability)
         → Toggle de dias da semana
         → Para cada dia ativo: horário início + fim
         → Salvar
         │
         Clientes já podem agendar ✅
```

---

## 6. Fluxo de Notificações

```
Agendamento criado
    │
    Sistema cria 2 notificações:
    ├── reminder_2d: scheduled_for = appointment_datetime - 2 dias
    └── reminder_2h: scheduled_for = appointment_datetime - 2 horas
    │
    Cron job (0 * * * *):
    ├── SELECT WHERE sent_at IS NULL AND scheduled_for <= NOW()
    └── UPDATE SET sent_at = NOW() (marca como enviado)
    │
    Cliente acessa /app/notifications:
    ├── "Lembrete: sua manicure é amanhã às 14h"
    └── Badge no sino mostra contagem de não lidas

    Badge some ao clicar → PATCH /api/notifications/:id/read
```

---

## 7. Pontos de Fricção Identificados

| Ponto | Fricção | Melhoria Sugerida |
|-------|---------|------------------|
| Assinatura antes de criar salão | Profissional paga antes de ver o produto | Permitir tour do portal antes de cobrar |
| Sem verificação de e-mail | Qualquer e-mail pode se cadastrar | Adicionar confirmação de e-mail no cadastro |
| Booking flow — 3 passos em modal | Pode ser longo em mobile | Considerar página separada para steps |
| Disponibilidade — configuração manual | Precisa configurar 7 dias manualmente | Botão "copiar horário para todos os dias úteis" |
| Notificações sem entrega real | Usuário não recebe push/e-mail | Integrar Web Push API ou e-mail transacional |
