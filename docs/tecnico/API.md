# API.md — Contratos de Interface
## Af.nail · v1.0.0

> Toda a API é servida pelo Cloudflare Worker via Hono.js. Base URL: `https://af-nail-worker.SEU_SUBDOMAIN.workers.dev/api`

---

## Autenticação

Todas as rotas exceto `/api/auth/*` requerem header:
```
Authorization: Bearer <JWT>
```

Token obtido em login/register. Expira em 7 dias.

---

## 1. Auth

### POST `/api/auth/register`
```json
// Request
{ "name": "Maria Silva", "email": "maria@exemplo.com", "password": "senha123", "phone": "11999999999", "role": "client" }

// Response 201
{ "token": "eyJ...", "user": { "id": "abc123", "name": "Maria Silva", "email": "maria@exemplo.com", "role": "client" } }
```

### POST `/api/auth/login`
```json
// Request
{ "email": "maria@exemplo.com", "password": "senha123" }

// Response 200
{ "token": "eyJ...", "user": { ... } }
```

### GET `/api/auth/me` (auth)
```json
// Response 200
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "professional" },
  "salon": { "id": "...", "name": "Salão da Ana", "slug": "salao-da-ana" },
  "subscription": { "status": "active", "expires_at": 1234567890 }
}
```

---

## 2. Salões

### GET `/api/salons/search?q=<query>` (auth)
```json
// Response 200
{ "salons": [ { "id": "...", "name": "Salão da Ana", "slug": "salao-da-ana", "address": "..." } ] }
```

### POST `/api/salons` (professional)
```json
// Request
{ "name": "Salão da Ana", "description": "Especialista em nail art", "address": "Rua das Flores, 123" }

// Response 201
{ "salon": { "id": "...", "name": "...", "slug": "salao-da-ana-x4k2", ... } }
```

### GET `/api/salons/:id` (auth)
```json
// Response 200
{
  "salon": { "id": "...", "name": "...", "description": "...", "address": "..." },
  "professionals": [ { "id": "...", "name": "Ana", "avatar_url": null } ]
}
```

### POST `/api/salons/:id/connect` (client)
```json
// Response 200
{ "success": true }
```

---

## 3. Serviços

### GET `/api/services/mine` (professional)
```json
// Response 200
{ "services": [ { "id": "...", "name": "Manicure simples", "price_cents": 4500, "duration_minutes": 60, "is_combo": false } ] }
```

### GET `/api/salons/:id/services` (auth)
```json
// Response 200
{ "services": [ ... ] }
```

### POST `/api/services` (professional)
```json
// Request
{ "name": "Manicure + Pedicure", "description": "Completo", "price_cents": 8000, "duration_minutes": 90, "is_combo": true }

// Response 201
{ "service": { "id": "...", ... } }
```

### PUT `/api/services/:id` (professional)
```json
// Request (campos parciais aceitos)
{ "price_cents": 8500 }

// Response 200
{ "service": { ... } }
```

### DELETE `/api/services/:id` (professional)
```json
// Response 200
{ "success": true }
```

---

## 4. Disponibilidade

### GET `/api/professionals/:id/slots?date=YYYY-MM-DD` (auth)
```json
// Response 200
{
  "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
  "date": "2025-10-15"
}
```
Slots = horários da disponibilidade semanal do dia menos agendamentos existentes.

### PUT `/api/availability` (professional)
```json
// Request — array de 7 dias (0=dom, 6=sáb)
[
  { "day_of_week": 1, "start_time": "09:00", "end_time": "18:00", "active": true },
  { "day_of_week": 2, "start_time": "09:00", "end_time": "18:00", "active": true },
  { "day_of_week": 0, "start_time": "09:00", "end_time": "12:00", "active": false }
]

// Response 200
{ "success": true }
```

---

## 5. Agendamentos

### GET `/api/appointments?role=client` (auth)
### GET `/api/appointments?role=professional` (auth)
```json
// Response 200
{
  "appointments": [
    {
      "id": "...",
      "salon_name": "Salão da Ana",
      "client_name": "Maria",
      "professional_name": "Ana",
      "service_name": "Manicure simples",
      "scheduled_date": "2025-10-15",
      "scheduled_time": "10:00",
      "status": "confirmed",
      "price_cents": 4500
    }
  ]
}
```

### POST `/api/appointments` (client)
```json
// Request
{
  "salon_id": "...",
  "professional_id": "...",
  "service_id": "...",
  "scheduled_date": "2025-10-15",
  "scheduled_time": "10:00",
  "notes": "Prefiro cor nude"
}

// Response 201
{ "appointment": { ... } }
```
Ao criar, o worker insere automaticamente notificações `reminder_2d` e `reminder_2h`.

### PATCH `/api/appointments/:id/status` (professional)
```json
// Request
{ "status": "completed" }
// ou
{ "status": "cancelled" }

// Response 200
{ "success": true }
```

---

## 6. Notificações

### GET `/api/notifications` (auth)
```json
// Response 200
{
  "notifications": [
    {
      "id": "...",
      "type": "reminder_2h",
      "message": "Lembrete: sua manicure é amanhã às 10h",
      "is_read": false,
      "created_at": 1234567890
    }
  ],
  "unread_count": 2
}
```

### PATCH `/api/notifications/:id/read` (auth)
```json
// Response 200
{ "success": true }
```

---

## 7. Dashboard (Professional)

### GET `/api/dashboard/earnings?period=today|week|month` (professional)
```json
// Response 200
{
  "period": "week",
  "start": "2025-10-13",
  "end": "2025-10-19",
  "count": 12,
  "total_cents": 54000,
  "appointments": [ { ... } ],
  "weekly_chart": [ { "day": "Seg", "total_cents": 9000 }, ... ]
}
```

### GET `/api/dashboard/appointments?period=today|week|month` (professional)
```json
// Response 200
{
  "period": "today",
  "count": 4,
  "today_appointments": [ { ... } ]
}
```

---

## 8. Assinatura

### POST `/api/subscription/activate` (professional)
```json
// Response 200
{
  "subscription": { "status": "active", "expires_at": 1234567890 },
  "test_mode": true
}
```

### POST `/api/subscription/cancel` (professional)
```json
// Response 200
{ "subscription": { "status": "cancelled" } }
```

---

## Códigos de Erro

| Status | Significado |
|--------|-------------|
| 400 | Request inválido (campo faltando, tipo errado) |
| 401 | Token ausente ou inválido |
| 403 | Role incorreta (ex: cliente tentando criar serviço) |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: e-mail já cadastrado, slot já ocupado) |
| 500 | Erro interno do worker |

Todos os erros retornam: `{ "error": "mensagem em português" }`
