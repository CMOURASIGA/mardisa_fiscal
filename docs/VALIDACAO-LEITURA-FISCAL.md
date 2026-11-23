# Fiscal ST | Homologação de leitura real da Mardisa

## Escopo
O backend `nfs.settings_demo` permanece com SQLite exclusivo para autenticação local. As consultas oficiais são realizadas por **novas rotas** que abrem conexões MySQL independentes, sempre com usuário previamente provisionado com privilégios SELECT (e opcional SHOW VIEW).

## Fluxo de configuração
1. Desenvolvedor inicia o Django no loopback com `DJANGO_SETTINGS_MODULE=nfs.settings_demo`.
2. Acessa Fiscal ST com conta `admin` local e abre `Administração técnica > Conexões de leitura`.
3. Em **Banco de gestão**, informa host, porta, nome do banco, usuário SELECT e senha. O backend testa o acesso e só armazena localmente se a conta for de leitura.
4. O cadastro de empresas é carregado por `GET /local-data/enterprises/` consultando `api_enterprise`.
5. Em **Banco fiscal por empresa**, seleciona a empresa e fornece credenciais SELECT **para o banco de notas dessa empresa**. O backend testa a existência de `NFECompra` e `NFEVenda`.
6. O frontend usa `GET /local-data/fiscal/<id>/buy/`, `sale/` e `report/`. A listagem de metadados usa `GET /local-data/metadata/users/` e `databases/` sem senhas.
7. O backend original contém outros endpoints que **não foram habilitados** nesta demonstração; `DemoIsolationMiddleware` bloqueia todas as rotas legadas `/api/v1/`.

## Segurança e limites
- **Nunca** conceder/gravar permissões no banco oficial como parte do projeto; provisionar uma conta SELECT por processo próprio do DBA, mediante autorização da Mardisa.
- Segredos ficam nos arquivos locais `.fiscal_readonly.local.env` e `.fiscal_tenants.local.json`. Ambos são ignorados pelo Git, porém contêm senhas **em texto puro**. Usar apenas em estação de desenvolvimento protegida, ajustar ACLs do Windows, excluir ao fim da avaliação, não enviar arquivos/senhas pelo chat e não publicar o backend na rede.
- Nenhum segredo é enviado ao navegador depois da submissão. A consulta exige token JWT de administrador local e origem loopback.
- Resultados de consulta são limitados a 2.000 linhas por operação; o backend retorna erro se ultrapassarem esse limite em vez de exibir contagens incompletas. Para volume maior, implementar paginação e contadores SQL no backend, com testes de equivalência.
- **Não há homologação de paridade completa**, especialmente para relatórios e registros com chassi duplicado. Comparar a saída do legado para a mesma empresa com a nova rota antes de considerar confiável.
- Validação de conexão não comprova se o host está acessível por VPN, se é o banco correto ou se os dados são oficiais; confirmação caberá à equipe autorizada.
- Credenciais MySQL devem ser de somente leitura independentemente do uso de `START TRANSACTION READ ONLY`; não usar usuários administrativos.
- O frontend mantém simulação de importação XML sem API fiscal e sem gravação de XML no banco.

## Verificação local
```powershell
# Backend (parar instância anterior antes)
cd C:\Projetos\mardisa_fiscal_backend
git pull origin backend
$env:DJANGO_SETTINGS_MODULE = "nfs.settings_demo"
# preservar a mesma SECRET_KEY do processo de autenticação, se sessão reiniciou
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000 --noreload
```

```powershell
# Frontend (outra janela)
cd C:\Projetos\mardisa_fiscal
git pull origin develop
npm run build
npm run dev
```

## Critérios para aprovação
- Lista de empresas igual ao sistema antigo para o mesmo usuário/autorização
- Compras/vendas e relatórios sem divergência injustificada
- A ausência de banco/credenciais deve gerar mensagem, jamais zero fictício
- Nenhum request de importação ou alteração nos logs de rede do frontend
- Usuário local consegue sair/trocar de usuário
- Contas de leitura não permitem INSERT, UPDATE, DELETE, CREATE nem ALTER no MySQL
