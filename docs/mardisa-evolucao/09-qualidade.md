# 09 — Qualidade base (testes, lint, 404, ErrorBoundary)

## Contexto

- `npm run test` (vitest) configurado mas nenhum `*.test.*` no repo.
- `src/components/Page.tsx` vazio; sem rota `*` (404); sem ErrorBoundary no `__root.tsx`.
- `LoginPage.tsx:24-29` auto-redirect comentado; erros de `console.error` sem tratamento.

## Alvo

Rede mínima: 1 suite exemplo + lint no fluxo + 404 + ErrorBoundary.

## Passo a passo

1. Teste piloto (vitest + testing-library, já instalados): `useSelectedEnterprise` ou `DataTable` (filtro + empty-state).
2. `__root.tsx`: adicionar `errorComponent` (ErrorBoundary) + rota `*` com card 404 + botão "Voltar ao início".
3. Login: decidir auto-redirect se `user` + token válido; remover código comentado.
4. Rodar `npm run check` (biome) e zerar erros nos arquivos tocados; documentar `format/lint` no README (hoje genérico do TanStack).

## Critérios de aceite

- [ ] `npm run test` passa com ≥1 suite útil; `npm run build` + `npm run check` verdes.
- [ ] Rota inexistente mostra 404; erro de render mostra fallback em vez de tela branca.

## Riscos

- Nenhum — item isolado, pode entrar em qualquer lote.

## Estimativa

6–8 h.
