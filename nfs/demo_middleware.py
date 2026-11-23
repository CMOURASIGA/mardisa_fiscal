from django.http import JsonResponse

class DemoIsolationMiddleware:
    """Não permite que a demo local use endpoints de acesso fiscal externos.

    A autenticação Django /auth/login/ continua disponível no SQLite de demonstração.
    Para consultar dados oficiais, criar infraestrutura read-only separada e auditada.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith("/api/v1/") or request.path.startswith("/enter-file-name/"):
            return JsonResponse({
                "detail": "Modo demonstração isolado: consultas fiscais externas desativadas até conexão read-only auditada."
            }, status=403)
        return self.get_response(request)
