import io
import xml.etree.ElementTree as ET

# Função para criação dos elementos do XML
def create_xml_tree(schema):
    try:

        root = None
        nodes = {}
        root = ET
        

        for name, parent_name, value in schema:
            if parent_name is None:
                root = ET.Element(name)
                nodes[name] = root
            else:
                parent_node = nodes.get(parent_name, root)
                element = ET.SubElement(parent_node, name)
                nodes[name] = element
                if value is not None:
                    element.text = value
                else:
                    element.text = ''
        
        envi_produto_ressarcimento = nodes.get('enviProdutoRessarcimento', None)
        if envi_produto_ressarcimento is not None:
            envi_produto_ressarcimento.set('xmlns', 'http://www.sefaz.am.gov.br/ressarcimento')

        envi_operacao_ressarcimento = nodes.get('enviOperacaoRessarcimento', None)
        if envi_operacao_ressarcimento is not None:
            envi_operacao_ressarcimento.set('xmlns', 'http://www.sefaz.am.gov.br/ressarcimento')
        

        tree = ET.ElementTree(root)
        #ET.Element.insert()        
    
        return tree

    except Exception as e:
        print(f"Error: {e}")
        return None


#'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>


