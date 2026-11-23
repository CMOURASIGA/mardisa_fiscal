from django.db import models
from api.Models.model_enterprise import Enterprise
from utils.encrypted_fields import EncryptedCharField


class DatabaseConnection(models.Model):
    DB_TYPES = [
        ('postgres', 'PostgreSQL'),
        ('mysql', 'MySQL'),
        ('sqlite', 'SQLite'),
        ('oracle', 'Oracle'),
        ('mssql', 'SQL Server'),
    ]

    enterprise_id = models.ForeignKey(
        Enterprise,
        on_delete=models.CASCADE,
        related_name='databases'
    )

    db_name = models.CharField(max_length=255)
    hostname = models.CharField(max_length=255)
    port = models.IntegerField(default=5432)
    username = models.CharField(max_length=255)
    password = EncryptedCharField(max_length=255)
    db_type = models.CharField(max_length=20, choices=DB_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_created = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.db_name} ({self.get_db_type_display()})"
