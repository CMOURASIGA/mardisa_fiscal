

from api.Models.model_NFEVenda import NFEVenda
from api.Models.model_NFECompra import NFECompra
from nfs.src.db.db_pipelines.db_connection_meta import connect_mysql_by_id


def fetch_buy_receipt():
    
    nf = NFECompra.objects.all()  
    data = list(nf.values())

    response_data = {
        'data': data
    }

    return response_data


def fetch_sale_receipt():
    
    nf = NFEVenda.objects.all()  
    data = list(nf.values())

    response_data = {
        'data': data
    }

    return response_data


def fetch_report_data():
    compra_chassi_values = NFECompra.objects.values_list('chassi', flat=True)
    result = NFEVenda.objects.filter(chassi__in=compra_chassi_values)
    
    compra_data = {compra.chassi: compra.vBCST for compra in NFECompra.objects.all()}
    
    data = []
    for venda in result:
        vBCST_value = compra_data.get(venda.chassi, None)
        venda_dict = {
            'chassi': venda.chassi,
            'vProd': venda.vProd,
            'vBCST': vBCST_value,
            'chNFe': venda.chNFe,
            'dhRecbto': venda.dhRecbto,
            'cProd': venda.cProd,
            'pICMSEfet': venda.pICMSEfet,
            
        }
        data.append(venda_dict)
    
    response_data = {
        'data': data
    }

    return response_data

def fetch_buy_receipt_by_id(id):
    connection = None
    cursor = None

    try:

        connection = connect_mysql_by_id(id)
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM NFECompra;
        """

        cursor.execute(query)
        rows = cursor.fetchall()
        

        return {"data": rows}

    except Exception as e:
        return {"error": str(e)}

    finally:
        if cursor is not None:
            try:
                cursor.close()
            except:
                pass

        if connection is not None:
            try:
                connection.close()
            except:
                pass



def fetch_sale_receipt_by_id(id):
    connection = None
    cursor = None

    try:
        connection = connect_mysql_by_id(id)  
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM NFEVenda;
        """

        cursor.execute(query)
        rows = cursor.fetchall()
        

        return {"data": rows}

    except Exception as e:
        return {"error": str(e)}

    finally:
        if cursor is not None:
            try:
                cursor.close()
            except:
                pass

        if connection is not None:
            try:
                connection.close()
            except:
                pass



def fetch_report_data_by_id(id):
    connection = None
    cursor = None

    try:
        connection = connect_mysql_by_id(id)
        cursor = connection.cursor(dictionary=True)

        compra_query = """
            SELECT chassi, vBCST
            FROM NFECompra;
        """
        cursor.execute(compra_query)
        compra_rows = cursor.fetchall()

        compra_data = {row["chassi"]: row["vBCST"] for row in compra_rows}


        compra_chassi_list = [row["chassi"] for row in compra_rows]

        if not compra_chassi_list:
            return {"data": []}


        placeholders = ", ".join(["%s"] * len(compra_chassi_list))

        venda_query = f"""
            SELECT 
                chassi,
                vProd,
                chNFe,
                dhRecbto,
                cProd,
                pICMSEfet
            FROM NFEVenda
            WHERE chassi IN ({placeholders});
        """
        cursor.execute(venda_query, compra_chassi_list)
        venda_rows = cursor.fetchall()


        data = []
        for venda in venda_rows:
            chassi = venda["chassi"]
            vBCST_value = compra_data.get(chassi)

            venda_dict = {
                "chassi": chassi,
                "vProd": venda["vProd"],
                "vBCST": vBCST_value,
                "chNFe": venda["chNFe"],
                "dhRecbto": venda["dhRecbto"],
                "cProd": venda["cProd"],
                "pICMSEfet": venda["pICMSEfet"],
            }

            data.append(venda_dict)
        
        return {"data": data}

    except Exception as e:
        return {"error": str(e)}

    finally:
        if cursor is not None:
            try:
                cursor.close()
            except:
                pass

        if connection is not None:
            try:
                connection.close()
            except:
                pass



def fetch_codes_by_id(id):
    connection = None
    cursor = None

    try:
        connection = connect_mysql_by_id(id)  
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM cod_table;
        """

        cursor.execute(query)
        rows = cursor.fetchall()
        
        
        return {"data": rows}

    except Exception as e:
        return {"error": str(e)}

    finally:
        if cursor is not None:
            try:
                cursor.close()
            except:
                pass

        if connection is not None:
            try:
                connection.close()
            except:
                pass
