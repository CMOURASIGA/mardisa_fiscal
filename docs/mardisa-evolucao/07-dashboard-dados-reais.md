# 07 — Dashboard com dados reais

## Contexto

`src/routes/private/home.tsx:43-76` — 4 stats hardcoded `value: "0"`, `change: "+0%"`.

## Alvo

Cards com contagens reais por empresa (compras, vendas, relatórios, arquivos), `Skeleton` no loading,
links mantidos.

## Passo a passo

1. Criar `src/hooks/useDashboardStats.ts`: com `enterpriseId` do item 03, buscar em paralelo
   (`/fetch-buy/:id`, `/fetch-sale/:id`, relatórios, uploads) — confirmar endpoints de contagem com backend; fallback: `data.length`.
2. `home.tsx`: trocar `stats` estático por estado do hook; `Card` com `Skeleton` enquanto carrega; erro → "—" + toast discreto.
3. `change/trend`: calcular mês atual vs anterior se API permitir; senão remover "este mês" placeholder e exibir total + "Ver mais".
4. Manter `quickActions` e bloco admin como estão.

## Critérios de aceite

- [ ] Números mudam ao trocar empresa; zeros reais mostram empty-state honesto.
- [ ] Sem layout shift (skeleton no lugar do número).

## Riscos

- Pode exigir endpoint agregado no backend — orçar à parte se não existir.

## Estimativa

6–10 h (se endpoints existirem; +backend à parte caso contrário).
