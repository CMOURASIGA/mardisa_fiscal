# 01 — Seletor de Empresas (padronização estética)

## Contexto

`src/components/EnterpriseSelector.tsx` renderizado em `src/components/Sidebar.tsx:100-102`.

## Problema

- Dropdown artesanal (`dropdownOpen`, botão `bg-gray-700`, texto `▲/▼`) — `EnterpriseSelector.tsx:75-103`.
- Cores hardcoded fora do tema; quebra dark-mode (resto do app usa `bg-card`, `text-muted-foreground`).
- Sem busca, loading, estado vazio ou `aria-expanded`.
- `if (minimized) return null` (`:72`) — perde contexto com sidebar recolhida.
- Fetch próprio em vez de usar `EnterpriseContext`.

## Alvo

Seletor shadcn (`Select` ou `Popover + Command`) com busca por razão social, `Skeleton` no loading,
ícones `Building2 / ChevronsUpDown / Check`, versão compacta quando `minimized`.

## Passo a passo

1. `src/components/EnterpriseSelector.tsx` — reescrever:
   - Trocar `<button className="bg-gray-700...">` por `SelectTrigger`/`SelectContent` (ou `Popover`+`Command` se lista > 20).
   - `▲/▼` → `ChevronsUpDown` (lucide); item selecionado → `Check`.
   - Loading: `Skeleton`; vazio: "Nenhuma empresa encontrada".
   - `minimized=true`: renderizar avatar/sigla + tooltip em vez de `null`.
   - Consumir hook de `03-hook-empresa.md` (não dar fetch local).
2. `src/components/Sidebar.tsx:100-102` — ajustar padding (`p-4` → `px-3`) e repassar `minimized`.
3. Conferir dark-mode via toggle do `Header.tsx` + mobile `Sheet`.

## Critérios de aceite

- [ ] Visual idêntico ao tema claro/escuro; sem `gray-700/blue-500` hardcoded.
- [ ] Busca filtra por razão social; Enter/click seleciona e dispara `enterpriseChanged` via contexto (sem `window.dispatchEvent` após item 03).
- [ ] Sidebar recolhida mantém indicador da empresa.
- [ ] `npm run build` passa.

## Riscos

- Lista grande sem paginação → usar `Command` com scroll (`max-h-60 overflow-y-auto` já existe, manter).
- Papel `admin` usa `/enterprises`, user usa `/enterprises/user/` — manter regra no hook central.

## Estimativa

8–12 h (inclui estados loading/vazio + QA claro/escuro + mobile).
