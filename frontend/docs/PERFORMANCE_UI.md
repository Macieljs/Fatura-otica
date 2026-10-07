# Performance de UI — padrões e anti-padrões

Guia para animações, layout e estado persistido no frontend. Origem: correção da fluidez da sidebar (2026-10-06, branch `fix/sidebar-fluidity`). Consultar antes de criar ou revisar componentes animados (sidebar, drawers, painéis, accordions, tooltips).

## 1. Diagnóstico rápido

| Sintoma | Causa provável | Ver |
| --- | --- | --- |
| Texto aparece cortado/"D…", "Dash…" durante animação | Container muda de largura e `truncate` recalcula a cada frame | §2.2 |
| Página inteira engasga ao abrir/fechar painel | Animação de `margin`/`width`/`left` em elemento que empurra o layout | §2.1, §2.3 |
| Lista "pula" verticalmente ao alternar estado | Elemento alterna `h-0` ↔ altura natural | §2.4 |
| Salto visual ao carregar (abre de um jeito e muda) | Estado lido de `localStorage` no React → divergência SSR/hidratação | §3 |
| Badge/atalho cortado na borda | Largura fixa "mágica" (`w-[174px]`) que não bate com o espaço real | §2.2 |

Medir sempre em produção (`npm run build:frontend` + `next start`) com DevTools → Performance. O `npm run dev` é bem mais lento e engana.

## 2. Animações

### 2.1 Animar só `transform` e `opacity`
São compostas na GPU, sem layout nem pintura por frame. **Evitar** transição de `width`, `height`, `margin`, `padding`, `left/top`.

Padrão "faixa visível" (usado na sidebar): o elemento mantém largura fixa e desliza; o conteúdo desliza em sentido oposto para manter os ícones no lugar.

```css
#painel, #painel-conteudo { transition: transform 280ms cubic-bezier(0.16, 1, 0.3, 1); }
#painel { width: 16rem; overflow: hidden; contain: layout paint; }
html[data-painel="recolhido"] #painel          { transform: translateX(-184px); } /* 256 - 72 */
html[data-painel="recolhido"] #painel-conteudo { transform: translateX(184px); }
```

### 2.2 Geometria do conteúdo estável
- O conteúdo interno não deve depender da largura que está animando. Mantenha o link/linha com **largura constante** e anime uma **camada de fundo absoluta** se o destaque precisar mudar de tamanho.
- Texto em `flex-1 min-w-0` dentro de um pai de largura constante. Não usar larguras em px "calculadas na mão".
- Esconder texto com `opacity` (nunca `w-0`/`display` alternando durante a transição).
- Fade com atraso só ao **mostrar**: `opacity-100 duration-200 delay-100` / `opacity-0 duration-100`.

### 2.3 Conteúdo vizinho muda uma vez
Quando um painel fixo empurra o conteúdo principal, aplicar a nova `margin-left` **sem transição** (uma única reorganização). Se precisar suavizar, sobrepor o painel e ajustar a margem em `transitionend`.

### 2.4 Altura constante
Não alternar `h-0` ↔ auto. Manter a altura reservada (`h-5`) e trocar o conteúdo por opacidade (ex.: título de grupo ↔ divisor absoluto).

### 2.5 Outros custos
- `animate-pulse`, `backdrop-blur` e sombras grandes repintam continuamente; evitar em áreas que animam.
- `will-change` só durante a transição (classe temporária), não permanente.
- Elementos alternados por estado (`cond ? <A/> : <B/>`) desmontam/montam; preferir manter montado e alternar opacidade quando fizer parte da animação.

## 3. Estado de UI persistido sem salto e sem quebrar cache

Problema: ler `localStorage` no `useState` gera HTML diferente entre servidor e cliente (salto + aviso de hidratação). Ler **cookie** no `layout.tsx` (`cookies()`) resolve, mas torna **todas as rotas dinâmicas** (perde cache de rota/CDN e arrisca HTML compartilhado com estado de outro usuário). **Não usar cookie para preferência visual.**

Padrão adotado (ver `frontend/context/SidebarContext.tsx`):
1. Script inline no `<head>` lê `localStorage` e grava um atributo no `<html>` **antes da pintura**; `<html suppressHydrationWarning>`.
2. Visual (larguras, margens, deslocamentos) dirigido por CSS a partir do atributo — correto já na primeira pintura.
3. React lê o atributo via `useSyncExternalStore` (`getServerSnapshot` = padrão), e a ação atualiza atributo + `localStorage` + notifica assinantes.
4. Não chamar `setState` dentro de `useEffect` para sincronizar (regra `react-hooks/set-state-in-effect`).

```tsx
// layout.tsx
<html lang="pt-BR" suppressHydrationWarning>
  <head><script dangerouslySetInnerHTML={{ __html: SIDEBAR_INIT_SCRIPT }} /></head>
```

Observações:
- Constantes importadas por Server Components não podem vir de módulo `"use client"` (vira referência de cliente). Strings como o script inline são exceção somente porque são serializadas no próprio módulo cliente; em caso de dúvida, use módulo neutro.
- O que depende do estado **dentro** do React (ex.: `title`, botões alternados) ainda troca logo após a hidratação; mantenha o que é visível na primeira pintura no CSS.

## 4. Checklist de revisão

- [ ] Transições só em `transform`/`opacity`?
- [ ] Texto/linhas com largura constante durante a animação?
- [ ] Nenhum `h-0`/`w-0` alternando como parte da animação?
- [ ] Conteúdo vizinho sem transição de margem?
- [ ] Estado persistido sem `localStorage` em `useState` e sem `cookies()` no layout?
- [ ] Medido em build de produção (Performance, alvo 60 fps+)?
- [ ] IDs semânticos preservados (`.agents/rules/semantic-ids.md`)?

## 5. Pendências do caso sidebar

- Verificação manual completa e revisão independente pendentes (execução feita fora do workflow, a pedido do usuário).
- Se os ícones tremerem com os dois `transform` opostos, alternativa: `clip-path: inset(0 184px 0 0)` no aside.
- Usuários com cookie da versão intermediária iniciam expandidos uma vez.
