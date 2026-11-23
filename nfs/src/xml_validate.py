from lxml import etree


xsd_file = ''
xml_file = ''


with open(xsd_file, 'rb') as xsd:
    schema_root = etree.XML(xsd.read())
    schema = etree.XMLSchema(schema_root)


with open(xml_file, 'rb') as xml:
    xml_tree = etree.parse(xml)
    

if schema.validate(xml_tree):
    print("XML is valid.")
else:
    print("XML is invalid.")
    for error in schema.error_log:
        print(error.message)