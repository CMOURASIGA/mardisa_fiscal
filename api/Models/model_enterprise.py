from django.utils import timezone
from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

class Enterprise(models.Model):

    razao_social = models.CharField(max_length=255, null=True, blank=True) 
    CNPJ = models.CharField(max_length=14, null=True, blank=True)
    nome_responsavel = models.CharField(max_length=255, blank=True, null=True)
    fone_responsavel = models.CharField(max_length=20, blank=True, null=True)
    email_responsavel = models.EmailField(max_length=255, blank=True, null=True)
    ie_contribuinte = models.CharField(max_length=50, blank=True, null=True)

    FIELD_CHOICES = [
        ('EDU', 'Educação'),
        ('SAU', 'Saúde'),
        ('TEC', 'Tecnologia'),
        ('ADM', 'Administração'),
        ('FIN', 'Finanças'),
        ('JUR', 'Jurídico'),
        ('VEI', 'Veículo'),
        ('OUT', 'Outros'),
        ]

    field = models.CharField(
        "Área de atuação",
        max_length=3,
        choices=FIELD_CHOICES,
        default='OUT'
    )

    users = models.ManyToManyField(User, related_name="enterprises", blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)