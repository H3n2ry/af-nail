# UX_GUIDELINES.md — Diretrizes de UX
## Af.nail — Design System

---

## 1. Princípios de Design

| Princípio | Descrição |
|-----------|-----------|
| **Mobile-first** | Layout otimizado para celular; `.page-container` em toda página |
| **Feminino e elegante** | Cores suaves, tipografia serif em headings — remetem a beauty salons premium |
| **Clareza acima de tudo** | Ação principal sempre evidente em cada tela |
| **Feedback imediato** | Toda ação assíncrona tem estado de loading visível |
| **Dois mundos distintos** | Portal cliente (agenda, simplicidade) vs portal pro (gestão, controle) |

---

## 2. Paleta de Cores

```
Uso                Cor hex     Token Tailwind
─────────────────────────────────────────────
Ação principal     #C9607A     primary (rosa/mauve)
Hover              #F2A7BB     primary.light
Background suave   #FDF0F4     primary.pale
Accent / detalhe   #A0522D     accent (warm brown)

Texto principal    #1A1219     neutral.900
Texto secundário   #7A6872     neutral.500
Background página  #F7F3F5     neutral.100

Sucesso            #5C9E7F     success
Aviso              #D4A853     warning
Erro               #C0392B     error
```

**Regras:**
- Nunca usar `#ff0000` para erro — usar `error: #C0392B`
- Primary `#C9607A` exclusivo para CTAs e destaques — não usar decorativamente em excesso
- Background de página: sempre `neutral.100 (#F7F3F5)` ou branco

---

## 3. Tipografia

| Família | Uso |
|---------|-----|
| `Cormorant Garamond` (serif) | Headings, títulos de salão, nomes de serviço |
| `DM Sans` (sans-serif) | Corpo, labels, botões, dados |
| `DM Mono` (mono) | Preços, horários, códigos |

**Hierarquia:**
- `font-display` (Cormorant) — `text-2xl` ou maior
- `font-body` (DM Sans) — texto corrido
- Preços: sempre DM Mono + negrito

---

## 4. Componentes Reutilizáveis

### `.btn-primary`
- Fundo `#C9607A`, texto branco
- Border radius: `full` (pill shape)
- Padding: `px-6 py-3`
- **Nunca** usar `<button>` sem classe — sempre a classe de sistema

### `.btn-secondary`
- Borda `#C9607A`, fundo transparente
- Mesmo padding do primary

### `.btn-ghost`
- Apenas texto, sem borda
- Usado para ações destrutivas ou secundárias

### `.card`
- Fundo branco, `shadow-sm`, `rounded-lg`
- Padding interno: `p-4`

### `.input`
- Borda `#7A6872`, fundo branco
- `rounded-md`, `px-3 py-2`
- Focus: borda `#C9607A`

### `.badge-confirmed`
- Fundo verde suave + texto verde

### `.badge-completed`
- Fundo cinza + texto cinza escuro

### `.badge-cancelled`
- Fundo vermelho suave + texto vermelho

### `.slot-available`
- Fundo `primary.pale`, borda `primary.light`

### `.slot-selected`
- Fundo `primary`, texto branco

### `.slot-occupied`
- Fundo cinza, cursor not-allowed

### `.page-container`
- `max-w-xl mx-auto px-4 pb-24 min-h-screen`
- `pb-24` garante espaço para bottom nav

---

## 5. Padrões de Interação

### Loading States
- Botão de ação: spinner inline + texto "Carregando..."
- Lista de dados: skeleton cards (3-5 itens de placeholder)
- Nunca deixar tela em branco durante loading

### Feedback de Sucesso
- Toast/SnackBar na parte inferior: verde + mensagem clara
- Duração: 3 segundos

### Feedback de Erro
- Toast vermelho com mensagem em português
- Botão "Tentar novamente" quando aplicável
- **Nunca** mostrar código de erro HTTP para o usuário

### Estados Vazios
- Ícone + texto descritivo + CTA quando relevante
- Ex: "Nenhum agendamento ainda. Busque um salão e agende!"

---

## 6. O que NÃO Fazer

| ❌ Proibido | ✅ Alternativa |
|------------|--------------|
| Mensagens de erro em inglês | Sempre em português |
| Tela em branco durante loading | Skeleton ou spinner |
| Modais que não fecham com ESC | Sempre tratar onKeyDown ESC |
| Botões sem estados de hover/focus | Tailwind hover: e focus: obrigatórios |
| Texto muito pequeno em mobile | Mínimo `text-sm` (14px) |
| Formulário que perde dados ao voltar | Usar state local persistido |

---

## 7. Espaçamentos e Dimensões

```
Padding padrão de página: px-4 (16px)
Gap entre cards: gap-3 (12px)
Border radius de cards: rounded-lg (8px)
Border radius de botões: rounded-full (pill)
Altura mínima de botão: 48px (toque acessível)
Bottom nav: h-16 (64px) com pb-safe
```
