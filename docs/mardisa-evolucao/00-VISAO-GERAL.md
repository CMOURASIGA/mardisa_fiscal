# Visão Geral — Evolução Mardisa-FE

Stack: React 19 + Vite + TanStack Router (file-based) + shadcn/ui + Tailwind v4 + axios + zustand.

## Mapa dos lotes

| Lote | Itens | Foco | Pré-requisito |
|------|-------|------|---------------|
| A | 01, 02 | Padronização visual solicitada (seletor + upload) | Nenhum |
| B | 03, 04, 05 | Fundação: empresa, generate, auth/guards | Fazer junto com A se possível (mesmo fluxo) |
| C | 06, 07, 08, 09 | Escala: tabelas, dashboard, acabamento, qualidade | B pronto |

## Ordem de execução recomendada

1. `05-guards-auth.md` primeiro (correção crítica de autorização, baixo risco, alto impacto).
2. `03-hook-empresa.md` (remove `window.dispatchEvent`, centraliza estado).
3. `01-seletor-empresas.md` + `02-pagina-upload.md` + `04-generate-file.md` (UI sobre base já saneada).
4. `06-datatable-generica.md` → `07-dashboard-dados-reais.md` → `08` → `09`.

## Riscos transversais

- Dois padrões de token (`accessToken` vs `access`) e duas `VITE_*_URL` — unificar antes de mexer em telas.
- Role `admin-local` vs `local-admin` divergente — corrigir antes de testar como admin.
- Cores hardcoded (`bg-gray-700`, `bg-blue-500`, `bg-gray-50`) quebram dark-mode — trocar por tokens em todos os itens de UI.
- Nenhum teste hoje — validar cada item com `npm run build` + teste manual por empresa (admin e user comum).

## Como usar esta pasta

Cada arquivo `01..09` segue o esqueleto: Contexto → Problema → Alvo → Passo a passo por arquivo → Critérios de aceite → Riscos → Estimativa (h, sem valor).
