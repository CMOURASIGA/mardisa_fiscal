
from django.conf import settings
from django.db import models

class NFEVenda(models.Model):

    # infProt < Metadata
    nProt = models.CharField(max_length=100, null=True, blank=True)
    digVal = models.CharField(max_length=255, null=True, blank=True)
    dhRecbto = models.DateTimeField(null=True, blank=True)
    id_nf = models.CharField(max_length=100, null=True, blank=True)
    chNFe = models.CharField(max_length=100, null=True, blank=True) #chaveNFE
    xMotivo = models.CharField(max_length=255, null=True, blank=True)
    cStat = models.CharField(max_length=3, null=True, blank=True)

    chassi = models.CharField(max_length=100, null=True, blank=True)
    cProd = models.CharField(max_length=100, null=True, blank=True)
    nItem = models.IntegerField(null=True, blank=True) #nItem
    uTrib = models.CharField(max_length=50, null=True, blank=True)
    ncm = models.CharField(max_length=10, null=True, blank=True)
    cfop = models.CharField(max_length=10, null=True, blank=True)

    vProd = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    pICMSEfet = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True, default=12)

    UF = models.CharField(max_length=2, null=True, blank=True)