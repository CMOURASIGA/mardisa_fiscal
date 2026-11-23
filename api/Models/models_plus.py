""" from django.db import models

class NFe_buy(models.Model):
    versao = models.CharField(max_length=10)
    
    # Root-level fields
    nProt = models.CharField(max_length=50, null=True, blank=True)
    digVal = models.CharField(max_length=500, null=True, blank=True)
    dhRecbto = models.DateTimeField(null=True, blank=True)
    Id = models.CharField(max_length=50, null=True, blank=True)
    chNFe = models.CharField(max_length=50, null=True, blank=True)
    xMotivo = models.CharField(max_length=255, null=True, blank=True)
    cStat = models.IntegerField(null=True, blank=True)
   
    # Information related to "infAdic" and its nested elements
    xCampo = models.CharField(max_length=255, null=True, blank=True)
    xTexto = models.TextField(null=True, blank=True)
    infCpl = models.TextField(null=True, blank=True)
    
    # Product related fields in the "det" section
    nItem = models.IntegerField(null=True, blank=True)
    xPed = models.CharField(max_length=50, null=True, blank=True)
    cProd = models.CharField(max_length=50, null=True, blank=True)
    qCom = models.DecimalField(max_digits=10, decimal_places=4, null=True, blank=True)
    cEAN = models.CharField(max_length=50, null=True, blank=True)
    cEANTrib = models.CharField(max_length=50, null=True, blank=True)
    xProd = models.CharField(max_length=255, null=True, blank=True)
    NCM = models.CharField(max_length=10, null=True, blank=True)
    CFOP = models.CharField(max_length=10, null=True, blank=True)
    CEST = models.CharField(max_length=10, null=True, blank=True)
    
    # Vehicle-related fields under veicProd
    tpVeic = models.CharField(max_length=10, null=True, blank=True)
    tpComb = models.CharField(max_length=10, null=True, blank=True)
    nMotor = models.CharField(max_length=50, null=True, blank=True)
    pesoL = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    anoFab = models.IntegerField(null=True, blank=True)
    lota = models.CharField(max_length=10, null=True, blank=True)
    anoMod = models.IntegerField(null=True, blank=True)
    pesoB = models.DecimalField(max_digits=10, decimal_places=3, null=True, blank=True)
    dist = models.CharField(max_length=10, null=True, blank=True)
    tpOp = models.CharField(max_length=10, null=True, blank=True)
    CMT = models.IntegerField(null=True, blank=True)
    cCor = models.CharField(max_length=10, null=True, blank=True)
    condVeic = models.CharField(max_length=10, null=True, blank=True)
    espVeic = models.CharField(max_length=10, null=True, blank=True)
    cCorDENATRAN = models.CharField(max_length=10, null=True, blank=True)
    cMod = models.CharField(max_length=10, null=True, blank=True)
    tpRest = models.CharField(max_length=10, null=True, blank=True)
    pot = models.CharField(max_length=10, null=True, blank=True)
    nSerie = models.CharField(max_length=50, null=True, blank=True)
    xCor = models.CharField(max_length=50, null=True, blank=True)
    tpPint = models.CharField(max_length=10, null=True, blank=True)
    chassi = models.CharField(max_length=50, null=True, blank=True)
    VIN = models.CharField(max_length=50, null=True, blank=True)

    # Total-related fields
    vCOFINS = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vBCST = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vICMSDeson = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vProd = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vSeg = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vNF = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vTotTrib = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vPIS = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vST = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vICMS = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vII = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vDesc = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vOutro = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vIPI = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    vFrete = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Payment-related fields
    vOrig = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    nFat = models.CharField(max_length=50, null=True, blank=True)
    vLiq = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    
    # Emission details
    tpNF = models.CharField(max_length=10, null=True, blank=True)
    mod = models.CharField(max_length=10, null=True, blank=True)
    indPres = models.CharField(max_length=10, null=True, blank=True)
    tpImp = models.CharField(max_length=10, null=True, blank=True)
    nNF = models.IntegerField(null=True, blank=True)
    cMunFG = models.IntegerField(null=True, blank=True)
    procEmi = models.CharField(max_length=10, null=True, blank=True)
    finNFe = models.CharField(max_length=10, null=True, blank=True)
    dhEmi = models.DateTimeField(null=True, blank=True)
    tpAmb = models.CharField(max_length=10, null=True, blank=True)
    indFinal = models.CharField(max_length=10, null=True, blank=True)
    idDest = models.CharField(max_length=10, null=True, blank=True)
    tpEmis = models.CharField(max_length=10, null=True, blank=True)
    cDV = models.CharField(max_length=10, null=True, blank=True)
    cUF = models.IntegerField(null=True, blank=True)
    serie = models.IntegerField(null=True, blank=True)
    natOp = models.CharField(max_length=255, null=True, blank=True)
    cNF = models.IntegerField(null=True, blank=True)
    verProc = models.CharField(max_length=255, null=True, blank=True)
    indPag = models.CharField(max_length=10, null=True, blank=True)
    
    # Emit and Dest fields for the issuer and destination entities
    xNomeEmit = models.CharField(max_length=255, null=True, blank=True)
    CRT = models.CharField(max_length=10, null=True, blank=True)
    xFant = models.CharField(max_length=255, null=True, blank=True)
    CNPJEmit = models.CharField(max_length=20, null=True, blank=True)
    xPaisEmit = models.CharField(max_length=50, null=True, blank=True)
    cPaisEmit = models.IntegerField(null=True, blank=True)
    xLgrEmit = models.CharField(max_length=255, null=True, blank=True)
    xMunEmit = models.CharField(max_length=255, null=True, blank=True)
    nroEmit = models.CharField(max_length=50, null=True, blank=True)
    cMunEmit = models.IntegerField(null=True, blank=True)
    xBairroEmit = models.CharField(max_length=255, null=True, blank=True)
    CEPEmit = models.CharField(max_length=10, null=True, blank=True)
    
    # Add more fields as required...

    def __str__(self):
        return f"NFe {self.chNFe}"


 """