from django.conf import settings
from django.db import models

class Supplier(models.Model):

    xNome = models.CharField(max_length=255, null=True, blank=True) 
    CNPJ = models.CharField(max_length=14, null=True, blank=True) 