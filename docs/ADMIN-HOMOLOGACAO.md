# Administrador para homologação local

O login segue utilizando o endpoint Django existente `/auth/login/` e tokens JWT. Este comando **não** substitui a autenticação atual nem cria acesso pelo navegador sem servidor.

Para criar ou atualizar a conta `admin` somente no banco configurado para desenvolvimento:

```powershell
# No diretório do backend, depois de configurar o Python, as dependências e o banco
$env:FISCAL_DEV_ADMIN_PASSWORD = Read-Host "Senha para o admin local"
python manage.py setup_dev_admin
Remove-Item Env:FISCAL_DEV_ADMIN_PASSWORD
```

A senha digitada não aparece no terminal, não fica no Git e é armazenada pelo mecanismo de hash de senhas do Django. O comando atribui as permissões de superusuário e o grupo `admin`, esperado pelo frontend. Se a conta já existir, sua senha será atualizada; outras contas não serão alteradas.

**Restrições:** O comando exige `DEBUG=True`, deve ser executado apenas em banco de homologação local, nunca em um banco compartilhado ou de produção. Não associe esse banco de homologação a dados reais sem autorização. O backend original possui outras configurações de segurança a corrigir antes de publicação em servidor.
