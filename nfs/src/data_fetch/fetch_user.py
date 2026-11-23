from api.Models.model_enterprise import Enterprise

def get_users_by_enterprise(enterprise_id):
    """
    Returns a queryset of users belonging to an enterprise.
    """
    enterprise = Enterprise.objects.filter(id=enterprise_id).first()

    if not enterprise:
        return None

    return enterprise.users.all()