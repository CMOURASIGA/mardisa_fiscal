import xml.etree.ElementTree as ET
from django.utils.dateparse import parse_datetime

from .models import *


def nfe_venda_loader(xml_data):
       
        root = ET.fromstring(xml_data)
        
        namespaces = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}
        
        versao = root.attrib.get('versao', '')
        
        infProt = root.find('nfe:protNFe/nfe:infProt', namespaces)


        nProt = infProt.find('nfe:nProt', namespaces).text if infProt is not None else None
        digVal = infProt.find('nfe:digVal', namespaces).text if infProt is not None else None
        dhRecbto = infProt.find('nfe:dhRecbto', namespaces).text if infProt is not None else None
        #Id = infProt.find('nfe:Id', namespaces).text if infProt is not None else None
        #print(id)
        chNFe = infProt.find('nfe:chNFe', namespaces).text if infProt is not None else None
        xMotivo = infProt.find('nfe:xMotivo', namespaces).text if infProt is not None else None
        cStat = infProt.find('nfe:cStat', namespaces).text if infProt is not None else None

        det_list = root.findall('.//nfe:det', namespaces)

        dest = root.find('.//nfe:dest', namespaces)
        uf = dest.find('.//nfe:enderDest/nfe:UF', namespaces).text if dest is not None else None
        
        chassi = None

        for det in det_list:
            if det:
                nItem = str(det.get('nItem')) if det.get('nItem') is not None else None
                chassi = det.find('nfe:prod/nfe:veicProd/nfe:chassi', namespaces).text if det.find('nfe:prod/nfe:veicProd/nfe:chassi', namespaces) is not None else None
                cProd = det.find('nfe:prod/nfe:cProd', namespaces).text if det.find('nfe:prod/nfe:cProd', namespaces) is not None else None
                vProd = det.find('nfe:prod/nfe:vProd', namespaces).text if det.find('nfe:prod/nfe:vProd', namespaces) is not None else None
                
                icms = root.find('.//nfe:ICMS60', namespaces=namespaces)
                pICMSEfet = icms.find('nfe:pICMSEfet', namespaces).text if icms is not None else None
               
            """ versao=versao, """
            nfe = NFEVenda(
                nProt=nProt,
                digVal=digVal,
                dhRecbto=dhRecbto,
                #id_nf=Id,
                chNFe=chNFe,
                xMotivo=xMotivo,
                cStat=cStat,
                chassi=chassi,
                cProd=cProd,
                nItem=nItem,
                vProd=vProd,
                pICMSEfet=pICMSEfet,
                UF=uf
            )
            
            
            nfe.save()
        
        return nfe  


def nfe_venda_loader_db(xml_data, connection):

    root = ET.fromstring(xml_data)
    namespaces = {'nfe': 'http://www.portalfiscal.inf.br/nfe'}

    versao = root.attrib.get('versao', '')

    # -------- PROTOCOLO --------
    infProt = root.find('nfe:protNFe/nfe:infProt', namespaces)

    nProt = infProt.find('nfe:nProt', namespaces).text if infProt is not None else None
    digVal = infProt.find('nfe:digVal', namespaces).text if infProt is not None else None
    dhRecbto = infProt.find('nfe:dhRecbto', namespaces).text if infProt is not None else None
    chNFe = infProt.find('nfe:chNFe', namespaces).text if infProt is not None else None
    xMotivo = infProt.find('nfe:xMotivo', namespaces).text if infProt is not None else None
    cStat = infProt.find('nfe:cStat', namespaces).text if infProt is not None else None

    if dhRecbto:
        dhRecbto = parse_datetime(dhRecbto)

    # -------- DESTINATÁRIO --------
    dest = root.find('.//nfe:dest', namespaces)
    uf = dest.find('.//nfe:enderDest/nfe:UF', namespaces).text if dest is not None else None

    # -------- ITENS --------
    det_list = root.findall('.//nfe:det', namespaces)

    for det in det_list:

        nItem = det.get('nItem')
        cProd = det.find('nfe:prod/nfe:cProd', namespaces).text if det.find('nfe:prod/nfe:cProd', namespaces) is not None else None
        vProd = det.find('nfe:prod/nfe:vProd', namespaces).text if det.find('nfe:prod/nfe:vProd', namespaces) is not None else None
        chassi = det.find('nfe:prod/nfe:veicProd/nfe:chassi', namespaces)
        chassi = chassi.text if chassi is not None else None

        # -------- ICMS --------
        icms = root.find('.//nfe:ICMS60', namespaces=namespaces)
        pICMSEfet = icms.find('nfe:pICMSEfet', namespaces).text if icms is not None else None

        # -------------------------
        # RAW SQL INSERT
        # -------------------------
        with connection.cursor() as cursor:
            cursor.execute("""
                INSERT INTO nfevenda (
                    nProt, digVal, dhRecbto, chNFe, xMotivo, cStat,
                    nItem, cProd, chassi, vProd, pICMSEfet, UF
                )
                VALUES (%s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s)
            """, [
                nProt, digVal, dhRecbto, chNFe, xMotivo, cStat,
                nItem, cProd, chassi, vProd, pICMSEfet, uf
            ])

    return "OK"
