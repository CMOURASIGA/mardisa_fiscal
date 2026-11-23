"""Consultas locais fiscais em conexões MySQL estritamente de leitura.

Isoladas do ORM de produção e dos endpoints legados de escrita.
Credenciais permanecem no backend. Não utiliza DatabaseConnection.password
porque esse dado está criptografado com SECRET_KEY do sistema original.
"""
import json
import os
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path
from django.conf import settings
from django.http import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from nfs.local_admin import _read, _probe, _local_only, CONFIG_FILE

TENANT_FILE = Path(settings.BASE_DIR) / ".fiscal_tenants.local.json"
MAX_ROWS = 2000

def _safe():
    if not TENANT_FILE.exists():
        return {}
    return json.loads(TENANT_FILE.read_text(encoding="utf-8"))

def _read_mysql(params, sql, args=()):
    import MySQLdb
    import MySQLdb.cursors
    conn = MySQLdb.connect(
        host=params["DB_HOST"], port=int(params["DB_PORT"]),
        user=params["DB_USER"], passwd=params["DB_PASSWORD"],
        db=params["DB_NAME"], connect_timeout=5, read_timeout=8,
        charset="utf8mb4", cursorclass=MySQLdb.cursors.DictCursor,
    )
    try:
        with conn.cursor() as cur:
            cur.execute("SET SESSION TRANSACTION READ ONLY")
            cur.execute("START TRANSACTION READ ONLY")
            cur.execute(sql, args)
            return cur.fetchmany(MAX_ROWS + 1)
    finally:
        conn.rollback()
        conn.close()

def _json_safe(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal):
        return float(value)
    if isinstance(value, bytes):
        return value.decode("utf-8", errors="replace")
    if isinstance(value, dict):
        return {key: _json_safe(v) for key, v in value.items()}
    if isinstance(value, list):
        return [_json_safe(v) for v in value]
    return value

def _admin(request):
    return _local_only(request)

def _disabled():
    return JsonResponse({"detail": "Consulta indisponível nesta configuração local."}, status=503)

def _reply(rows):
    if len(rows) > MAX_ROWS:
        return JsonResponse({
            "detail": "Mais de 2000 registros retornados; consulta interrompida. É necessário paginação antes de homologar o conjunto completo."
        }, status=413)
    return JsonResponse({"data": _json_safe(rows)})

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def enterprise_list(request):
    if not _admin(request):
        return _disabled()
    params = _read()
    if not params or not all(params.get(k) for k in ("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD", "DB_PORT")):
        return JsonResponse({"detail": "Configure primeiro o banco de gestão em Administração técnica."}, status=503)
    try:
        # Estrutura confirmada nas migrations do backend existente.
        rows = _read_mysql(params, "SELECT id, razao_social, CNPJ FROM api_enterprise ORDER BY razao_social LIMIT 2001")
        return _reply(rows)
    except Exception:
        return JsonResponse({"detail": "Falha ao consultar empresas. Verifique tabela, conectividade e permissões de leitura."}, status=503)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def enterprise_detail(request, enterprise_id):
    if not _admin(request):
        return _disabled()
    params = _read()
    if not params:
        return _disabled()
    try:
        rows = _read_mysql(params, "SELECT id, razao_social, CNPJ FROM api_enterprise WHERE id=%s", (enterprise_id,))
        if not rows: return JsonResponse({"detail": "Empresa não localizada"}, status=404)
        return JsonResponse(_json_safe(rows[0]))
    except Exception:
        return _disabled()

def _tenant_params(enterprise_id):
    return _safe().get(str(enterprise_id))

@api_view(["GET", "POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def tenant_config(request, enterprise_id):
    if not _admin(request):
        return _disabled()
    all_tenants = _safe()
    if request.method == "GET":
        saved = all_tenants.get(str(enterprise_id), {})
        return JsonResponse({
            "configured": bool(saved), "host": saved.get("DB_HOST", ""),
            "port": saved.get("DB_PORT", "3306"), "database": saved.get("DB_NAME", ""),
            "username": saved.get("DB_USER", ""), "password_saved": bool(saved.get("DB_PASSWORD")),
        })
    if not isinstance(request.data, dict):
        return JsonResponse({"detail": "Dados inválidos"}, status=400)
    params = {k: str(request.data.get(k, "")).strip() for k in ("DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD")}
    if not params["DB_PASSWORD"]:
        params["DB_PASSWORD"] = all_tenants.get(str(enterprise_id), {}).get("DB_PASSWORD", "")
    if any(not params[k] for k in params) or len(params["DB_HOST"]) > 253 or any("\r" in v or "\n" in v or "\x00" in v for v in params.values()):
        return JsonResponse({"detail": "Preencha os campos válidos"}, status=400)
    try:
        if not 1 <= int(params["DB_PORT"]) <= 65535:
            raise ValueError()
        checked = _probe(params)
        if not checked["ok"]:
            return JsonResponse({"detail": checked["message"]}, status=400)
        # Confirma esquema fiscal apenas com SELECT.
        _read_mysql(params, "SELECT chassi FROM NFECompra LIMIT 1")
        _read_mysql(params, "SELECT chassi FROM NFEVenda LIMIT 1")
    except Exception:
        return JsonResponse({"detail": "Conexão fiscal recusada: verifique credenciais, tabelas e permissões exclusivamente SELECT."}, status=400)
    # Arquivo só no backend local, fora do versionamento. Não exibir senha.
    all_tenants[str(enterprise_id)] = params
    import stat
    TENANT_FILE.touch(exist_ok=True)
    try:
        os.chmod(TENANT_FILE, stat.S_IRUSR | stat.S_IWUSR)
    except OSError:
        pass
    TENANT_FILE.write_text(json.dumps(all_tenants, ensure_ascii=False), encoding="utf-8")
    return JsonResponse({"configured": True, "message": "Banco fiscal vinculado localmente em modo somente leitura."})

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAdminUser])
def fiscal_data(request, enterprise_id, kind):
    if not _admin(request):
        return _disabled()
    if kind not in ("buy", "sale", "report"):
        return JsonResponse({"detail": "Consulta inválida"}, status=404)
    params = _tenant_params(enterprise_id)
    if not params:
        return JsonResponse({"detail": "Configure a conexão fiscal de leitura para esta empresa na Administração técnica."}, status=503)
    try:
        # Estas consultas reproduzem os campos do legado sem acesso a endpoints de mutação.
        if kind == "buy":
            rows = _read_mysql(params, "SELECT * FROM NFECompra LIMIT 2001")
        elif kind == "sale":
            rows = _read_mysql(params, "SELECT * FROM NFEVenda LIMIT 2001")
        else:
            rows = _read_mysql(params, """SELECT v.chassi, v.vProd, c.vBCST, v.chNFe, v.dhRecbto, v.cProd, v.pICMSEfet
                FROM NFEVenda v JOIN NFECompra c ON c.chassi=v.chassi LIMIT 2001""")
        return _reply(rows)
    except Exception:
        return JsonResponse({"detail": "Falha na consulta fiscal de leitura. Valide tabelas e permissões SELECT."}, status=503)
