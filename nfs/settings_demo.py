"""Configuração de demonstração totalmente isolada do banco oficial.

Uso: definir DJANGO_SETTINGS_MODULE=nfs.settings_demo antes de qualquer
comando manage.py. Os dados de autenticação ficam em SQLite local, no disco.
Os endpoints fiscais externos devem ser usados apenas após auditoria de
leitura e configuração de credenciais read-only; neste modo são bloqueados.
"""
from .settings import *  # noqa: F401,F403
from .settings import BASE_DIR, MIDDLEWARE as BASE_MIDDLEWARE

DEBUG = True
MIDDLEWARE = ["nfs.demo_middleware.DemoIsolationMiddleware", *BASE_MIDDLEWARE]
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "demo_auth.sqlite3",
    }
}
# Segredo do ambiente deve vir de variável, nunca persistido em repositório.
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS
# Impede acesso pelo backend de demonstração aos bancos externos usados
# nas consultas/rotinas fiscais legadas; código de views deve ser auditado.
