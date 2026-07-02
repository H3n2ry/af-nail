# LEGAL.md — Af.nail

> Análise técnica das implicações legais. Não substitui consultoria jurídica.

---

## 1. Dados Pessoais e LGPD (Lei 13.709/2018)

O app coleta dados pessoais de usuários brasileiros em ambos os portais:

| Dado coletado | Onde armazenado | Base legal sugerida |
|--------------|-----------------|---------------------|
| Nome e e-mail | `users` | Consentimento / execução de contrato |
| Telefone (opcional) | `users.phone` | Consentimento |
| Senha (hash) | `users.password_hash` | Execução de contrato |
| Histórico de agendamentos | `appointments` | Consentimento / contrato |
| Histórico de pagamentos | `subscriptions` (profissionais) | Consentimento / contrato |
| Foto de avatar | `users.avatar_url` | Consentimento |

**Ações recomendadas antes do lançamento:**
- [ ] Criar Política de Privacidade acessível no app
- [ ] Adicionar checkbox de consentimento no cadastro
- [ ] Implementar "Excluir minha conta e dados" no perfil
- [ ] Definir canal de contato para exercício de direitos (e-mail)
- [ ] Definir política de retenção (ex: deletar dados 30 dias após solicitação)

---

## 2. Relação de Prestação de Serviços

O af.nail é um **marketplace intermediador** entre clientes e profissionais. Implicações:

- O app não é responsável pela qualidade do serviço prestado pela manicure
- A cobrança da assinatura (R$150/mês) configura relação de prestação de serviço digital com o profissional
- Exige **Termos de Uso** separados para clientes e profissionais
- Cancelamento de assinatura deve seguir o CDC: direito de arrependimento em 7 dias para contratações online

---

## 3. Pagamento e Assinatura (R$150/mês)

O sistema de assinatura está em **test mode** — sem gateway de pagamento real. Antes de cobrar de verdade:

- [ ] Integrar gateway homologado (Stripe, PagSeguro, Mercado Pago)
- [ ] Emitir nota fiscal / recibo para profissionais (obrigatório para serviço digital)
- [ ] Definir política de reembolso
- [ ] Informar claramente que a assinatura é recorrente (CDC Art. 49)
- [ ] Implementar cancelamento acessível no próprio app (proibido exigir ligação/e-mail para cancelar)

---

## 4. Google Play / App Store

O app é PWA — não está nas lojas. Se for publicar:

| Plataforma | Exigência |
|-----------|-----------|
| Play Store | Política de Privacidade obrigatória para apps que coletam dados |
| Play Store | Seção "Data Safety" — declarar dados coletados |
| App Store | Rótulo de privacidade obrigatório (equivalente ao Data Safety) |
| Ambas | Modalidade de pagamento de assinatura deve usar billing in-app se vendido pelas lojas |

---

## 5. Termos de Uso dos Serviços Terceiros

| Serviço | Ponto crítico |
|---------|---------------|
| Cloudflare Workers | Dados processados em edge nodes globais — verificar região do D1 |
| Cloudflare D1 | Free tier: 5GB storage, 100k reads/dia — sem SLA |
| Vercel (frontend) | Free tier sem SLA; verificar política de dados |
