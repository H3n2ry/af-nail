# BUG_REPORT_TEMPLATE.md — Template para Reportar Bugs
## Af.nail

> Copie e preencha este template ao reportar um bug.

---

```markdown
## Descrição do Bug
[Descreva o comportamento incorreto em uma ou duas frases]

## Passos para Reproduzir
1. Abrir o app em [dispositivo/browser]
2. Acessar [portal cliente / portal profissional]
3. Navegar para [tela]
4. [Ação específica]
5. Observar o comportamento incorreto

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que está acontecendo de errado]

## Ambiente
- Portal: [ ] Cliente (/app)  [ ] Profissional (/pro)
- Browser: [ ] Chrome  [ ] Safari  [ ] Firefox  [ ] Edge
- Dispositivo: [ex: iPhone 13 / Android Galaxy A54 / Desktop Windows]
- URL onde ocorreu: [ex: /app/salon/abc123]

## Frequência
- [ ] Sempre (100%)
- [ ] Frequente (>50%)
- [ ] Ocasional (<50%)
- [ ] Uma vez (não reproduzível)

## Evidências
[Screenshots, console do browser, logs do Worker]

## Logs de Erro (se disponível)
```
Cole aqui erros do console do browser ou stack trace
```

## Severidade
- [ ] 🔴 Crítico — app inutilizável ou dados corrompidos
- [ ] 🟠 Alto — funcionalidade principal quebrada
- [ ] 🟡 Médio — funcionalidade secundária afetada ou workaround existe
- [ ] 🟢 Baixo — problema cosmético ou de usabilidade menor
```

---

## Exemplos de Bugs Históricos

| Bug | Causa | Solução | Data |
|-----|-------|---------|------|
| SPA 404 ao recarregar rota `/app/salon/abc` | Cloudflare Pages não tinha `_redirects` | Adicionar `client/public/_redirects` com `/* /index.html 200` | — |
| CORS blocked no dev | Vite não proxiava `/api` | `vite.config.ts` proxy `/api` → `http://localhost:8787` | — |
