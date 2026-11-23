from api.Models.model_db import DatabaseConnection

def get_database_connections_by_enterprise(enterprise_id):
    qs = DatabaseConnection.objects.select_related(
        'enterprise_id'
    ).filter(enterprise_id=enterprise_id)

    return [
        {
            "id": db.id,
            "db_name": db.db_name,
            "hostname": db.hostname,
            "port": db.port,
            "username": db.username,
            "db_type": db.db_type,
            "is_created": db.is_created,
            "created_at": db.created_at,
            "updated_at": db.updated_at,
            "enterprise": {
                "id": db.enterprise_id.id,
                "razao_social": db.enterprise_id.razao_social,
                "CNPJ": db.enterprise_id.CNPJ,
            }
        }
        for db in qs
    ]