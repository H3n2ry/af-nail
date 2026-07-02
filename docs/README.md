# 📚 Documentação — Af.nail

> Documentação gerada por engenharia reversa com metodologia SDD (IEEE 1016).
> Revisar e atualizar conforme o projeto evolui.

**Gerado em:** 2026-06-25
**Versão analisada:** 1.0.0
**Status:** Rascunho — aguarda revisão

---

## 🗂️ Estrutura da Documentação

### 🔧 Técnico
| Arquivo | Descrição |
|---------|-----------|
| [SDD.md](./tecnico/SDD.md) | Software Design Document completo (IEEE 1016) — 5 visões |
| [ARCHITECTURE.md](./tecnico/ARCHITECTURE.md) | Arquitetura monorepo, diagramas, padrões Hono + Zustand |
| [API.md](./tecnico/API.md) | Contratos da API REST (Worker) — todos os endpoints |
| [DEPENDENCIES.md](./tecnico/DEPENDENCIES.md) | Dependências, versões, riscos e licenças |
| [MEMORY.md](./tecnico/MEMORY.md) | → Aponta para `../../MEMORY.md` (raiz do projeto) |

### ⚖️ Jurídico
| Arquivo | Descrição |
|---------|-----------|
| [LEGAL.md](./juridico/LEGAL.md) | LGPD, assinatura, checklist pré-lançamento |
| [PRIVACY.md](./juridico/PRIVACY.md) | Rascunho de Política de Privacidade |
| [LICENSES.md](./juridico/LICENSES.md) | Licenças MIT/BSD/Apache das dependências |

### 🔒 Segurança
| Arquivo | Descrição |
|---------|-----------|
| [SECURITY.md](./seguranca/SECURITY.md) | Como reportar vulnerabilidades, mecanismos implementados |
| [THREAT_MODEL.md](./seguranca/THREAT_MODEL.md) | Análise STRIDE — categorias de ameaças priorizadas |
| [CHECKLIST_SEGURANCA.md](./seguranca/CHECKLIST_SEGURANCA.md) | Checklist obrigatório antes de cada deploy |

### 🧪 QA
| Arquivo | Descrição |
|---------|-----------|
| [TEST_PLAN.md](./qa/TEST_PLAN.md) | Plano de testes (cobertura atual: 0%) + roadmap |
| [TEST_CASES.md](./qa/TEST_CASES.md) | 30+ casos de teste por funcionalidade |
| [BUG_REPORT_TEMPLATE.md](./qa/BUG_REPORT_TEMPLATE.md) | Template de bug report |

### 🎨 UX
| Arquivo | Descrição |
|---------|-----------|
| [UX_GUIDELINES.md](./ux/UX_GUIDELINES.md) | Design system — cores, tipografia, componentes |
| [USER_FLOWS.md](./ux/USER_FLOWS.md) | Fluxos mapeados em ASCII + pontos de fricção |
| [ACCESSIBILITY.md](./ux/ACCESSIBILITY.md) | Nível WCAG atual, correções necessárias |

### 🎧 Suporte
| Arquivo | Descrição |
|---------|-----------|
| [FAQ.md](./suporte/FAQ.md) | Perguntas frequentes de usuários |
| [TROUBLESHOOTING.md](./suporte/TROUBLESHOOTING.md) | Problemas comuns + troubleshooting de devs |
| [ONBOARDING.md](./suporte/ONBOARDING.md) | Setup do ambiente, estrutura, armadilhas, glossário |

### 📣 Marketing
| Arquivo | Descrição |
|---------|-----------|
| [MARKETING.md](./marketing/MARKETING.md) | Elevator pitches, posts prontos |
| [BRAND_VOICE.md](./marketing/BRAND_VOICE.md) | Tom de voz, vocabulário, exemplos |
| [RELEASE_NOTES.md](./marketing/RELEASE_NOTES.md) | v1.0.0 + template + backlog de features |

---

## 📊 Resumo da Análise

| Métrica | Valor |
|---------|-------|
| Portais | 2 (cliente + profissional) |
| Tabelas D1 | 9 |
| Endpoints de API | ~25 |
| Dependências de produção (client) | 6 |
| Dependências de produção (worker) | 3 |
| Cobertura de testes | 0% |
| Pagamento | Test mode (R$150/mês, sem gateway real) |
| Notificações | Cron job (sem entrega real — FCM/email pendente) |

---

## 🔄 Como Manter Atualizada

- `MEMORY.md` (raiz) → atualizar ao final de cada sessão de desenvolvimento
- `RELEASE_NOTES.md` → atualizar a cada versão publicada
- `CHECKLIST_SEGURANCA.md` → executar antes de cada deploy
- `TEST_CASES.md` → adicionar novos casos ao implementar features
- `API.md` → atualizar ao criar novos endpoints ou tabelas
