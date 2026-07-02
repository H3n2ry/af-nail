# RELEASE_NOTES.md — Notas de Versão
## Af.nail

---

## Versão 1.0.0 — Lançamento Inicial
**Data:** [a definir]

### 🎉 Novidades

**Portal Cliente:**
- Busca de salões por nome (com debounce automático)
- Conexão a salões favoritos
- Agendamento online em 3 passos: serviço → horário → confirmar
- Histórico de agendamentos com status em tempo real
- Notificações de lembrete (2 dias e 2 horas antes)

**Portal Profissional:**
- Criação e gestão do perfil do salão
- Gerenciamento completo de serviços (nome, preço, duração, combo)
- Configuração de disponibilidade semanal por dia e horário
- Agenda visual (dia, semana e mês)
- Dashboard de ganhos por período (hoje, semana, mês)
- Lista de clientes
- Notificações de novos agendamentos e cancelamentos

**Sistema:**
- Autenticação JWT com expiração de 7 dias
- Dois portais separados com gating por role
- Modelo de assinatura mensal (R$150/mês, test mode)
- Cálculo automático de slots disponíveis
- Cron job de lembretes automáticos (hourly)

---

## Template para Versões Futuras

```markdown
## Versão X.Y.Z
**Data:** DD/MM/AAAA

### 🎉 Novidades
[Novas funcionalidades]

### ✨ Melhorias
[Funcionalidades existentes aprimoradas]

### 🐛 Correções
[Bugs corrigidos]

### ⚠️ Breaking Changes
[Mudanças que requerem ação do usuário]
```

---

## Backlog de Features

| Feature | Benefício |
|---------|-----------|
| Gateway de pagamento real | Monetizar a assinatura de profissionais |
| Push notifications / e-mail | Clientes realmente recebem lembretes |
| Verificação de e-mail no cadastro | Segurança e validação de usuários |
| Cancelamento de agendamento pelo cliente | Autonomia para o cliente |
| Recuperação de senha | Acessibilidade básica |
| Múltiplos salões por conta pro | Suporte a redes de salões |
| Avaliações de profissionais | Confiança e descoberta |
| PWA install prompt | Experiência de app nativo |
| Modo offline | Funcionamento sem internet |
| Exportação de agenda (PDF/CSV) | Backup e relatórios |
