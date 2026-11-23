import os
import xml.etree.ElementTree as ET

from api.nfe_loader import nfe_compra_loader, nfe_compra_loader_db
from api.nfe_loader_sale import nfe_venda_loader, nfe_venda_loader_db
from nfs.src.db.db_connectors.my_sql_connectors import connect_mysql_db
from nfs.src.db.db_handlers.fetch_db_meta import get_mysql_connection

def process_and_persist(xml_string):
    try:
        
        #root = ET.fromstring(xml_string)
        nfe_compra_loader(xml_string)

    except Exception as e:
        print(f"Error processing XML content: {e}")

def process_xml_files_in_folder(folder_path):
    for filename in os.listdir(folder_path):
        if filename.endswith('.xml'):
            file_path = os.path.join(folder_path, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    xml_string = file.read()
                process_and_persist(xml_string)
            except Exception as e:
                print(f"Erro lendo {filename}: {e}")

def process_and_persist_sale(xml_string):
    try:
        
        #root = ET.fromstring(xml_string)
        nfe_venda_loader(xml_string)

    except Exception as e:
        print(f"Error processing XML content: {e}")

def process_xml_files_in_folder_sale(folder_path):
    for filename in os.listdir(folder_path):
        if filename.endswith('.xml'):
            file_path = os.path.join(folder_path, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    xml_string = file.read()
                process_and_persist_sale(xml_string)
            except Exception as e:
                print(f"Erro lendo {filename}: {e}")


def process_and_persist_buy_db(xml_string, connection):
    try:

        nfe_compra_loader_db(xml_string, connection)

    except Exception as e:
        print(f"Error processing XML content: {e}")

def process_and_persist_sale_db(xml_string, connection):
    try:
        
        #root = ET.fromstring(xml_string)
        nfe_venda_loader_db(xml_string, connection)

    except Exception as e:
        print(f"Error processing XML content: {e}")
