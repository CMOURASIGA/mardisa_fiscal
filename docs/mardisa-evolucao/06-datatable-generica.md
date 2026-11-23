# 06 — DataTable genérica (DRY das 7 tabelas)

## Contexto

`table-users/sale/purchase/report/enterprise/database/cod-component.tsx` repetem ~120 linhas:
sorting + `globalFilter` + paginação 10 + `Skeleton` + empty-state (ver `table-purchase-component.tsx:108-228`).
Dados tipados como `any[]` (`:28`).

## Alvo

`src/components/DataTable.tsx` genérico `<TData>`: recebe `columns + data + loading + searchPlaceholder`,
entrega toolbar, tabela, empty-state, paginação e contador.

## Passo a passo

1. Criar `DataTable.tsx` extraindo o miolo de `table-purchase-component.tsx` (toolbar `Input`, `Table`, `Skeleton 5 linhas`, footer com contador + Anterior/Próximo).
2. Migrar as 7 tabelas para o componente (1 por vez, começando por purchase como piloto).
3. Tipar linhas (ex. `PurchaseNote { chNFe, dhRecbto, cProd, xProd }`) em vez de `any`; datas com `toLocaleDateString("pt-BR")` centralizado.
4. Padronizar `pageSize: 10` e mensagens "Nenhum(a) ... encontrado(a).".

## Critérios de aceite

- [ ] Nenhuma tabela com `useReactTable` inline duplicado; só `columns` + `fetch` por tabela.
- [ ] Busca, ordenação, paginação e skeleton idênticos nas 7 telas.
- [ ] `tsc` sem `any` nas linhas.

## Riscos

- Colunas com `cell` custom (datas, badges) — preservar no `columns` de cada tabela.

## Estimativa

10–14 h.
