# Fiscal ST | Handoff técnico do frontend

Versão: 23/11/2026. Produto: Fiscal ST / 7C Consulting.
Repositório: https://github.com/CMOURASIGA/mardisa_fiscal
**Código do frontend modernizado: develop.** Este documento também está disponível na branch frontend como handoff, mas **o código legado dessa branch não incorpora as alterações descritas**. A branch backend contém Django. Não confundir as branches e não promover para main sem homologação.

> Documento baseado nos arquivos de código da develop. Não implica execução bem-sucedida de build, lint, testes ou integração com banco oficial.

## 1. Objetivo e restrição principal

Este frontend foi criado para demonstrar a modernização visual e operacional de uma aplicação fiscal legada, mantendo o backend Django original como referência de regras e dados. A proposta separa:
- Consulta real por endpoints Django de somente leitura, com credenciais SELECT no MySQL.
- Importação simulada no navegador, com resultados mínimos no localStorage, sem envio do XML ao backend.

O produto **não grava nos bancos oficiais da Mardisa**. O backend de demonstração grava apenas suas configurações locais e a autenticação SQLite de homologação.

## 2. Stack técnica verificada

| Assunto | Tecnologia e observação |
|---|---|
| Linguagem | TypeScript 5.7, TSX, módulos ES |
| UI | React 19, ReactDOM 19 |
| Servidor/build | Vite 6 e plugin React |
| CSS | Tailwind CSS 4, CSS variables em src/styles.css, tw-animate-css |
| Biblioteca de componentes | src/components/ui, construídos sobre primitives Radix, com estilo shadcn |
| Utilitários de estilos | clsx, tailwind-merge, class-variance-authority |
| Ícones | lucide-react |
| Rotas | TanStack Router com file-based routing e geração de src/routeTree.gen |
| Tabelas | TanStack Table 8; filtros, ordenação e paginação no cliente |
| HTTP | Axios para consultas; fetch para login e configuração técnica |
| Alertas | sonner |
| Testes e qualidade | Vitest, jsdom, Testing Library, TypeScript strict, Biome |
| Outras dependências | zustand, next-themes e outras constam em package.json; nem todas estão necessariamente em uso |

Não é Next.js e não conecta diretamente o navegador ao MySQL.

## 3. Estrutura de implementação

| Caminho | Responsabilidade |
|---|---|
| src/main.tsx | Inicialização React, RouterProvider, EnterpriseProvider e Toaster |
| src/routes/__root.tsx | Outlet raiz |
| src/routes/private/route.tsx | Layout privado da aplicação |
| src/routes/private/home.tsx | Dashboard, atalhos, mensagens de erro/sem dados |
| src/routes/private/connectionSettings.tsx | Formulários de conexão de gestão e conexão fiscal por empresa |
| src/routes/private/TableEnterprise.tsx | Consulta de empresas |
| src/routes/private/TableUser.tsx | Consulta de usuários do banco de gestão |
| src/routes/private/TableDatabase.tsx | Consulta de metadados de bancos sem senha |
| src/routes/private/TablePurchase.tsx | Notas de compra |
| src/routes/private/TableSale.tsx | Notas de venda |
| src/routes/private/TableReport.tsx | Apuração e relatórios |
| src/components/LoginPage.tsx | Tela de login JWT Django |
| src/components/Header.tsx | Barra superior, troca de usuário, saída |
| src/components/Sidebar.tsx | Menu retrátil, grupos de rotinas e navegação mobile |
| src/components/EnterpriseSelector.tsx | Seleção da empresa obtida via API |
| src/components/ReadOnlyCatalog.tsx | Listagem genérica sem CRUD |
| src/components/UploadFile.tsx | Parser XML simplificado e simulação local |
| src/components/GenerateFile.tsx | Exportação JSON da simulação local |
| src/components/tables/ | Tabelas de compras, vendas e relatórios |
| src/services/api.tsx | Cliente Axios com allowlist GET e tradução de rotas |
| src/hooks/useSelectedEnterprise.ts | Lista, detalhes e recarga da seleção |
| src/hooks/useDashboardStats.ts | Contagens e estados assíncronos do dashboard |
| src/context/EnterpriseContext.tsx | Estado da empresa e persistência do ID |
| src/routes/guards.tsx | Guards de interface para login/admin |
| src/styles.css | Tokens e regras de estilo |
| public/logo-7c.svg | Marca em uso na UI, provisória; revisar arquivo oficial |

## 4. Padrão de componentes e visual

Identidade 7C Consulting: laranja principal #EB5C00, grafite #121C25, fundo #F6F8FA. Menu lateral escuro com recolhimento; navegação mobile com Sheet; cabeçalho claro; cards e tabelas de leitura. A marca passou de 7C Software para 7C Consulting nas telas e título.

Reutilizar os componentes locais Button, Card, Input, Label, Select, Table, Sheet e Dialog em vez de duplicar soluções. Tokens centrais em src/styles.css. O arquivo de logo SVG atual foi feito como recurso provisório, sem confirmação de equivalência com a arte oficial; revisar os favicons e manifesto.

Menus:
- Cadastros e acessos (consulta): Usuários, Empresas, Bancos de Dados.
- Processamento fiscal: Notas de compra, Notas de venda, Apuração/Relatórios, Simular importação XML, Exportar simulação.
- Administração técnica: Conexão de leitura, visível apenas ao admin na UI.

Não exibir ações CRUD legadas como disponíveis. Consultas reais e simulações locais devem ser claramente distintas, com o aviso de simulação apenas nas rotinas apropriadas.

## 5. Rotas

- /auth/login: autenticação.
- /private/home: dashboard.
- /private/TableEnterprise, /private/TableUser, /private/TableDatabase: cadastros consultivos.
- /private/TablePurchase, /private/TableSale, /private/TableReport: documentos e apuração.
- /private/uploadFile: simulação XML.
- /private/generateFile: exportação local JSON.
- /private/connectionSettings: configuração técnica.

Rotas são declaradas por arquivos; src/routeTree.gen é gerado pelo TanStack Router. Não editar manualmente o arquivo gerado.

## 6. Sessão e empresa selecionada

LoginPage usa POST /auth/login/ e espera um objeto com access, refresh e user. Atualmente accessToken, refreshToken, user e selected_enterprise_id ficam no localStorage. Trocar usuário/Sair remove autenticação, seleção e fiscal-st:simulacao-v1; há redirecionamento para o login. Os guards requireAuth/requireAdmin protegem a navegação, **mas não são autorização de servidor**. O backend das novas APIs locais usa JWT e IsAdminUser, vinculando o modo atual a contas staff do SQLite.

EnterpriseProvider oferece selectedEnterprise e setSelectedEnterprise. O seletor consulta as empresas e recebe o evento fiscal-enterprises-updated após atualização na tela técnica. O ID enviado pelo browser não prova permissão sobre uma empresa.

PENDÊNCIA DE SEGURANÇA: rever armazenamento de JWT no localStorage, XSS/CSP, expiração de sessão e autorização por empresa antes de produção.

## 7. HTTP e variáveis de ambiente

O arquivo .env.local do **frontend** deve conter somente URLs públicas, por exemplo:

~~~dotenv
VITE_API_URL=http://127.0.0.1:8000/api/v1
VITE_API_URL_LOGIN=http://127.0.0.1:8000
~~~

Nunca colocar DB_PASSWORD, SECRET_KEY ou credencial MySQL em variável VITE_: Vite incorpora valores ao bundle cliente.

src/services/api.tsx mapeia as solicitações GET da interface às APIs de leitura:

| Solicitação do frontend | Endpoint Django local |
|---|---|
| GET /enterprises ou /enterprises/user | GET /local-data/enterprises/ |
| GET /enterprises/{id} | GET /local-data/enterprises/{id}/ |
| GET /fetch-buy/{id} | GET /local-data/fiscal/{id}/buy/ |
| GET /fetch-sale/{id} | GET /local-data/fiscal/{id}/sale/ |
| GET /fetch-report/{id} | GET /local-data/fiscal/{id}/report/ |
| GET /user | GET /local-data/metadata/users/ |
| GET /databases | GET /local-data/metadata/databases/ |

Contratos: listas em {data: [...]}; detalhes de empresa como objeto; mensagens de falha em {detail: ...}. Operações não previstas na allowlist Axios são rejeitadas. A configuração de conexões é uma exceção expressa: POST por fetch para /local-admin/readonly-config/ e /local-admin/tenant/{id}/, que grava **apenas configuração local no backend**, não registros fiscais.

IMPORTANTE: o bloqueio Axios não protege requisições fetch independentes nem acesso direto à API; manter validações no servidor.

## 8. Importação simulada, sem banco

UploadFile.tsx: seleção Compra/Venda, arquivos .xml, limite de 100 arquivos e 5 MB por arquivo. DOMParser rejeita XML inválido, DTD/ENTITY e exige marcações NFe/nfeProc. Lê alguns campos como nNF, xNome, vNF. **Isso não equivale a importação fiscal ou validação XSD/assinatura/tributos.**

O resumo fica em localStorage na chave fiscal-st:simulacao-v1: enterpriseId (ou null), type, at e results. O arquivo bruto não é salvo. GenerateFile.tsx exporta esse resumo em JSON no navegador, não gera ZIP/XML do backend legado. A simulação pode ser executada sem empresa selecionada; a sessão local é apagada no logout.

## 9. Instalação local

Pré-requisitos: Node.js/npm compatíveis com Vite 6, Git e backend Django separado.

~~~powershell
cd C:\Projetos\mardisa_fiscal
git fetch origin
git switch develop
git pull --ff-only origin develop
npm install
npm run dev
~~~

Acessar http://localhost:3000. O backend Django local deve ser iniciado em C:\Projetos\mardisa_fiscal_backend, conforme documentação operacional.

Para qualidade e aceitação:

~~~powershell
npm run build
npm run test
npm run lint
npm run check
~~~

Em package.json, build = vite build && tsc; scripts de test/lint/check também estão definidos. **Não há evidência de PASS para esses comandos neste handoff.** Coletar logs e corrigir falhas. O repositório não deve ser promovido para produção com gates pendentes.

## 10. Pendências obrigatórias do desenvolvedor

1. Validar build, TypeScript, lint, Vitest e fluxo end-to-end.
2. Configurar credenciais MySQL exclusivamente SELECT, com autorização do cliente.
3. Comparar empresas, notas e apuração com o sistema antigo para as mesmas bases.
4. Implementar paginação e contadores SQL: a API local recusa mais de 2.000 registros por consulta. O dashboard não tem contagem global garantida nesse limite.
5. Auditar cálculos de apuração, chassi duplicado, valores monetários, arredondamentos e datas.
6. Finalizar autorização por empresa e perfis não administrativos.
7. Substituir armazenamento local em texto puro de senhas MySQL por gestão segura de segredos e revisar ACLs locais.
8. Revisar segurança da sessão no browser, CORS/CSP e XSS.
9. Revisar logo/favicons oficiais, mobile, acessibilidade, erros e estados vazios.
10. Evidenciar que nenhuma operação de importação/alteração faz chamadas aos bancos oficiais.

Referências: docs/DEMONSTRACAO-OPERACIONAL-7C.md (develop), docs/HANDOFF-OPERACIONAL-FISCAL-ST.md (develop), docs/VALIDACAO-LEITURA-FISCAL.md (branch backend).

**Classificação:** frontend de referência para homologação técnica. Não homologado para produção.
