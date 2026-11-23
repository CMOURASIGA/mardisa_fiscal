# 04 — Geração de Arquivo (alinhar ao Upload)

## Contexto

`src/components/GenerateFile.tsx` duplica estrutura do Upload e usa `fetch` direto +
`alert()` (`generateProdutoFile:50-81`, `generatePedidoFile:83-106`), ignorando `services/api.tsx` e `sonner`.

## Alvo

Mesmo padrão visual do item 02 (`Card`, `Tabs` Produto/Pedido, `toast`), download via `api` (blob),
sem `alert`, com `EnterpriseBanner` compartilhado.

## Passo a passo

1. Reescrever JSX como no item 02: `Card`, `Tabs` Produto/Pedido.
2. Trocar `fetch(${apiUrl}/download/...)` por `api.get(url, { responseType: "blob" })` + helper `downloadBlob(blob, filename)`.
3. Produto: loading + `toast`; erro 500 com `error` do backend em vez de `alert`.
4. Pedido: mês como `Select` 1–12 (nomes em pt-BR), ano como `Input number` com validação (ex. 2000–ano atual+1); só habilita "Gerar" se válido (`isPedidoFormValid` já existe `:108`).
5. Reutilizar `EnterpriseBanner` do item 02 + hook do item 03.

## Critérios de aceite

- [ ] Nenhum `alert()`; erros via toast + mensagem inline.
- [ ] Nome do arquivo `pedido_{mês}_{ano}.zip` / `produto_file.zip` mantido (ou padrão novo confirmado).
- [ ] Validação impede mês 13, ano vazio.

## Riscos

- Endpoints `bulk_v1/bulk_v2` sem tipos — conferir contrato (query `month/year`, auth header).

## Estimativa

8–10 h.
