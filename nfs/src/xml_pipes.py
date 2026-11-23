from xml.dom import minidom
import xml.etree.ElementTree as ET
import sys
import os

from nfs.src.db.db_pipelines.db_connection_meta import connect_mysql_by_id
from nfs.src.xml_dup_remover import remove_duplicates

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from nfs.src.schema_builder import schema_builder_v1, schema_builder_v1_db, schema_builder_v2, schema_builder_v2_db
from nfs.src.xml_builder import create_xml_tree



def write_xml(tree, filename):

    xml_str = ET.tostring(tree.getroot(), encoding='utf-8', method='xml').decode()

    pretty_xml = minidom.parseString(xml_str).toprettyxml(indent="  ")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(pretty_xml)


def xml_input_pipeline():
    schema = schema_builder_v1()
    tree = create_xml_tree(schema)
    tree = remove_duplicates(tree)
    return tree

def xml_input_pipeline_by_id(id):
    connection = connect_mysql_by_id(id)
    schema = schema_builder_v1_db(connection)
    tree = create_xml_tree(schema)
    tree = remove_duplicates(tree)
    return tree

def xml_output_pipeline(month, year):  
    schema = schema_builder_v2(month, year)
    tree = create_xml_tree(schema)

    return tree

def xml_output_pipeline_by_id(month, year, id):
    connection = connect_mysql_by_id(id)  
    schema = schema_builder_v2_db(month, year, connection)
    tree = create_xml_tree(schema)

    return tree