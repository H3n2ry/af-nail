# DEPENDENCIES.md — Mapa de Dependências
## Af.nail · v1.0.0

---

## 1. Dependências de Produção — Client

| Pacote | Versão | Função | Criticidade |
|--------|--------|--------|-------------|
| `react` | ^18.3.1 | UI framework | 🔴 Crítica |
| `react-dom` | ^18.3.1 | DOM renderer | 🔴 Crítica |
| `react-router-dom` | ^6.27.0 | Roteamento SPA | 🔴 Crítica |
| `zustand` | ^5.0.0 | State management + persist | 🔴 Crítica |
| `date-fns` | ^4.1.0 | Formatação e cálculo de datas | 🟡 Alta |
| `clsx` | ^2.1.1 | Classes CSS condicionais | 🟢 Baixa |

## 2. Dependências de Produção — Worker

| Pacote | Versão | Função | Criticidade |
|--------|--------|--------|-------------|
| `hono` | ^4.6.3 | Web framework para Workers | 🔴 Crítica |
| `nanoid` | ^5.0.7 | Geração de IDs únicos | 🔴 Crítica |
| `bcryptjs` | ^2.4.3 | Hash de senha (importado; hash customizado ativo) | 🟡 Alta |

## 3. Dependências de Desenvolvimento

| Pacote | Versão | Função |
|--------|--------|--------|
| `vite` | ^5.4.10 | Build tool + dev server |
| `@vitejs/plugin-react` | ^4.3.3 | Plugin React para Vite |
| `typescript` | ^5.6.3 | Tipagem estática |
| `tailwindcss` | ^3.4.14 | Utility-first CSS |
| `postcss` | ^8.4.47 | Processador CSS |
| `autoprefixer` | ^10.4.20 | Prefixos CSS automáticos |
| `wrangler` | ^3.80.0 | Cloudflare CLI + dev server |
| `@cloudflare/workers-types` | ^4.20241022.0 | Tipos TS para Workers runtime |

---

## 4. Serviços Externos

| Serviço | Plano | Limites relevantes | Risco |
|---------|-------|-------------------|-------|
| **Cloudflare Workers** | Free | 100k req/dia, 10ms CPU por req | Sem SLA; requisições acima do limite bloqueadas |
| **Cloudflare D1** | Free | 5GB storage, 100k reads/dia, 100k writes/dia | Sem SLA |
| **Vercel** | Free (Hobby) | 100GB bandwidth/mês | Sem SLA comercial |

---

## 5. Análise de Riscos

### 🔴 Riscos Altos

| Pacote | Risco | Mitigação |
|--------|-------|-----------|
| `hono` | Versões major com breaking changes | Pin versão; testar upgrades em branch |
| `react-router-dom` | v6 → v7 tem mudanças de API | Não atualizar sem testar navegação completa |

### 🟡 Riscos Médios

| Pacote | Risco | Mitigação |
|--------|-------|-----------|
| `bcryptjs` | Pode ter incompatibilidade com Workers runtime | Hash customizado como fallback (já em uso) |
| `zustand` | v5 teve breaking changes de v4 | Não atualizar major sem verificar persist middleware |
| `date-fns` | v4 teve mudanças de API em relação v3 | Encapsular usos em funções utilitárias |

---

## 6. Licenças

| Pacote | Licença |
|--------|---------|
| `react` / `react-dom` | MIT |
| `react-router-dom` | MIT |
| `zustand` | MIT |
| `date-fns` | MIT |
| `clsx` | MIT |
| `hono` | MIT |
| `nanoid` | MIT |
| `bcryptjs` | MIT |
| `vite` | MIT |
| `tailwindcss` | MIT |
| `typescript` | Apache 2.0 |
| `wrangler` | Apache 2.0 |

Todas as licenças são permissivas — compatíveis com distribuição comercial.

---

## 7. Como Verificar Atualizações

```bash
# Client
cd client && npx npm-check-updates

# Worker
cd worker && npx npm-check-updates

# Atualizar (com cuidado em versões major)
npm update
```
