# 02 — Página de Upload (padronização estética)

## Contexto

`src/components/UploadFile.tsx` via `src/routes/private/uploadFile.tsx`.

## Problema

- Card `bg-gray-50` + `bg-white shadow-lg` (`UploadFile.tsx:107-109`) — único ponto fora de `bg-background`/`bg-card`.
- Botões `bg-blue-500/bg-gray-200` (`:129-146`, `:179-186`) em vez de `Button`.
- Input file nativo (`:156-162`); sem drag-and-drop, sem remover arquivo, sem tamanho.
- Feedback só com `<p className="text-red-500/green-500">`; `sonner` instalado mas não usado.
- Estrutura duplicada com `GenerateFile.tsx:110-192`.

## Alvo

`Card + CardHeader/Content/Footer`, `Tabs` Compra/Venda, dropzone com drag-and-drop,
lista com nome/tamanho/remoção, progresso + `toast`, `Button` com `Loader2`.

## Passo a passo

1. `src/components/UploadFile.tsx` — reescrever JSX:
   - Wrapper: `Card` + `CardHeader(CardTitle+CardDescription)` + `CardContent`, mesmo padrão de `table-purchase-component.tsx:129-138`.
   - Compra/Venda: `Tabs` (`src/components/ui/tabs.tsx`) em vez de dois `<button>`.
   - Upload: dropzone (`onDrop` + `onDragOver`, `accept=".xml"`, `multiple`), input escondido + botão `outline` "Selecionar arquivos".
   - Lista: ícone `FileText`, nome, tamanho (KB/MB), botão `ghost icon` `X` para remover.
   - Envio: `Button` com `disabled={uploading}` + `Loader2 animate-spin`; sucesso/erro via `toast` (sonner) + manter mensagem inline acessível.
   - Validação: exigir empresa + tipo + ≥1 `.xml`; limite sugerido 10 MB/arquivo (confirmar com backend).
2. Extrair `src/components/EnterpriseBanner.tsx` (nome da empresa + aviso "nenhuma selecionada") e reutilizar no item 04.
3. Consumir hook do item 03 para `enterpriseId` (remover listeners de `window` após migração).

## Critérios de aceite

- [ ] Zero classes `gray-50/white/blue-500` hardcoded; dark-mode ok.
- [ ] Drag-and-drop + seleção manual funcionam; dá para remover arquivo antes de enviar.
- [ ] Erros (sem empresa, sem arquivo, 401, backend `message`) com toast + texto claro em pt-BR.
- [ ] `npm run build` passa.

## Riscos

- Backend espera `FormData(files + type lower)` (`:81-84`) — não mudar contrato sem alinhar.
- Arquivos grandes → confirmar limite e timeout do `api.post`.

## Estimativa

12–16 h (dropzone + validações + toasts + QA).
