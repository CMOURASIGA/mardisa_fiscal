# 05 — Guards + Auth/API (correção crítica)

## Contexto

- `src/routes/guards.tsx:15` libera `["admin", "local-admin"]`, mas `Sidebar.tsx:50` e `home.tsx:41` usam `"admin-local"`. Uma das duas está errada → risco de bloquear admin legítimo ou liberar rota `adminRoute/TableCod`.
- `services/api.tsx:7-22` só injeta token (duas chaves: `accessToken`/`access`), sem interceptor de resposta/refresh.
- `LoginPage.tsx:42-49` usa `fetch` + `VITE_API_URL_LOGIN` separado do `baseURL` da `api`.

## Alvo

Roles unificadas + interceptor 401 com refresh + logout global; login via `api`.

## Passo a passo

1. Definir fonte única: `src/lib/roles.ts` (`isAdmin(role)`, tipo `Role = "admin" | "admin-local" | "user"` — confirmar nome canônico com backend).
2. Corrigir `guards.tsx`, `Sidebar.tsx:50`, `home.tsx:41`, `adminRoute.tsx` para usar o helper.
3. `services/api.tsx`: adicionar interceptor de resposta — em 401 tenta `POST /auth/refresh/` com `refreshToken`, repete request; se falhar, limpa storage + redirect `/auth/login`.
4. `LoginPage.tsx`: trocar `fetch` por `api.post("/auth/login/")`; unificar env (`VITE_API_URL` + path) ou documentar as duas URLs; manter `accessToken/refreshToken/user`.
5. `Header.tsx:36-41` logout: limpar também `selected_enterprise_id`.

## Critérios de aceite

- [ ] `grep admin-local|local-admin` mostra um padrão só.
- [ ] Token expirado renova 1x sem deslogar; refresh inválido desloga e vai ao login.
- [ ] Login funciona com erro amigável (sem expor detalhe técnico).

## Riscos

- Confirmar com backend: nome exato da role e rota de refresh.

## Estimativa

6–8 h.
