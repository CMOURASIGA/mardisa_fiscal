# Fiscal ST | Configuração local de conexão de leitura

Esta é uma etapa de diagnóstico para o desenvolvedor, **não** é a liberação de consultas fiscais.

1. Executar o backend com `DJANGO_SETTINGS_MODULE=nfs.settings_demo`, autenticado com usuário Django staff/superuser local.
2. Instalar dependências já previstas no backend, especialmente `mysqlclient` e `python-dotenv`.
3. Usar no MySQL exclusivamente uma conta com privilégios **SELECT**, previamente concedidos pelo administrador do cliente. Não executar `GRANT` ou qualquer criação de usuário no banco do cliente neste projeto.
4. No Fiscal ST, acessar **Administração técnica > Conexão de leitura** e informar host, porta, nome do banco de gestão, usuário de leitura e senha.
5. O backend executará apenas consultas de verificação e rejeitará contas com privilégios incompatíveis. Somente depois do sucesso os parâmetros serão gravados em `.fiscal_readonly.local.env` na pasta do backend.
6. A senha **não** vai para o localStorage nem para o bundle Vite. O arquivo `.fiscal_readonly.local.env` é local, ignorado pelo Git, **mas contém a senha em texto puro**. Garantir ACL restrita no Windows, disco protegido, não compartilhar a pasta e não realizar backup inseguro. Para uso duradouro, migrar para cofre de segredos/criptografia em repouso.
7. O teste **não** altera `DATABASES` do Django em execução, nem importa tabelas da Mardisa. O login permanece no SQLite local e os endpoints fiscais permanecem bloqueados. Requer revisão do modelo `DatabaseConnection`, da autorização por empresa, das consultas legadas e do segredo criptográfico original antes de habilitar as rotas reais.
8. Nunca colocar dados sensíveis em `.env.local` do frontend com prefixo `VITE_`: estes valores seriam incluídos no código enviado ao navegador.

## Atualização local
```powershell
cd C:\Projetos\mardisa_fiscal_backend
git pull origin backend
# Manter DJANGO_SETTINGS_MODULE=nfs.settings_demo e SECRET_KEY da sessão existente.
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000 --noreload
```

Antes de configurar qualquer host, confirme autorização da Mardisa para a conexão e que as credenciais têm exclusivamente SELECT.
