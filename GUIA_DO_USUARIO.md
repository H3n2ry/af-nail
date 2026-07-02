# 💅 Af.nail — Guia do Usuário

---

## Criando sua conta

### Como cliente

1. Acesse o app e toque em **CRIAR CONTA**
2. Preencha: nome, e-mail, telefone (opcional) e senha
3. Em "Tipo de conta", selecione **Cliente**
4. Confirme e faça login

### Como profissional (manicure / salão)

1. Acesse `/pro/register`
2. Preencha: nome, e-mail e senha
3. Em "Tipo de conta", selecione **Profissional**
4. Após o login, você será levada para a tela de **assinatura**

---

## Portal da Cliente

### Buscar salões

1. Na tela inicial (`/app`), use o campo de busca para encontrar salões pelo nome
2. Os resultados aparecem em tempo real enquanto você digita
3. Toque em um salão para ver os detalhes

### Conectar a um salão

1. Na página do salão, toque em **CONECTAR**
2. O salão aparecerá sempre na sua lista de favoritos

### Agendar um serviço

1. Na página do salão, veja os serviços disponíveis com preços e duração
2. Toque em **AGENDAR** no serviço desejado
3. Escolha a profissional
4. Selecione a data e o horário disponível
5. Confirme o agendamento

### Meus agendamentos

Acesse `/app/appointments` para ver todos os seus agendamentos:
- **Confirmado** — agendado, aguardando atendimento
- **Concluído** — atendimento realizado
- **Cancelado** — cancelado pela profissional ou por você

### Notificações

Em `/app/notifications` você recebe:
- Lembrete **2 dias antes** do agendamento
- Lembrete **2 horas antes** do agendamento
- Confirmação de novo agendamento

---

## Portal da Profissional

### Assinatura

Para usar o portal profissional, é necessária uma assinatura de **R$150/mês**.

1. Após o cadastro, você será levada para a tela de assinatura
2. Toque em **ASSINAR** para ativar (test mode — sem cobrança real por enquanto)
3. Após ativar, você pode criar seu salão

### Criar o salão

1. Preencha: nome do salão, descrição e endereço
2. Um link único (slug) é gerado automaticamente
3. Salve — seu salão estará disponível para clientes buscarem

### Configurar serviços

Em `/pro/services`:
1. Toque em **+ NOVO SERVIÇO**
2. Preencha: nome, descrição, preço (R$) e duração (minutos)
3. Marque como **combo** se for um serviço composto
4. Salve — o serviço aparece imediatamente para seus clientes

### Configurar disponibilidade

Em `/pro/availability`:
1. Selecione os dias da semana que você atende
2. Para cada dia, defina o horário de início e fim
3. Salve — o app calcula os horários disponíveis automaticamente com base na duração de cada serviço

### Agenda

Em `/pro/agenda`, veja seus agendamentos em 3 visualizações:
- **Dia** — agendamentos do dia atual
- **Semana** — visão semanal
- **Mês** — visão mensal

### Clientes

Em `/pro/clients`, veja a lista de clientes que já agendaram com você, com informações de contato.

### Ganhos

Em `/pro/earnings`:
- Selecione o período: **hoje**, **semana** ou **mês**
- Veja o total de agendamentos e o faturamento
- Gráfico de ganhos por dia da semana

---

## Sistema de Notificações

As notificações são geradas automaticamente pelo sistema:

| Tipo | Quando é enviada |
|------|-----------------|
| Novo agendamento | Assim que a cliente confirma |
| Lembrete 2 dias | 2 dias antes do horário marcado |
| Lembrete 2 horas | 2 horas antes do horário marcado |
| Cancelamento | Quando a profissional cancela o agendamento |

---

## Dicas

- **Para profissionais:** configure a disponibilidade antes de divulgar o link do salão para os clientes
- **Para clientes:** conecte-se ao salão para encontrá-lo mais rápido na próxima visita
- **Preços:** os valores exibidos incluem o serviço completo — sem taxas adicionais do app
- O app funciona em qualquer navegador moderno — não precisa instalar nada
