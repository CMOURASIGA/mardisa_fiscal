from django.db import models
from django.conf import settings

class NFECompra(models.Model):

    # infProt < Metadata
    nProt = models.CharField(max_length=100, null=True, blank=True)
    digVal = models.CharField(max_length=255, null=True, blank=True)
    dhRecbto = models.DateTimeField(null=True, blank=True)
    id_nf = models.CharField(max_length=100, null=True, blank=True)
    chNFe = models.CharField(max_length=100, null=True, blank=True) #chaveNFEntrada
    xMotivo = models.CharField(max_length=255, null=True, blank=True)
    cStat = models.CharField(max_length=3, null=True, blank=True)

    # Prod
    chassi = models.CharField(max_length=100, null=True, blank=True)
    xProd = models.CharField(max_length=255, null=True, blank=True) #descricaoProduto
    uCom = models.CharField(max_length=10, null=True, blank=True) #unidadeInternaProduto & unidadeProdutoFornecedor
    cProd = models.CharField(max_length=100, null=True, blank=True) #codInternoProduto & codProdutoFornecedor
    uTrib = models.CharField(max_length=50, null=True, blank=True)
    ncm = models.CharField(max_length=10, null=True, blank=True)
    cfop = models.CharField(max_length=10, null=True, blank=True)
    qcom = models.CharField(max_length=20, null=True, blank=True) #fatorConversao


    #ICMS
    modBC = models.IntegerField(null=True, blank=True)
    pICMSST = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    vICMSST = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    pRedBC = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    orig = models.IntegerField(null=True, blank=True)
    CST = models.CharField(max_length=3, null=True, blank=True)
    modBCST = models.IntegerField(null=True, blank=True)
    vBCST = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    vBC = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    vICMS = models.DecimalField(max_digits=20, decimal_places=2, null=True, blank=True)
    pICMS = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)

    #EMIT
    emit_CNPJ = models.CharField(max_length=14, null=True, blank=True)  #cnpjFornecedor
    emit_xNome = models.CharField(max_length=255, null=True, blank=True)


    #DEST
    xNome = models.CharField(max_length=255, null=True, blank=True) #razaoSocial
    CNPJ = models.CharField(max_length=14, null=True, blank=True) #cnpjRaiz
    nItem = models.IntegerField(null=True, blank=True) #nItem

    #Meta
    generated = models.BooleanField(null=False, blank=False, default=False)

    natOp = models.CharField(max_length=100, null=True, blank=True)