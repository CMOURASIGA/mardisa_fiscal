# Fiscal ST: autenticação de demonstração isolada

**Não usar as configurações originais do banco da Mardisa para criar usuários, executar migrações ou importar XML.**

O módulo `nfs.settings_demo` substitui o banco padrão por `demo_auth.sqlite3` na própria pasta local do backend. Não utiliza endereço, usuário ou senha do banco oficial.

No PowerShell (na pasta backend), com dependências instaladas:

```powershell
$env:DJANGO_SETTINGS_MODULE = "nfs.settings_demo"
$env:SECRET_KEY = .\.venv\Scripts\python.exe -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py migrate
$senha = Read-Host "Senha para admin local" -AsSecureString
$env:FISCAL_DEV_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $senha).Password
.\.venv\Scripts\python.exe manage.py setup_dev_admin
Remove-Item Env:FISCAL_DEV_ADMIN_PASSWORD
Remove-Variable senha
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000 --noreload
```

**Verificação obrigatória** antes de `migrate` e `setup_dev_admin`:
```powershell
.\.venv\Scripts\python.exe -c "import os; os.environ.setdefault('DJANGO_SETTINGS_MODULE','nfs.settings_demo'); import django; django.setup(); from django.conf import settings; print(settings.DATABASES['default']['ENGINE']); print(settings.DATABASES['default']['NAME'])"
```
Deve indicar `django.db.backends.sqlite3` e caminho local `demo_auth.sqlite3`.

**Limitações**: usuários criados são somente locais. Os dados fiscais reais não estarão presentes na base SQLite. A consulta de dados reais deve ser disponibilizada por backend oficial com credenciais read-only e autorização separada. Não acione endpoints de exportação/importação legados na demonstração.
