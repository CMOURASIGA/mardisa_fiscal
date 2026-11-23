# Orçamento — Evolução Frontend Mardisa-FE

**Escopo:** padronização estética do Seletor de Empresas e da página de Upload + melhorias encontradas na análise do código (React + TanStack Router + shadcn/ui + Tailwind v4).

## 1. Escopo solicitado

### Item 1 — Seletor de Empresas
Reescrever `EnterpriseSelector.tsx` com shadcn (`Select`/`Popover+Command`), busca, loading, versão compacta com sidebar recolhida, tokens do tema (claro/escuro). Detalhe em `01-seletor-empresas.md`.

### Item 2 — Página de Upload
Reescrever `UploadFile.tsx` com `Card`, `Tabs` Compra/Venda, dropzone drag-and-drop, lista com remoção, progresso e `toast` (sonner). Detalhe em `02-pagina-upload.md`.

## 2. Melhorias adicionais recomendadas

- **Item 3 — Hook de empresa:** unificar `EnterpriseSelector`/`UploadFile`/`GenerateFile`/`EnterpriseContext`, remover `window.dispatchEvent("enterpriseChanged")`. Ver `03-hook-empresa.md`.
- **Item 4 — Geração de arquivo:** alinhar `GenerateFile.tsx` ao padrão do Upload, trocar `fetch`+`alert()` por `api`+`toast`. Ver `04-generate-file.md`.
- **Item 5 — Guards/Auth:** corrigir divergência `admin-local` vs `local-admin` (`guards.tsx` x `Sidebar`/`home`), interceptor 401 + refresh. Ver `05-guards-auth.md`.
- **Item 6 — DataTable genérica:** eliminar duplicação das 7 tabelas, tipar dados. Ver `06-datatable-generica.md`.
- **Item 7 — Dashboard real:** trocar stats hardcoded `"0"` (`home.tsx`) por contagens da API. Ver `07-dashboard-dados-reais.md`.
- **Item 8 — Header/Sidebar:** botões sem ação (sino, perfil), Sheet mobile que não fecha, active-state. Ver `08-acabamento-header-sidebar.md`.
- **Item 9 — Qualidade:** suite vitest piloto, 404, ErrorBoundary, biome limpo. Ver `09-qualidade.md`.

## 3. Lotes e estimativas (horas, sem valores)

| Lote | Item | Descrição | Estimativa (h) |
|------|------|-----------|----------------|
| A | 1 | Seletor de Empresas — redesign shadcn | 8–12 |
| A | 2 | Upload — redesign + dropzone + toast | 12–16 |
| B | 3 | Hook de empresa único | 6–8 |
| B | 4 | Generate alinhado ao Upload | 8–10 |
| B | 5 | Guards + Auth/API (correção crítica) | 6–8 |
| C | 6 | DataTable genérica (7 tabelas) | 10–14 |
| C | 7 | Dashboard com dados reais | 6–10 |
| C | 8 | Acabamento Header/Sidebar | 4–6 |
| C | 9 | Qualidade base (testes, 404, lint) | 6–8 |

**Totais aproximados:** Lote A: 20–28 h · Lote B: 20–26 h · Lote C: 26–38 h.

## 4. Premissas

- Segue tokens/tema atuais, sem nova identidade visual; sem mudança de backend (item 7 pode exigir endpoint agregado — a combinar).
- Validação: `npm run build` + `npm run check` + teste manual claro/escuro, mobile, perfis admin e user.
- 2 rodadas de revisão inclusas por lote.
- Estratégia detalhada de implementação futura em `docs/mardisa-evolucao/00..09`.
