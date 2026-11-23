"""Configuração local de leitura de MySQL, isolada do SQLite de autenticação.

Segredos ficam apenas no backend, nunca em VITE_ nem no localStorage.
Ativação limitada a DJANGO_SETTINGS_MODULE=nfs.settings_demo e usuários staff,
com servidor iniciado em localhost. A conexão testa SOMENTE SELECT.
"""
import json
import os
import re
import stat
from pathlib import Path

from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.cache import never_cache

CONFIG_FILE = Path(settings.BASE_DIR) / ".fiscal_readonly.local.env"
FIELDS = ("ENGINE", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD")
IDENTIFIER = re.compile(r"^[a-zA-Z0-9_$.-]{1,128}$")

def _local_only(request):
    return (
        os.environ.get("DJANGO_SETTINGS_MODULE") == "nfs.settings_demo"
        and request.get_host().split(":")[0] in ("localhost", "127.0.0.1")
        and request.META.get("REMOTE_ADDR") in ("127.0.0.1", "::1")
    )

def _read():
    if not CONFIG_FILE.exists():
        return {}
    from dotenv import dotenv_values
    return dict(dotenv_values(CONFIG_FILE))

def _status(data):
    return {
        "configured": all(data.get(k) for k in FIELDS),
        "engine": data.get("ENGINE", ""),
        "host": data.get("DB_HOST", ""),
        "port": data.get("DB_PORT", ""),
        "database": data.get("DB_NAME", ""),
        "username": data.get("DB_USER", ""),
        "password_saved": bool(data.get("DB_PASSWORD")),
        "mode": "connection_test_only",
    }

def _probe(data):
    import MySQLdb
    connection = MySQLdb.connect(
        host=data["DB_HOST"], port=int(data["DB_PORT"]),
        user=data["DB_USER"], passwd=data["DB_PASSWORD"],
        db=data["DB_NAME"], connect_timeout=5,
        read_timeout=5, write_timeout=5,
        charset="utf8mb4",
    )
    try:
        with connection.cursor() as cursor:
            cursor.execute("SET SESSION TRANSACTION READ ONLY")
            cursor.execute("START TRANSACTION READ ONLY")
            cursor.execute("SELECT DATABASE(), CURRENT_USER()")
            actual_db, actual_user = cursor.fetchone()
            cursor.execute("SHOW GRANTS FOR CURRENT_USER()")
            grants = [str(row[0]) for row in cursor.fetchall()]
            # Uma conta com privilégios de escrita não é aceita, ainda que
            # esta chamada faça apenas leituras.
            unsafe = any(re.search(r"\b(ALL PRIVILEGES|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|INDEX|TRIGGER|GRANT OPTION|EXECUTE|EVENT|REFERENCES)\b", grant, re.I) for grant in grants)
            if unsafe:
                return {"ok": False, "message": "Credencial rejeitada: foram detectados privilégios incompatíveis com somente leitura."}
            return {"ok": True, "message": "Conexão MySQL e consulta SELECT confirmadas.", "database": actual_db, "user": actual_user}
    finally:
        connection.rollback()
        connection.close()

@never_cache
@api_view(["GET", "POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def local_readonly_config(request):
    if not _local_only(request):
        return JsonResponse({"detail": "Configuração disponível apenas no backend local de homologação."}, status=403)
    if request.method == "GET":
        return JsonResponse(_status(_read()))

    supplied = request.data
    if not isinstance(supplied, dict):
        return JsonResponse({"detail": "Formato inválido."}, status=400)
    previous = _read()
    data = {key: str(supplied.get(key, "")).strip() for key in FIELDS}
    if not data["DB_PASSWORD"]:
        data["DB_PASSWORD"] = previous.get("DB_PASSWORD", "")
    if data["ENGINE"] not in ("django.db.backends.mysql", "mysql"):
        return JsonResponse({"detail": "Somente MySQL é aceito para consultas fiscais."}, status=400)
    if not all(data.get(k) for k in FIELDS):
        return JsonResponse({"detail": "Preencha todos os parâmetros de conexão."}, status=400)
    try:
        port = int(data["DB_PORT"])
        if not (1 <= port <= 65535):
            raise ValueError()
    except ValueError:
        return JsonResponse({"detail": "Porta inválida."}, status=400)
    if not IDENTIFIER.fullmatch(data["DB_NAME"]) or len(data["DB_HOST"]) > 253 or any(c in data["DB_HOST"] for c in "\r\n\x00"):
        return JsonResponse({"detail": "Host ou banco inválido."}, status=400)
    if any("\x00" in str(v) or "\r" in str(v) or "\n" in str(v) for v in data.values()):
        return JsonResponse({"detail": "Valores não podem conter quebras de linha."}, status=400)

    # Teste obrigatório ANTES da persistência. Nenhuma escrita no servidor MySQL.
    try:
        tested = _probe(data)
    except Exception:
        return JsonResponse({"detail": "Não foi possível conectar ao MySQL. Verifique host, porta, usuário, senha e permissões.", "tested": False}, status=400)
    if not tested["ok"]:
        return JsonResponse({"detail": tested["message"], "tested": False}, status=400)

    # dotenv mantém a configuração apenas no backend. Arquivo local ignorado pelo git.
    from dotenv import set_key
    CONFIG_FILE.touch(exist_ok=True)
    try:
        os.chmod(CONFIG_FILE, stat.S_IRUSR | stat.S_IWUSR)
    except OSError:
        pass  # Em Windows, restringir ACL manualmente.
    for key, value in data.items():
        set_key(str(CONFIG_FILE), key, value, quote_mode="always")
    return JsonResponse({"message": "Conexão exclusivamente de leitura validada e configuração salva no backend local.", "tested": True, **_status(data)})
