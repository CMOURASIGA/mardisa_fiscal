

from datetime import datetime
import os
from api.Models.model_enterprise import Enterprise
from api.Models.model_NFEVenda import NFEVenda
from api.Models.model_NFECompra import NFECompra
from django.db import connections


def schema_builder_v11(cod_chassi):

    nfe = NFECompra.objects.get(chassi=cod_chassi)
    if nfe:
        #Dados Dest
        razao_social = nfe.xNome
        cnpj = nfe.CNPJ

        #Dados Prod
        cod_interno_produto = nfe.chassi
        descricao_produto = nfe.xProd[27:]
        unidade_interna_produto = nfe.uCom
        fator_conversao = '1'

        #Dados Emit
        emit_cnpj = nfe.emit_CNPJ
        cod_prod_fornecedor = nfe.chassi
        unidade_produto_fornecedor = nfe.uCom
        #unidade_produto_fornecedor = str(nfe.nItem)

        schema = [
        ('enviProdutoRessarcimento', None, None),
        ('versao', 'enviProdutoRessarcimento', '1.0'),
        ('dadosDeclarante', 'enviProdutoRessarcimento', None),
        ('cnpjRai', 'dadosDeclarante', cnpj),
        ('razaoSocial', 'dadosDeclarante', razao_social),
        ('nomeResponsavel', 'dadosDeclarante', 'João Silva'),
        ('foneResponsavel', 'dadosDeclarante', '(11) 98765-4321'),
        ('emailResponsavel', 'dadosDeclarante', 'joao.silva@empresa.com'),
        ('listaProdutos', 'enviProdutoRessarcimento', None),
        ('produto', 'listaProdutos', None),
        ('codInternoProduto', 'produto', cod_interno_produto),
        ('descricaoProduto', 'produto', descricao_produto),
        ('unidadeInternaProduto', 'produto', unidade_interna_produto),
        ('fatorConversao', 'produto', fator_conversao),
        ('cnpjFornecedo', 'produto', emit_cnpj),
        ('codProdFornecedo', 'produto', cod_prod_fornecedor),
        ('unidadeProdutoFornecedor', 'produto', unidade_produto_fornecedor), 
    ]
        return schema
    else:
        return None

def schema_builder_v23(cod_chassi):

    nfe_in = NFECompra.objects.get(chassi=cod_chassi)
    nfe_out = NFEVenda.objects.get(chassi=cod_chassi)

    cnpj_raiz = nfe_in.CNPJ
    razao_social = nfe_in.xNome

    nome_responsavel = os.getenv('nome_responsavel')
    fone_responsavel = os.getenv('fone_responsavel')
    email_responsavel = os.getenv('email_responsavel')

    date_raw = nfe_in.dhRecbto
    ano = str(date_raw.year)
    mes = str(date_raw.month)

    chave_nfe_saida = nfe_out.chNFe

    cod_item = nfe_in.chassi
    n_item_nfe = str(nfe_in.nItem)
    chave_nfe_entrada = nfe_in.chNFe

    chave_cte = 0
    chave_mdf = 0

    schema = [
    ("enviOperacaoRessarcimento", None, None),
    ("versao", "enviOperacaoRessarcimento", '1.0'),
    ("dadosDeclaracao", "enviOperacaoRessarcimento", None),
    ("cnpjRaiz", "dadosDeclaracao", cnpj_raiz),
    ("ieContribuinteDeclarante", "dadosDeclaracao", None),
    ("razaoSocial", "dadosDeclaracao", razao_social),
    ("nomeResponsavel", "dadosDeclaracao", nome_responsavel),
    ("foneResponsavel", "dadosDeclaracao", fone_responsavel),
    ("emailResponsavel", "dadosDeclaracao", email_responsavel),
    ("anoPeriodoReferencia", "dadosDeclaracao", ano),
    ("mesPeriodoReferencia", "dadosDeclaracao", mes),
    ("listaOperacoes", "enviOperacaoRessarcimento", None),
    ("operacao", "listaOperacoes", None),
    ("chaveNFe", "operacao", chave_nfe_saida),
    ("listaItens", "operacao", None),
    ("item", "listaItens", None),
    ("codInternoProduto", "item", cod_item),
    ("numItemNFe", "item", n_item_nfe),
    ("chaveNFeEntrada", "item", chave_nfe_entrada),
    ("listaNFeEntrada", "enviOperacaoRessarcimento", None),
    ("nfeEntrada", "listaNFeEntrada", None),
    ("chaveNFeEntrada", "nfeEntrada", chave_nfe_entrada),
    
]
    """ ("chaveCTeEntrada", "nfeEntrada", chave_cte),
    ("chaveMDFeEntrada", "nfeEntrada", chave_mdf) """
    
    return schema



def schema_builder_v1():
    try:
        nfes = NFECompra.objects.filter(generated=False)
        if nfes:
            #Dados Dest

            first_nfe = nfes.first()
            
            if first_nfe:
                #razao_social = first_nfe.xNome
                #cnpj = first_nfe.CNPJ
                cnpj = os.getenv('cnpj_raiz')
                razao_social = os.getenv('razao_social')
                nome_responsavel = os.getenv('nome_responsavel')
                fone_responsavel = os.getenv('fone_responsavel')
                email_responsavel = os.getenv('email_responsavel')

                schema = [
                    ('enviProdutoRessarcimento', None, None),
                    ('versao', 'enviProdutoRessarcimento', '1.00'),
                    ('dadosDeclarante', 'enviProdutoRessarcimento', None),
                    ('cnpjRaiz', 'dadosDeclarante', cnpj[:8]),
                    ('razaoSocial', 'dadosDeclarante', razao_social),
                    ('nomeResponsavel', 'dadosDeclarante', nome_responsavel),
                    ('foneResponsavel', 'dadosDeclarante', fone_responsavel),
                    ('emailResponsavel', 'dadosDeclarante', email_responsavel),
                    ('listaProdutos', 'enviProdutoRessarcimento', None),
                ]

            
            for nfe in nfes:
                #Dados Prod
                
                if nfe.chassi:
                    cod_interno_produto = nfe.chassi
                    cod_prod_fornecedor = nfe.chassi
                    if nfe.xProd[:7] == 'CHASSIS':
                        descricao_produto = nfe.xProd[27:]
                    else:
                        descricao_produto = nfe.xProd
                else:
                    descricao_produto = nfe.xProd
                    cod_interno_produto = nfe.cProd
                    cod_prod_fornecedor = nfe.cProd
                unidade_interna_produto = nfe.uCom
                fator_conversao = nfe.qcom

                #Dados Emit
                emit_cnpj = nfe.emit_CNPJ
                cod_prod_fornecedor = nfe.cProd
                unidade_produto_fornecedor = nfe.uCom
                #unidade_produto_fornecedor = str(nfe.nItem)

                prod = [
                    ('produto', 'listaProdutos', None),
                    ('codInternoProduto', 'produto', cod_interno_produto),
                    ('descricaoProduto', 'produto', descricao_produto),
                    ('unidadeInternaProduto', 'produto', unidade_interna_produto),
                    ('fatorConversao', 'produto', fator_conversao),
                    ('cnpjFornecedor', 'produto', emit_cnpj),
                    ('codProdFornecedor', 'produto', cod_prod_fornecedor),
                    ('unidadeProdutoFornecedor', 'produto', unidade_produto_fornecedor), 
                ]
                schema.extend(prod)
                
            nfes.update(generated=True)
            return schema
        else:
            return None
    except Exception as e:
        return f"Um erro ocorreu: {e}"
    


import os


def schema_builder_v1_db(connection):
    try:
        skip_count = 0
        cnpj = os.getenv('cnpj_raiz')
        razao_social = os.getenv('razao_social')
        nome_responsavel = os.getenv('nome_responsavel')
        fone_responsavel = os.getenv('fone_responsavel')
        email_responsavel = os.getenv('email_responsavel')

        if not all([cnpj, razao_social, nome_responsavel, fone_responsavel, email_responsavel]):
            return "Missing required environment variables."

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    n.*,
                    c.cod_int,
                    c.un
                FROM nfecompra n
                LEFT JOIN cod_table c
                  ON n.cProd = c.cod_sup
                WHERE n.is_generated = FALSE
            """)

            columns = [col[0] for col in cursor.description]
            nfes = cursor.fetchall()
            nfes_dicts = [dict(zip(columns, row)) for row in nfes]

        if not nfes_dicts:
            return None

        schema = [
            ('enviProdutoRessarcimento', None, None),
            ('versao', 'enviProdutoRessarcimento', '1.00'),
            ('dadosDeclarante', 'enviProdutoRessarcimento', None),
            ('cnpjRaiz', 'dadosDeclarante', cnpj[:8]),
            ('razaoSocial', 'dadosDeclarante', razao_social),
            ('nomeResponsavel', 'dadosDeclarante', nome_responsavel),
            ('foneResponsavel', 'dadosDeclarante', fone_responsavel),
            ('emailResponsavel', 'dadosDeclarante', email_responsavel),
            ('listaProdutos', 'enviProdutoRessarcimento', None),
        ]

        for nfe in nfes_dicts:
            chassi = nfe.get('chassi')
            xProd = nfe.get('xProd')
            cProd = nfe.get('cProd')
            uCom = nfe.get('uCom')
            qcom = nfe.get('qcom')
            emit_CNPJ = nfe.get('emit_CNPJ')

            cod_int = nfe.get('cod_int')  
                        

            if chassi:
                un = uCom
                cod_interno_produto = cProd
                #descricao_produto = xProd[27:] if xProd.startswith('CHASSIS') else xProd
            else:
                if not cod_int:
                    chNFe = nfe.get('chNFe')
                    natOp = nfe.get('natOp')
                    skip_count = skip_count + 1
                    print(f'Item {cProd} da nota {chNFe} não importado. Motivo: Sem correspondência. OP: {natOp}')
                    continue
                un = nfe.get('un')
                cod_interno_produto = cod_int

            descricao_produto = xProd
            
            cod_prod_fornecedor = cProd

            prod = [
                ('produto', 'listaProdutos', None),
                ('codInternoProduto', 'produto', cod_interno_produto),
                ('descricaoProduto', 'produto', descricao_produto),
                ('unidadeInternaProduto', 'produto', un),
                ('fatorConversao', 'produto', str(qcom)),
                ('cnpjFornecedor', 'produto', emit_CNPJ),
                ('codProdFornecedor', 'produto', cod_prod_fornecedor),
                ('unidadeProdutoFornecedor', 'produto', uCom),
            ]

            schema.extend(prod)
        if skip_count > 0:
            print(f'{skip_count} itens não gerados')

        with connection.cursor() as cursor:
            cursor.execute("""
                UPDATE nfecompra 
                SET is_generated = TRUE 
                WHERE is_generated = FALSE
                  AND cProd IN (SELECT cod_sup FROM cod_table)
            """)
            connection.commit()

        return schema

    except Exception as e:
        return f"An error occurred: {e}"

    finally:
        try:
            if connection:
                connection.close()
        except:
            pass



    

def schema_builder_v1_obs():
    try:
        nfes = NFECompra.objects.filter(generated=False)
        if nfes:
            #Dados Dest

            first_nfe = nfes.first()
            
            if first_nfe:
                enterprise_data = Enterprise.objects.filter(id=1)
                #razao_social = first_nfe.xNome
                #cnpj = first_nfe.CNPJ
                cnpj = os.getenv('cnpj_raiz')
                razao_social = os.getenv('razao_social')
                nome_responsavel = os.getenv('nome_responsavel')
                fone_responsavel = os.getenv('fone_responsavel')
                email_responsavel = os.getenv('email_responsavel')

                schema = [
                    ('enviProdutoRessarcimento', None, None),
                    ('versao', 'enviProdutoRessarcimento', '1.00'),
                    ('dadosDeclarante', 'enviProdutoRessarcimento', None),
                    ('cnpjRaiz', 'dadosDeclarante', cnpj[:8]),
                    ('razaoSocial', 'dadosDeclarante', razao_social),
                    ('nomeResponsavel', 'dadosDeclarante', nome_responsavel),
                    ('foneResponsavel', 'dadosDeclarante', fone_responsavel),
                    ('emailResponsavel', 'dadosDeclarante', email_responsavel),
                    ('listaProdutos', 'enviProdutoRessarcimento', None),
                ]

            
            for nfe in nfes:
                #Dados Prod
                
                if nfe.chassi:
                    cod_interno_produto = nfe.chassi
                    cod_prod_fornecedor = nfe.chassi
                    if nfe.xProd[:7] == 'CHASSIS':
                        descricao_produto = nfe.xProd[27:]
                    else:
                        descricao_produto = nfe.xProd
                else:
                    descricao_produto = nfe.xProd
                    cod_interno_produto = nfe.cProd
                    cod_prod_fornecedor = nfe.cProd
                unidade_interna_produto = nfe.uCom
                fator_conversao = nfe.qcom

                #Dados Emit
                emit_cnpj = nfe.emit_CNPJ
                cod_prod_fornecedor = nfe.cProd
                unidade_produto_fornecedor = nfe.uCom
                #unidade_produto_fornecedor = str(nfe.nItem)

                prod = [
                    ('produto', 'listaProdutos', None),
                    ('codInternoProduto', 'produto', cod_interno_produto),
                    ('descricaoProduto', 'produto', descricao_produto),
                    ('unidadeInternaProduto', 'produto', unidade_interna_produto),
                    ('fatorConversao', 'produto', fator_conversao),
                    ('cnpjFornecedor', 'produto', emit_cnpj),
                    ('codProdFornecedor', 'produto', cod_prod_fornecedor),
                    ('unidadeProdutoFornecedor', 'produto', unidade_produto_fornecedor), 
                ]
                schema.extend(prod)
                
            nfes.update(generated=True)
            return schema
        else:
            return None
    except Exception as e:
        return f"Um erro ocorreu: {e}"
    


def schema_builder_v2(month, year):

    """ try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d')
        end_date = datetime.strptime(end_date, '%Y-%m-%d')
    except ValueError:
        return "{'error': 'Formato de data invalido. Use YYYY-MM-DD.'}" """

    
    nfe_out = NFEVenda.objects.filter(dhRecbto__year=year, dhRecbto__month=month)


    cnpj_raiz = os.getenv('cnpj_raiz')
    razao_social = os.getenv('razao_social')
    nome_responsavel = os.getenv('nome_responsavel')
    fone_responsavel = os.getenv('fone_responsavel')
    email_responsavel = os.getenv('email_responsavel')

    ie_contribuinte = os.getenv('ie_contribuinte')
    

    year = str(year)
    month = f'{int(month):02d}'

    schema = [
    ("enviOperacaoRessarcimento", None, None),
    ("versao", "enviOperacaoRessarcimento", '2.00'),
    ("dadosDeclaracao", "enviOperacaoRessarcimento", None),
    ("cnpjRaiz", "dadosDeclaracao", cnpj_raiz[:8]),
    ("ieContribuinteDeclarante", "dadosDeclaracao", ie_contribuinte),
    ("razaoSocial", "dadosDeclaracao", razao_social),
    ("nomeResponsavel", "dadosDeclaracao", nome_responsavel),
    ("foneResponsavel", "dadosDeclaracao", fone_responsavel),
    ("emailResponsavel", "dadosDeclaracao", email_responsavel),
    ("anoPeriodoReferencia", "dadosDeclaracao", year),
    ("mesPeriodoReferencia", "dadosDeclaracao", month),
    ("listaOperacoes", "enviOperacaoRessarcimento", None),
    
    ]

    op = [] 
    
    veic = [("listaNFeEntrada", "enviOperacaoRessarcimento", None),
            ]
    
    

    for row in nfe_out:
        chave_nfe_saida = row.chNFe
        cProd = row.cProd
        n_item_nfe = row.nItem

        uf = row.UF

        if uf != 'AM':
            print(f'Item código {cProd} da nota {chave_nfe_saida} não gerado. Motivo: UF = {uf}')
            continue

        queryset = NFECompra.objects.filter(cProd=cProd)

        if not queryset.exists() and not row.chassi:
            print(f'Item código {cProd} da nota {chave_nfe_saida} não gerado. Motivo: Sem correspondência da tabela de compras')
            continue
        
        try:
            chave_cte = 0
            chave_mdf = 0
            op_aux = [
            ("operacao", "listaOperacoes", None),
            ("chaveNFe", "operacao", chave_nfe_saida),
            ("listaItens", "operacao", None),
            ("item", "listaItens", None),
            ("codInternoProduto", "item", cProd),
            ("numItemNFe", "item", str(n_item_nfe)),
            ]
            op.extend(op_aux)


            if row.chassi:
                nfe_in = NFECompra.objects.filter(chassi=row.chassi).first()
         
                if nfe_in is not None:
                    chave_nfe_entrada = nfe_in.chNFe
                
                    veic_key =[("chaveNFeEntrada", "item", chave_nfe_entrada),]

                    veic_aux = [
                    ("nfeEntrada", "listaNFeEntrada", None),
                    ("chaveNFeEntrada", "nfeEntrada", chave_nfe_entrada),
                    ]
                    op.extend(veic_key)
                    veic.extend(veic_aux)
                else:
                    print(f"Nenhum item encontrado na tabela de compras para: {cProd}. Ignorando campos da nota de entrada.")

        except NFECompra.DoesNotExist:
            print(f"Nenhum item encontrado na tabela de compras para: {cProd}. Ignorando campos da nota de entrada.")
            continue
        except AttributeError:
            print(f"Nenhum item encontrado na tabela de compras para: {cProd}. Ignorando esse produto.")
            continue

        
    schema.extend(op)
    schema.extend(veic)
            

    return schema


import os

def schema_builder_v2_db(month, year, connection):

   
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM nfevenda")
        columns = [col[0] for col in cursor.description]
        nfe_out = [dict(zip(columns, row)) for row in cursor.fetchall()]

    if not nfe_out:
        return None

   
    cnpj_raiz = os.getenv('cnpj_raiz')
    razao_social = os.getenv('razao_social')
    nome_responsavel = os.getenv('nome_responsavel')
    fone_responsavel = os.getenv('fone_responsavel')
    email_responsavel = os.getenv('email_responsavel')
    ie_contribuinte = os.getenv('ie_contribuinte')

    year = str(year)
    month = f'{int(month):02d}'

   
    schema = [
        ("enviOperacaoRessarcimento", None, None),
        ("versao", "enviOperacaoRessarcimento", '2.00'),
        ("dadosDeclaracao", "enviOperacaoRessarcimento", None),
        ("cnpjRaiz", "dadosDeclaracao", cnpj_raiz[:8]),
        ("ieContribuinteDeclarante", "dadosDeclaracao", ie_contribuinte),
        ("razaoSocial", "dadosDeclaracao", razao_social),
        ("nomeResponsavel", "dadosDeclaracao", nome_responsavel),
        ("foneResponsavel", "dadosDeclaracao", fone_responsavel),
        ("emailResponsavel", "dadosDeclaracao", email_responsavel),
        ("anoPeriodoReferencia", "dadosDeclaracao", year),
        ("mesPeriodoReferencia", "dadosDeclaracao", month),
        ("listaOperacoes", "enviOperacaoRessarcimento", None),
    ]

    op = []
    veic = [
        ("listaNFeEntrada", "enviOperacaoRessarcimento", None),
    ]

    
    with connection.cursor() as cursor:

        for row in nfe_out:
            chave_nfe_saida = row['chNFe']
            cProd = row['cProd']
            n_item_nfe = row['nItem']
            uf = row['UF']
            chassi = row.get('chassi')

            if uf != 'AM':
                print(f'Item código {cProd} da nota {chave_nfe_saida} não gerado. Motivo: UF = {uf}')
                continue

            
            cursor.execute(
                "SELECT 1 FROM nfecompra WHERE cProd = %s LIMIT 1",
                [cProd]
            )
            exists_compra = cursor.fetchone() is not None

            if not exists_compra and not chassi:
                print(
                    f'Item código {cProd} da nota {chave_nfe_saida} '
                    f'não gerado. Motivo: Sem correspondência da tabela de compras'
                )
                continue

            try:
                op_aux = [
                    ("operacao", "listaOperacoes", None),
                    ("chaveNFe", "operacao", chave_nfe_saida),
                    ("listaItens", "operacao", None),
                    ("item", "listaItens", None),
                    ("codInternoProduto", "item", cProd),
                    ("numItemNFe", "item", str(n_item_nfe)),
                ]
                op.extend(op_aux)

                
                if chassi:
                    cursor.execute(
                        "SELECT chNFe FROM nfecompra WHERE chassi = %s LIMIT 1",
                        [chassi]
                    )
                    compra = cursor.fetchone()

                    if compra:
                        chave_nfe_entrada = compra[0]

                        veic_key = [
                            ("chaveNFeEntrada", "item", chave_nfe_entrada),
                        ]

                        veic_aux = [
                            ("nfeEntrada", "listaNFeEntrada", None),
                            ("chaveNFeEntrada", "nfeEntrada", chave_nfe_entrada),
                        ]

                        op.extend(veic_key)
                        veic.extend(veic_aux)
                    else:
                        print(
                            f"Nenhum item encontrado na tabela de compras para: {cProd}. "
                            f"Ignorando campos da nota de entrada."
                        )

            except Exception as e:
                print(
                    f"Erro ao processar produto {cProd}: {str(e)}"
                )
                continue

    schema.extend(op)
    schema.extend(veic)

    return schema
