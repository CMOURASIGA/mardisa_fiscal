# Fiscal ST | Handoff operacional e integração

**Data de referência:** 23/11/2026  
**Produto:** Fiscal ST, 7C Consulting  
**Local desta documentação:** branch develop (frontend modernizado)  
**Backend:** branch backend do mesmo repositório, rodando em pasta separada  
**Classificação:** referência funcional para homologação pela equipe de desenvolvimento. **Não é produção homologada.**

## 1. Objetivo do trabalho

Apresentar à equipe uma nova experiência de operação do Fiscal ST baseada no legado da Mardisa. A aplicação modernizada deve consultar os dados que **já existem** nos bancos do cliente, sem alterá-los. O fluxo de importação deve ser uma simulação executada localmente no navegador, sem persistência no MySQL.

Duas operações independentes:
- **Consulta fiscal real, somente leitura:** banco de gestão + banco fiscal MySQL associado a cada empresa.
- **Simulação local:** XML de exemplo escolhido pelo usuário; resumo fica no localStorage do próprio navegador e pode ser apagado/exportado em JSON.

O backend mantém os endpoints originais para referência do legado, mas a demonstração **não deve chamá-los** para operações fiscais, pois há rotinas com INSERT/UPDATE/DELETE e uploads reais.

## 2. Arquitetura de execução

1. Frontend React/Vite em http://localhost:3000.
2. Django local em http://127.0.0.1:8000, configurado com DJANGO_SETTINGS_MODULE=nfs.settings_demo.
3. SQLite local demo_auth.sqlite3 para autenticação/usuário de homologação; não contém empresas ou dados oficiais.
4. MySQL de **gestão** consultado apenas por credenciais SELECT, informado pelo desenvolvedor na Administração técnica. Contém, conforme código do legado, api_enterprise, auth_user e api_databaseconnection.
5. MySQL **fiscal** por empresa, também com conta exclusivamente SELECT. Consultas à NFECompra, NFEVenda e apuração.
6. XML de importação processado no navegador, separado dos bancos.

NÃO usar a mesma conta administrativa de MySQL para configurar o ambiente de leitura. O DBA deverá disponibilizar credenciais com permissão SELECT sob autorização do cliente, fora desta aplicação.

## 3. Arquivos e configurações locais do backend

| Arquivo | Papel |
|---|---|
| nfs/settings_demo.py | Configuração Django local; SQLite para autenticação |
| nfs/demo_middleware.py | Bloqueia endpoints legados /api/v1/ e /enter-file-name/ na demo |
| nfs/local_admin.py | GET/POST de configuração do MySQL de gestão, teste SELECT e verificação de GRANT |
| nfs/readonly_data.py | Endpoints de empresas, metadados, vínculo de banco fiscal e consultas fiscais |
| nfs/urls.py | Mapeamento das novas rotas |
| .fiscal_readonly.local.env | Credenciais do banco de gestão no backend local |
| .fiscal_tenants.local.json | Credenciais de leitura dos bancos fiscais por empresa, no backend local |
| demo_auth.sqlite3 | Banco SQLite local de autenticação |

Os dois arquivos de credenciais estão no .gitignore da branch backend, **mas contêm senha em texto puro**. Permissões NTFS, proteção da estação e descarte após homologação são responsabilidade da equipe. Recomendável substituir por cofre de segredos antes de uso continuado. Jamais compartilhar esses arquivos ou segredos pelo chat, GitHub ou frontend.

A configuração original nfs/settings.py espera variáveis ENGINE, DB_HOST, DB_PORT, DB_NAME, DB_USER e DB_PASSWORD; esse módulo **não** é utilizado como banco de autenticação no modo demo.

## 4. Fluxo operacional proposto

### 4.1 Acesso e identidade

- Usuário abre Fiscal ST em localhost:3000.
- Login chama POST /auth/login/ no Django local.
- Django autentica a conta de homologação do SQLite e devolve JWT.
- Cabeçalho oferece Trocar usuário e Sair; ambas as opções limpam tokens, usuário, empresa selecionada e simulação local, retornando ao login.
- Não criar contas na base de produção por comandos da demo.
- Rotas de consulta do backend local exigem conta staff (IsAdminUser); isso **não** é modelo final de autorização de cliente por empresa.

### 4.2 Configuração técnica do MySQL de gestão

- Somente administração técnica local, não rotina de usuário final.
- Preencher host, porta, nome do banco de gestão, usuário SELECT e senha.
- Formulário faz POST /local-admin/readonly-config/ para Django local.
- Backend abre conexão MySQL, tenta iniciar transação read-only, executa SELECT DATABASE(), CURRENT_USER() e SHOW GRANTS FOR CURRENT_USER().
- Conta com privilégios de escrita é rejeitada. Após teste, a configuração é salva **localmente** no backend, não no banco da Mardisa.
- Ao configurar com sucesso, buscar a tabela api_enterprise e disponibilizar a lista de empresas.

A leitura do cadastro de empresas é feita por GET /local-data/enterprises/ e retorna {data: [{id, razao_social, CNPJ}, ...]}. O frontend atualiza o seletor por evento fiscal-enterprises-updated. Não cadastrar empresas fictícias para contornar conectividade.

### 4.3 Configuração fiscal por empresa

- Escolher empresa da lista real carregada do banco de gestão.
- Informar host, porta, banco fiscal, usuário SELECT e senha da conexão fiscal correspondente.
- Formulário faz POST /local-admin/tenant/{enterprise_id}/ para o **backend local**.
- Backend valida os grants e testa leitura das tabelas NFECompra e NFEVenda.
- Associação é salva em .fiscal_tenants.local.json, identificada pelo ID da empresa; **isso é apenas configuração local de acesso, não modificação em MySQL**.

Não usar automaticamente a senha de DatabaseConnection do legado: o campo é criptografado pela chave SECRET_KEY do ambiente original; a chave local aleatória não é equivalente. Evitar repassar ou descriptografar as senhas oficiais no frontend.

### 4.4 Seleção e consultas

- Após configurar gestão, o seletor exibe empresas disponíveis.
- Selecionar uma empresa muda o ID no EnterpriseContext.
- Dashboard consulta compras, vendas e relatório para o ID escolhido.
- Notas de compra: GET /local-data/fiscal/{id}/buy/. Origem: SELECT em NFECompra do banco fiscal da empresa.
- Notas de venda: GET /local-data/fiscal/{id}/sale/. Origem: SELECT em NFEVenda.
- Apuração/relatório: GET /local-data/fiscal/{id}/report/. Origem: consulta JOIN entre NFEVenda e NFECompra pelo chassi.
- Empresas: GET /local-data/enterprises/; detalhe GET /local-data/enterprises/{id}/.
- Metadados: GET /local-data/metadata/users/ e /local-data/metadata/databases/, **sem devolver senhas**.

Consultas ficam restritas ao Django local e à conta administrativa de homologação. Não disponibilizar publicamente essas rotas. Não interpretar a mera seleção de um ID como autorização para acessar aquela empresa; implementar regra por usuário/empresa antes de uso real.

### 4.5 Simulação de XML (não é importação fiscal)

- Abrir “Simular importação XML”, escolher Compra ou Venda.
- Selecionar arquivos XML no navegador (até 100, tamanho individual até 5 MB).
- DOMParser analisa a estrutura, bloqueia DTD/ENTITY, verifica identificação básica de NF-e e lê alguns campos.
- Mostrar arquivos reconhecidos, inválidos e campos básicos.
- Persistir **apenas o resumo mínimo** em localStorage["fiscal-st:simulacao-v1"].
- Arquivo original não é enviado à API nem salvo no banco.
- Pode funcionar sem empresa selecionada. Nesse caso, o resumo não fica associado a uma empresa real.
- Usuário pode limpar a simulação. Ao sair/trocar usuário, o resumo também é excluído.

Esta rotina **não** executa regras fiscais completas, cálculo ST, conferência da assinatura ou validação XSD. Não demonstrar seu resultado como importação concluída ou nota fiscal oficialmente processada.

### 4.6 Exportação local

A tela “Exportar simulação” recupera o resumo do localStorage e gera um arquivo fiscal-st-simulacao-local.json por Blob. Não chama as rotinas legadas de geração de ZIP/XML. O JSON é material demonstrativo, não arquivo fiscal válido.

## 5. Contratos HTTP para homologação

| Método e rota Django | Autorização/efeito |
|---|---|
| POST /auth/login/ | Login no SQLite local; gera JWT |
| GET /local-admin/readonly-config/ | Admin: estado sem exibir senha |
| POST /local-admin/readonly-config/ | Admin: valida MySQL gestão e grava configuração **local** |
| GET /local-data/enterprises/ | Admin: SELECT de empresas reais |
| GET /local-data/enterprises/{id}/ | Admin: SELECT detalhe da empresa |
| GET /local-admin/tenant/{id}/ | Admin: estado da conexão fiscal sem senha |
| POST /local-admin/tenant/{id}/ | Admin: valida SELECT e salva conexão **local** |
| GET /local-data/fiscal/{id}/buy/ | Admin: SELECT de compras |
| GET /local-data/fiscal/{id}/sale/ | Admin: SELECT de vendas |
| GET /local-data/fiscal/{id}/report/ | Admin: SELECT relatório |
| GET /local-data/metadata/users/ | Admin: metadados de usuários |
| GET /local-data/metadata/databases/ | Admin: metadados de conexões, sem senha |

POST na administração técnica **não escreve na base oficial**, mas **escreve arquivos de configuração no disco local do backend**. Importação XML e exportação simuladas **não fazem POST no backend**.

A instância Axios do frontend encaminha rotas GET da versão antiga para essas rotas locais, rejeitando as demais. O middleware de demonstração bloqueia /api/v1/ e /enter-file-name/ do Django, evitando a execução das rotinas legadas no contexto demo.

## 6. Limitações conhecidas que o desenvolvedor deve validar

### 6.1 Banco e integridade de dados

- **Nenhuma conexão real MySQL foi homologada nesta entrega.** O sucesso do fluxo dependerá de credenciais autorizadas e conectividade/VPN.
- Tabelas pressupostas: api_enterprise, auth_user, api_databaseconnection, NFECompra e NFEVenda. Conferir nome exato e colunas no banco real.
- Conexões fiscais são configuradas manualmente por empresa. Não há descoberta automática das credenciais criptografadas do legado.
- O endpoint fiscal usa limite MAX_ROWS=2000; acima disso retorna erro HTTP 413. Isso não é paginação e não produz total global. Implementar contagem SQL/paginação server-side e teste de volume.
- O backend JSON converte Decimal para float; conferir precisão de cálculos monetários e evitar perda de centavos.
- A consulta de relatório nova é JOIN por chassi; o algoritmo antigo cruza listas por chassi e pode apresentar resultado distinto com múltiplas notas no mesmo chassi. **Paridade de apuração não comprovada; exigir comparação e correção do join.**
- As telas de compras/vendas/relatórios devem mostrar diferença entre erro da API, ausência de registros e operação não configurada.
- Na versão de demonstração, as rotas locais são protegidas por IsAdminUser, não por autorização completa por empresa. Não expor a usuários externos sem corrigir.

### 6.2 Segurança e implantação

- Nunca usar conta MySQL que possa executar INSERT, UPDATE, DELETE, CREATE, DROP ou ALTER.
- Os testes de GRANT são defesa adicional, não substituem privilégios reais de somente leitura no banco.
- Segredos locais persistem em arquivos de texto. Restringir ACL e eliminar arquivos ao final da avaliação; considerar cofre de segredos.
- Evitar executar Django com DEBUG=True fora do computador do desenvolvedor. Restringir a interface a 127.0.0.1.
- O login de demonstração existe só no SQLite, separadamente do banco da Mardisa.
- Revisar JWT no localStorage, XSS/CSP e identificação de sessão.
- Nunca alterar main, banco oficial, rotinas de produção ou executar migrações sobre bancos de cliente sem autorização.
- Revisar logo/favicons 7C Consulting em uso.

### 6.3 UI e escopo de entrega

A interface foi modernizada e organizada, mas ainda requer testes de build, acessibilidade, mobile, mensagens de erro, tabela com volume alto, filtros e apuração. O backend legado ainda contém funções de escrita por design; **não** reutilizá-las diretamente na demonstração. Não tratar métricas indisponíveis como zero.

## 7. Roteiro de execução em Windows

Usar **duas pastas separadas** para as branches, sem trocar branches no mesmo diretório com servidor em execução.

Backend:

~~~powershell
cd C:\Projetos\mardisa_fiscal_backend
git fetch origin
git switch backend
git pull --ff-only origin backend

$env:DJANGO_SETTINGS_MODULE = "nfs.settings_demo"
# Definir SECRET_KEY estável e exclusiva para o ambiente de homologação,
# por mecanismo local seguro. Não usar senha/chave do ambiente oficial.
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000 --noreload
~~~

Se autenticação SQLite ainda não existir, consultar docs/SETUP-DEMO-ISOLADA.md na branch backend para orientar migrações e criação local do administrador **somente após confirmar ENGINE=django.db.backends.sqlite3 e NAME=demo_auth.sqlite3**.

Frontend:

~~~powershell
cd C:\Projetos\mardisa_fiscal
git fetch origin
git switch develop
git pull --ff-only origin develop
npm install
npm run build
npm run dev
~~~

No browser, acessar http://localhost:3000, autenticar e abrir Administração técnica > Conexões de leitura. Somente o responsável técnico deverá digitar credenciais, jamais o usuário de negócio.

## 8. Matriz de homologação operacional

| ID | Cenário / evidência exigida | Critério de aceite |
|---|---|---|
| H01 | Build + teste automatizado + lint | Todos PASS e logs guardados |
| H02 | Login/admin local | Entra, sai e troca usuário sem reaproveitar sessão |
| H03 | API sem banco gestão | Mensagem de configuração, sem dados fictícios |
| H04 | Conexão gestão SELECT | Valida e carrega empresas existentes |
| H05 | Conta MySQL com privilégio de escrita | Credencial recusada |
| H06 | Seleção de empresa | Contexto e dashboard atualizam para a empresa correta |
| H07 | Banco fiscal por empresa | Vincula exclusivamente conexão autorizada |
| H08 | Compra e venda | Contagem e campos iguais aos do legado na mesma base |
| H09 | Relatório | Dados, fórmulas, chassi, datas e valores iguais ao legado |
| H10 | Volume maior que 2.000 registros | Falha é explícita; não apresenta contagem parcial como total |
| H11 | XML válido e inválido | Resultado estruturado local sem envio de arquivo ao backend |
| H12 | Recarregar e limpar | Resumo reaparece no mesmo navegador; limpeza funciona |
| H13 | Exportar | JSON de simulação baixado, sem geração fiscal oficial |
| H14 | DevTools e logs | Nenhum request de inserção/alteração/deleção fiscal |
| H15 | Segurança da API | JWT inválido/ausente, perfis e empresa não autorizada negados |
| H16 | UI/UX | Navegação desktop/mobile, menus, acessibilidade e erros revisados |

**Status dos itens:** roteiro de validação entregue; resultados não executados/não homologados neste handoff.

## 9. Responsabilidades acordadas

**Entregue pela proposta 7C:** novo frontend de referência, visual, navegação, fluxo de consulta preparado, telas administrativas de conexão de leitura, fluxo local de simulação e documentação.

**Responsabilidade do desenvolvedor Mardisa:** autorização de acesso, configuração e segurança das bases, validação dos esquemas reais, testes fim a fim, comparação com legado, correções de regras fiscais, evidências de segurança, paginação, contas por empresa e autorização da implantação.

A proposta não substitui o conhecimento de domínio fiscal nem autoriza qualquer implantação automática.

## 10. Documentação complementar

- docs/HANDOFF-TECNICO-FRONTEND-FISCAL-ST.md na branch develop: stack, estrutura, componentes, rotas e manutenção.
- docs/DEMONSTRACAO-OPERACIONAL-7C.md na branch develop: contrato inicial da demonstração.
- docs/VALIDACAO-LEITURA-FISCAL.md na branch backend: validação das consultas.
- docs/SETUP-DEMO-ISOLADA.md na branch backend: configuração de Django e SQLite isolado.

**Critério de fechamento da equipe:** nova UI refletir corretamente a base real após configuração autorizada, com cálculos equivalentes ao legado, operação estritamente de consulta e simulação local. Nada disso deve ser declarado homologado antes de testar.
