# LEGAL.md — Conformidade Legal
## Af.nail · v1.0.0

> **Disclaimer:** Este documento não substitui consultoria jurídica. É uma análise técnica das implicações legais identificadas no código.

> **Regra geral para o Claude Code:** Antes de implementar qualquer feature com implicação legal (pagamentos, dados pessoais, geolocalização, compartilhamento com terceiros), verificar e atualizar este documento.

---

## 1. Legislação Aplicável

| Lei | Aplicabilidade |
|-----|---------------|
| **LGPD** (Lei 13.709/2018) | ✅ Dados pessoais de usuários brasileiros |
| **Marco Civil da Internet** (Lei 12.965/2014) | ✅ PWA web com dados de brasileiros |
| **CDC** (Lei 8.078/1990) | ✅ Assinatura digital mensal (relação de consumo) |
| **ECA** (Lei 8.069/90) | ⚠️ Verificar restrição de idade se app for acessível a menores |

---

## 2. Dados Pessoais Coletados

| Dado | Classificação LGPD | Base Legal | Onde armazenado |
|------|--------------------|-----------|-----------------|
| Nome | Dado pessoal | Consentimento / Contrato | `users.name` |
| E-mail | Dado pessoal | Consentimento / Contrato | `users.email` |
| Telefone | Dado pessoal | Consentimento | `users.phone` |
| Senha (hash SHA-256) | Dado pessoal | Contrato | `users.password_hash` |
| Histórico de agendamentos | Dado pessoal de comportamento | Contrato | `appointments` |
| Dados de faturamento (assinatura) | Dado pessoal | Contrato | `subscriptions` |
| Avatar (opcional) | Dado pessoal (imagem) | Consentimento | `users.avatar_url` |

**Nota:** O app não coleta dados sensíveis de saúde (ao contrário do Muscle Camp).

---

## 3. Checklist Jurídico Pré-Lançamento

### Política de Privacidade
- [x] Rascunho criado em `docs/juridico/PRIVACY.md`
- [ ] Hospedar em URL permanente acessível no app
- [ ] Exibir link no cadastro e no rodapé do app

### Consentimento
- [ ] Checkbox de consentimento de termos no cadastro
- [ ] Consentimento para receber notificações (obrigatório antes de enviar push)

### Direitos do Titular (LGPD Art. 18)
- [ ] Direito de exclusão: implementar "Excluir minha conta" no perfil
- [ ] Direito de portabilidade: exportar histórico de agendamentos
- [ ] Direito de acesso: página de dados do perfil já existe ✅
- [ ] Canal de contato declarado na Privacy Policy

### Assinatura (CDC)
- [ ] Informar claramente que é cobrança recorrente (antes de ativar)
- [ ] Implementar cancelamento acessível no app (CDC proíbe exigir ligação)
- [ ] Emitir comprovante/recibo após cada cobrança
- [ ] Direito de arrependimento: 7 dias após contratação (Art. 49 CDC)
- [ ] Definir política de reembolso

---

## 4. Assinatura Digital (R$150/mês)

O modelo de assinatura está em **test mode** — sem cobrança real. Antes de cobrar:

| Item | Status |
|------|--------|
| Gateway de pagamento integrado | ⚠️ Pendente |
| Termos de serviço para profissionais | ⚠️ Pendente |
| Nota fiscal / recibo automático | ⚠️ Pendente |
| Cancelamento self-service no app | ✅ `/api/subscription/cancel` existe |

---

## 5. Transferência Internacional de Dados

| Destino | Dado enviado | Base legal |
|---------|-------------|-----------|
| Cloudflare Workers (edge global) | Processamento de requests | Cláusulas contratuais |
| Cloudflare D1 | Todos os dados do usuário | Verificar região configurada |
| Vercel (global CDN) | Apenas código estático — sem dados pessoais | N/A |

**Ação:** Verificar em qual região o D1 está armazenando dados. Preferir `wnam` (América do Norte) ou região mais próxima do Brasil disponível.

---

## 6. Retenção de Dados

| Dado | Retenção sugerida |
|------|------------------|
| Conta ativa | Indefinido enquanto ativo |
| Agendamentos históricos | Manter enquanto conta ativa |
| Conta inativa (sem login há 1 ano) | Notificar + deletar após 90 dias |
| Após solicitação de exclusão | Deletar em até 30 dias |
