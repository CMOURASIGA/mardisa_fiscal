from xml.dom import minidom
import xml.etree.ElementTree as ET
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))

from src.xml_builder import create_xml_tree

schema = [
    ('enviProdutoRessarcimento', None, None),
    ('versao', 'enviProdutoRessarcimento', '1.0'),
    ('dadosDeclarante', 'enviProdutoRessarcimento', None),
    ('cnpjRai', 'dadosDeclarante', '12345678000195'),
    ('razaoSocial', 'dadosDeclarante', 'Empresa Exemplo LTDA'),
    ('nomeResponsavel', 'dadosDeclarante', 'João Silva'),
    ('foneResponsavel', 'dadosDeclarante', '(11) 98765-4321'),
    ('emailResponsavel', 'dadosDeclarante', 'joao.silva@empresa.com'),
    ('listaProdutos', 'enviProdutoRessarcimento', None),
    ('produto', 'listaProdutos', None),
    ('codInternoProduto', 'produto', '12345'),
    ('descricaoProduto', 'produto', 'Gato Persa'),
    ('unidadeInternaProduto', 'produto', 'unidade'),
    ('fatorConversao', 'produto', '1.0'),
    ('cnpjFornecedo', 'produto', '98765432000198'),
    ('codProdFornecedo', 'produto', '54321'),
    ('unidadeProdutoFornecedor', 'produto', 'unidade'), 
    ('produto', 'listaProdutos', None),
    ('codInternoProduto', 'produto', '0000'),
    ('descricaoProduto', 'produto', 'Gato fofo'),
    ('unidadeInternaProduto', 'produto', 'serviço'),
    ('fatorConversao', 'produto', '1.0'),
    ('cnpjFornecedo', 'produto', '98765432000198'),
    ('codProdFornecedo', 'produto', '54321'),
    ('unidadeProdutoFornecedor', 'produto', 'unidade'),
]

""" root = ET.Element('enviProdutoRessarcimento')

create_xml_tree(root, estrutura)

tree = ET.ElementTree(root)
tree.write('produto_ressarcimento_com_valores.xml', encoding='utf-8', xml_declaration=True)

ET.dump(root) """


def write_xml(tree, filename):

    xml_str = ET.tostring(tree.getroot(), encoding='utf-8', method='xml').decode()

    pretty_xml = minidom.parseString(xml_str).toprettyxml(indent="  ")

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(pretty_xml)

""" tree = create_xml_tree(schema)
ET.dump(tree)
write_xml(tree, 'output.xml') """