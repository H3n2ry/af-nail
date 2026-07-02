# ACCESSIBILITY.md — Acessibilidade
## Af.nail

---

## 1. Nível WCAG Atual (Estimado)

**Nível estimado: A parcial** — React renderiza HTML semântico por padrão, mas sem implementação explícita de acessibilidade.

---

## 2. O que está Implementado

### Pelo React automaticamente
- ✅ HTML semântico (`<button>`, `<input>`, `<label>`) nas páginas principais
- ✅ Foco de teclado em campos de formulário
- ✅ Botões com área de toque adequada (definida pelas classes Tailwind `py-3`)

### Pelo design
- ✅ Contraste alto: texto `#1A1219` sobre fundo `#F7F3F5` → ratio ~15:1 (passa AAA)
- ✅ Texto de botão branco sobre `#C9607A` → ratio ~4.5:1 (passa AA)
- ✅ Status de agendamento usa texto + cor (não apenas cor)

---

## 3. O que Precisa ser Corrigido para WCAG 2.1 AA

### Prioridade Alta

| Item | Problema | Solução |
|------|---------|---------|
| Ícones decorativos sem `aria-hidden` | Screen reader lê ícones desnecessariamente | `aria-hidden="true"` em ícones puramente visuais |
| Botões só com ícone | Sem label de acessibilidade | `aria-label="Cancelar agendamento"` |
| Modal de booking | Sem gestão de foco (focus trap) | Implementar focus trap ao abrir modal; fechar com ESC |
| Campos sem `label` associado | Alguns inputs podem usar só placeholder | `<label htmlFor>` em todos os campos |
| Slots de horário | `<div>` clicável sem role | Usar `<button>` ou `role="button"` + `tabIndex={0}` |

### Prioridade Média

| Item | Problema | Solução |
|------|---------|---------|
| Calendário de datas | Navegação por teclado complexa | Usar biblioteca acessível (react-datepicker com aria-labels) |
| Toast de erro/sucesso | Não anunciado para screen readers | `role="alert"` ou `aria-live="assertive"` |
| Loading states | Spinner sem texto alternativo | `aria-label="Carregando..."` + `aria-busy="true"` |
| Badge de notificações | Número não anunciado dinamicamente | `aria-label="3 notificações não lidas"` |

---

## 4. Como Testar

```bash
# Extensão axe DevTools no Chrome
# Chrome → Extensões → axe DevTools → Analyze

# Verificar contraste
# https://webaim.org/resources/contrastchecker/
# Foreground: #1A1219, Background: #F7F3F5 → ~15:1 ✅
# Foreground: #FFFFFF, Background: #C9607A → ~4.5:1 ✅

# Testar navegação por teclado
# Tab por todas as interações; Enter/Space em botões; ESC em modais
```

---

## 5. Checklist Pré-Lançamento

- [ ] Navegar todo o app apenas com teclado (Tab + Enter)
- [ ] Testar com screen reader (NVDA/JAWS no Windows, VoiceOver no Mac)
- [ ] Todos os botões têm label acessível (texto ou aria-label)
- [ ] Modal de agendamento tem focus trap
- [ ] Toasts são anunciados com `role="alert"`
- [ ] Calendário é navegável por teclado
- [ ] Imagens decorativas têm `alt=""`
- [ ] App funciona com zoom de 200% sem scroll horizontal
