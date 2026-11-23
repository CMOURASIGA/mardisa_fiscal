# 03 — Hook de Empresa (unificar lógica)

## Contexto

Lógica de "empresa selecionada" triplicada: `EnterpriseSelector.tsx:22-66`,
`UploadFile.tsx:10-50`, `GenerateFile.tsx:12-48`, mais `EnterpriseContext.tsx` com código morto
(bloco comentado `:1-41`) e endpoint divergente (`/enterprise` no contexto vs `/enterprises` no seletor).

Comunicação via `window.dispatchEvent(new Event("enterpriseChanged"))` — frágil, sem tipagem.

## Alvo

Hook único `useSelectedEnterprise()` (ou store zustand — `zustand` já é dependência):
`{ enterpriseId, enterprise, enterprises, loading, select(id) }`, persistindo `selected_enterprise_id`.

## Passo a passo

1. Criar `src/hooks/useSelectedEnterprise.ts`:
   - Estado inicial lê `localStorage selected_enterprise_id`.
   - Fetch lista (`/enterprises` se admin, `/enterprises/user/` se user) + fetch detalhe `/enterprises/:id`.
   - `select(id)` persiste + atualiza estado (troca o `dispatchEvent`).
2. Refatorar `EnterpriseSelector.tsx`, `UploadFile.tsx`, `GenerateFile.tsx` para consumir o hook; deletar listeners `enterpriseChanged`.
3. Limpar `EnterpriseContext.tsx`: remover bloco comentado, ou depreciar em favor do hook; corrigir endpoint.
4. Corrigir `useEnterpriseEffect.tsx` para usar a mesma fonte.

## Critérios de aceite

- [ ] Trocar de empresa atualiza seletor + upload + generate + tabelas sem reload.
- [ ] Sem `enterpriseChanged` no código (`grep` zerado).
- [ ] Sem bloco comentado morto.

## Riscos

- Role vem de `localStorage user` — manter mesma regra até item 05.

## Estimativa

6–8 h.
