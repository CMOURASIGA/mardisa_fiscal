# 08 — Acabamento Header/Sidebar

## Contexto

- `Header.tsx:67-70` sino sem ação; `95-102` "Perfil/Configurações" sem rota.
- `Sidebar.tsx:148-157` `Sheet` mobile não fecha ao navegar; `navContent` com `isActive` via `pathname.includes` (falso positivo possível).
- `AppLayout.tsx:12-16` ok, mas `main p-6` sem breadcrumb/título padrão.

## Alvo

Header/sidebar sem botão morto; mobile fecha ao navegar; active-state exato.

## Passo a passo

1. Header: ou remover sino / ligar a `toast("Sem notificações")`, e ligar Perfil/Config a rotas reais ou remover itens (decisão de produto).
2. Sidebar: `Link onClick={() => setMobileOpen(false)}`; `isActive`: comparar rota exata (`useMatch`/`location.pathname === to` normalizado) em vez de `includes(...toLowerCase())`.
3. Opcional: `PageHeader` (título + descrição + ações) usado por tabelas/upload/generate para ritmo vertical único.

## Critérios de aceite

- [ ] Nenhum botão sem efeito; mobile fecha o menu ao trocar de página.
- [ ] Rota ativa destacada sem falsos positivos.

## Riscos

- Decisão de produto sobre notificações/perfil — travar antes de codar.

## Estimativa

4–6 h.
