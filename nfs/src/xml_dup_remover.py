import xml.etree.ElementTree as ET

def remove_duplicates(xml_tree):
    root = xml_tree.getroot()

    seen = set() 
    remove_list = []  


    lista_produtos = root.find('listaProdutos')
    if lista_produtos is not None:
        for produto in lista_produtos.findall('produto'):
            cnpj_fornecedor = produto.find('cnpjFornecedor')
            cod_prod_fornecedor = produto.find('codProdFornecedor')


            if cnpj_fornecedor is not None and cod_prod_fornecedor is not None:
                key = (cnpj_fornecedor.text.strip(), cod_prod_fornecedor.text.strip())

                if key in seen:
                    remove_list.append(produto)
                else:
                    seen.add(key)


    for elem in remove_list:
        lista_produtos.remove(elem)

    return xml_tree