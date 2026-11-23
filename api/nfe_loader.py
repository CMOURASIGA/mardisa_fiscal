import xml.etree.ElementTree as ET
from django.utils.dateparse import parse_datetime
from .models import *

bl_op = [
      "REMESSA MERCADORIA OU BEM PARA DEMONSTRACAO", 
      "DEMONSTRACAO"]

cfop_wl = [
      '6401', '6403', '5401', '5403'
      ]

cfop_bl = [
      '5949', '5912', '5551', '5913', '5411', '5102', '6102'
]


def nfe_compra_loader(xml_data):
       
        root = ET.fromstring(xml_data)
        
        namespaces = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
        
        versao = root.attrib.get('versao', '')
        
        nat_op = root.find('.//nfe:NFe/nfe:infNFe/nfe:ide/nfe:natOp', namespaces).text
        
        """ if nat_op in bl_op:
              
              return f'Extração dessa nota não realizada. Motivo: {nat_op}' """
        
        
        emit = root.find('.//nfe:emit', namespaces)
        cnpj_emit = emit.find('nfe:CNPJ', namespaces).text if emit is not None else None
        xNome_emit = emit.find('nfe:xNome', namespaces).text if emit is not None else None

        cnpj_list = Supplier.objects.values_list('CNPJ', flat=True)

        """ if cnpj_emit not in cnpj_list:

            return f'CNPJ {cnpj_emit} não está na lista de fornecedores valido' """
        
        
        
        
        infProt = root.find('nfe:protNFe/nfe:infProt', namespaces)
        

        nProt = infProt.find('nfe:nProt', namespaces).text if infProt is not None else None
        digVal = infProt.find('nfe:digVal', namespaces).text if infProt is not None else None
        dhRecbto = infProt.find('nfe:dhRecbto', namespaces).text if infProt is not None else None
        #Id = infProt.find('nfe:Id', namespaces).text if infProt is not None else None
        chNFe = infProt.find('nfe:chNFe', namespaces).text if infProt is not None else None
        xMotivo = infProt.find('nfe:xMotivo', namespaces).text if infProt is not None else None
        cStat = infProt.find('nfe:cStat', namespaces).text if infProt is not None else None
        
        if dhRecbto:
                dhRecbto = parse_datetime(dhRecbto)
        
   
        det_list = root.findall('.//nfe:det', namespaces)


        nItem = None
        xProd = None
        chassi = None
        uCom = None

        for det in det_list:
            if det:
                cProd = det.find('nfe:prod/nfe:cProd', namespaces).text if det.find('nfe:prod/nfe:cProd', namespaces) is not None else None
                nItem = str(det.get('nItem')) if det.get('nItem') is not None else None
                #nItem = det.find('nfe:nItem', namespaces).text if det.find('nfe:nItem', namespaces) is not None else None
                xProd = det.find('nfe:prod/nfe:xProd', namespaces).text if det.find('nfe:prod/nfe:xProd', namespaces) is not None else None
                chassi = det.find('nfe:prod/nfe:veicProd/nfe:chassi', namespaces).text if det.find('nfe:prod/nfe:veicProd/nfe:chassi', namespaces) is not None else None
                uCom = det.find('nfe:prod/nfe:uCom', namespaces).text if det.find('nfe:prod/nfe:uCom', namespaces) is not None else None
                uTrib = det.find('nfe:prod/nfe:uTrib', namespaces).text if det.find('nfe:prod/nfe:uTrib', namespaces) is not None else None
                ncm = det.find('nfe:prod/nfe:NCM', namespaces).text if det.find('nfe:prod/nfe:NCM', namespaces) is not None else None
                cfop = det.find('nfe:prod/nfe:CFOP', namespaces).text if det.find('nfe:prod/nfe:CFOP', namespaces) is not None else None
                qcom = det.find('nfe:prod/nfe:qCom', namespaces).text if det.find('nfe:prod/nfe:qCom', namespaces) is not None else None

                """ if cfop in cfop_bl:
                      return f'cfop {cfop} na lista de cfop inválidos.'
                
                if chassi and (cfop not in cfop_wl):
                      return f'cfop {cfop} fora da lista de cfop válidos.'
 """

                
            
            
            

            dest = root.find('.//nfe:dest', namespaces)
            cnpj_dest = dest.find('nfe:CNPJ', namespaces).text if dest is not None else None
            xNome_dest = dest.find('nfe:xNome', namespaces).text if dest is not None else None


            icms = root.find('.//nfe:ICMS70', namespaces=namespaces)

            
            
            
            vICMS = icms.find('nfe:vICMS', namespaces).text if icms is not None else None
            vICMSST = icms.find('nfe:vICMSST', namespaces).text if icms is not None else None
            vBCST = icms.find('nfe:vBCST', namespaces).text if icms is not None else None
            
            


            '''versao=versao,'''
            nfe = NFECompra(
                
                nProt=nProt,
                digVal=digVal,
                dhRecbto=dhRecbto,
                #id_nf=Id,
                chNFe=chNFe,
                xMotivo=xMotivo,
                cStat=cStat,
                nItem=nItem,
                xProd=xProd,
                chassi=chassi,
                uCom=uCom,
                emit_CNPJ=cnpj_emit,
                xNome=xNome_dest,
                CNPJ=cnpj_dest,
                cProd=cProd, 
                uTrib=uTrib,
                ncm=ncm,
                cfop=cfop,
                emit_xNome=xNome_emit,
                natOp=nat_op,
                qcom=qcom,
                vICMS=vICMS,
                vICMSST=vICMSST,
                vBCST=vBCST
            )
            
        
            nfe.save()
        
        return nfe  





def nfe_compra_loader_db(xml_data, connection):

    root = ET.fromstring(xml_data)
    namespaces = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}

    versao = root.attrib.get('versao', '')

    nat_op = root.find('.//nfe:NFe/nfe:infNFe/nfe:ide/nfe:natOp', namespaces).text

    emit = root.find('.//nfe:emit', namespaces)
    cnpj_emit = emit.find('nfe:CNPJ', namespaces).text if emit is not None else None
    xNome_emit = emit.find('nfe:xNome', namespaces).text if emit is not None else None

    infProt = root.find('nfe:protNFe/nfe:infProt', namespaces)
    nProt = infProt.find('nfe:nProt', namespaces).text if infProt is not None else None
    digVal = infProt.find('nfe:digVal', namespaces).text if infProt is not None else None
    dhRecbto = infProt.find('nfe:dhRecbto', namespaces).text if infProt is not None else None
    chNFe = infProt.find('nfe:chNFe', namespaces).text if infProt is not None else None
    xMotivo = infProt.find('nfe:xMotivo', namespaces).text if infProt is not None else None
    cStat = infProt.find('nfe:cStat', namespaces).text if infProt is not None else None

    if dhRecbto:
        dhRecbto = parse_datetime(dhRecbto)

    det_list = root.findall('.//nfe:det', namespaces)

    for det in det_list:

        cProd = det.find('nfe:prod/nfe:cProd', namespaces).text
        nItem = det.get('nItem')
        xProd = det.find('nfe:prod/nfe:xProd', namespaces).text
        chassi = det.find('nfe:prod/nfe:veicProd/nfe:chassi', namespaces)
        chassi = chassi.text if chassi is not None else None
        uCom = det.find('nfe:prod/nfe:uCom', namespaces).text
        uTrib = det.find('nfe:prod/nfe:uTrib', namespaces).text
        ncm = det.find('nfe:prod/nfe:NCM', namespaces).text
        cfop = det.find('nfe:prod/nfe:CFOP', namespaces).text
        qcom = det.find('nfe:prod/nfe:qCom', namespaces).text

        dest = root.find('.//nfe:dest', namespaces)
        cnpj_dest = dest.find('nfe:CNPJ', namespaces).text
        xNome_dest = dest.find('nfe:xNome', namespaces).text

        icms = root.find('.//nfe:ICMS70', namespaces=namespaces)
        vICMS = icms.find('nfe:vICMS', namespaces).text if icms is not None else None
        vICMSST = icms.find('nfe:vICMSST', namespaces).text if icms is not None else None
        vBCST = icms.find('nfe:vBCST', namespaces).text if icms is not None else None

        

        # -------------------------
        # RAW SQL INSERT
        # -------------------------
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO nfecompra (
                    nProt, digVal, dhRecbto, chNFe, xMotivo, cStat,
                    nItem, xProd, chassi, uCom, emit_CNPJ, xNome,
                    CNPJ, cProd, uTrib, ncm, cfop, emit_xNome,
                    natOp, qcom, vICMS, vICMSST, vBCST
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, [
                nProt, digVal, dhRecbto, chNFe, xMotivo, cStat,
                nItem, xProd, chassi, uCom, cnpj_emit, xNome_dest,
                cnpj_dest, cProd, uTrib, ncm, cfop, xNome_emit,
                nat_op, qcom, vICMS, vICMSST, vBCST
            ])
            

    return "OK"
