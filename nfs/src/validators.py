import xml.etree.ElementTree as ET

#Compara se o valor do Chassi é o mesmo nos documentos de Compra e Venda
def compare_chassi(xml_sale, xml_purchase):
    try:
       
        tree_sale = ET.parse(xml_sale)
        tree_purchase = ET.parse(xml_purchase)

        root_sale = tree_sale.getroot()
        root_purchase = tree_purchase.getroot()

        chassi_sale = root_sale.find('.//chassi')  
        chassi_purchase = root_purchase.find('.//chassi')

       
        if chassi_sale is not None and chassi_purchase is not None:
            return chassi_sale.text.strip() == chassi_purchase.text.strip()  
        else:
            return False
        
    except Exception as e:
        print(f"Error: {e}")
        return False  