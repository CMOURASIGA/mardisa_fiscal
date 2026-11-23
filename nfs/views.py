from io import BytesIO
import json
import zipfile
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from rest_framework.response import Response
from api.Models.model_enterprise import Enterprise
from api.Models.model_db import DatabaseConnection
from api.Models.model_NFECompra import NFECompra
from api.nfe_loader import nfe_compra_loader
from nfs.src.bulk_xml import process_and_persist, process_and_persist_buy_db, process_and_persist_sale, process_and_persist_sale_db, process_xml_files_in_folder, process_xml_files_in_folder_sale
from nfs.src.data_fetch.fetch_databse import get_database_connections_by_enterprise
from nfs.src.data_fetch.fetch_user import get_users_by_enterprise
from nfs.src.db.db_pipelines.db_code_pipeline import delete_code, insert_code, update_code
from nfs.src.db.db_pipelines.db_connection_meta import connect_mysql_by_id
from nfs.src.db.db_pipelines.my_SQL_pipeline import mysql_pipeline
from nfs.src.db.db_query.cod_table_query import import_csv_to_mysql
from nfs.src.fetch_data import fetch_buy_receipt, fetch_buy_receipt_by_id, fetch_codes_by_id, fetch_report_data, fetch_report_data_by_id, fetch_sale_receipt, fetch_sale_receipt_by_id
from nfs.src.forms import FileNameForm
from nfs.src.xml_pipes import xml_input_pipeline, xml_input_pipeline_by_id, xml_output_pipeline
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
import xml.etree.ElementTree as ET
from api.serializers.serializers import EnterpriseSerializer, UserEnterpriseSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView







def get_file_name(request):
    if request.method == "POST":
        form = FileNameForm(request.POST)
        if form.is_valid():
            file_name = form.cleaned_data['file_name']
            # Redirect to the download view with the specified file name
            return redirect('download_xml', file_name=file_name)
    else:
        form = FileNameForm()
    
    return render(request, 'file_name_form.html', {'form': form})


def download_xml_v1(response):

    tree = xml_input_pipeline('WDD3G8HW6KW029721')
    
    response = HttpResponse(content_type="application/xml")
    response['Content-Disposition'] = 'attachment; filename="data.xml"'

    tree.write(response, encoding="utf-8", xml_declaration=True)
    
    return response


def download_xml_v2(response):

    tree = xml_output_pipeline(111111111)
    
    response = HttpResponse(content_type="application/xml")
    response['Content-Disposition'] = 'attachment; filename="data.xml"'

    tree.write(response, encoding="utf-8", xml_declaration=True)
    
    return response


def bulk_loader_buy(response):
    folder_path = r'C:\Users\Mathe\Downloads\NF Compras\NF Compras\2024'
    process_xml_files_in_folder(folder_path)
    return HttpResponse(response)


def bulk_loader_sale(response):
    folder_path = r'C:\Users\Mathe\Downloads\NF VENDAS\NF VENDAS\2020'
    process_xml_files_in_folder_sale(folder_path)
    return HttpResponse(response)


def download_xml_v1_bulk23(request):
    chassis_list = NFECompra.objects.values_list('chassi', flat=True)
    
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for chassis in chassis_list:
            print(f"Gerando nota para Chassi: {chassis}")
            
            nfe_list = NFECompra.objects.filter(chassi=chassis)
            
            if nfe_list.count() == 1:
                tree = xml_input_pipeline(chassis)
                xml_buffer = BytesIO()
                tree.write(xml_buffer, encoding="utf-8", xml_declaration=True)
                xml_buffer.seek(0)
                zip_file.writestr(f"{chassis}_n1.xml", xml_buffer.read())
            else:
                print(f"Warning: Found {nfe_list.count()} records for chassi {chassis}. Skipping.")
    
    zip_buffer.seek(0)
    
    response = HttpResponse(zip_buffer.read(), content_type="application/zip")
    response['Content-Disposition'] = 'attachment; filename="chassis_xml_files.zip"'
    
    return response


def download_xml_v2_bulk_2(request):
    chassis_list = NFECompra.objects.values_list('chassi', flat=True)
    
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for chassis in chassis_list:
            print(f"Gerando nota para Chassi: {chassis}")
            
            nfe_list = NFECompra.objects.filter(chassi=chassis)
            
            if nfe_list.count() == 1:
                tree = xml_output_pipeline(chassis)
                xml_buffer = BytesIO()
                tree.write(xml_buffer, encoding="utf-8", xml_declaration=True)
                xml_buffer.seek(0)
                zip_file.writestr(f"{chassis}_n2.xml", xml_buffer.read())
            else:
                print(f"Warning: Found {nfe_list.count()} records for chassi {chassis}. Skipping.")
    
    zip_buffer.seek(0)
    
    response = HttpResponse(zip_buffer.read(), content_type="application/zip")
    response['Content-Disposition'] = 'attachment; filename="chassis_xml_files_m2.zip"'
    
    return response




def fetch_nf_buy_json_by_id(request, id):
    try:
        # Recupera os metadados do banco baseado na empresa dona
        db_conn = DatabaseConnection.objects.filter(enterprise_id=id).first()

        # Recupera o id do banco
        db_id = db_conn.id

        # Passa o id do banco na função para retornar os dados de Notas de Compra
        data = fetch_buy_receipt_by_id(db_id)

        return JsonResponse(data, safe=False)

    except DatabaseConnection.DoesNotExist:
        return JsonResponse(
            {"error": "No database connection found for this enterprise"},
            status=404
        )


def fetch_nf_sale_json_by_id(request, id):
    try:
        # Recupera os metadados do banco baseado na empresa dona
        db_conn = DatabaseConnection.objects.filter(enterprise_id=id).first()

        # Recupera o id do banco
        db_id = db_conn.id

        # Passa o id do banco na função para retornar os dados de Notas de Venda
        data = fetch_sale_receipt_by_id(db_id)

        return JsonResponse(data, safe=False)

    except DatabaseConnection.DoesNotExist:
        return JsonResponse(
            {"error": "No database connection found for this enterprise"},
            status=404
        )


def fetch_report_data_json_by_id(request, id):
    try:
        # Recupera os metadados do banco baseado na empresa dona
        db_conn = DatabaseConnection.objects.filter(enterprise_id=id).first()

        # Recupera o id do banco
        db_id = db_conn.id

        # Passa o id do banco na função para retornar os dados de Relatório
        data = fetch_report_data_by_id(db_id)

        return JsonResponse(data, safe=False)

    except DatabaseConnection.DoesNotExist:
        return JsonResponse(
            {"error": "No database connection found for this enterprise"},
            status=404
        )



def fetch_nf_buy_json(request):
    
    data = fetch_buy_receipt()

    return JsonResponse(data)

def fetch_nf_sale_json(request):
    
    data = fetch_sale_receipt()

    return JsonResponse(data)

def fetch_report_data_json(request):
    
    data = fetch_report_data()

    return JsonResponse(data)



def download_xml_v1_bulk(request):
    zip_buffer = BytesIO()

    try:
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            print(f"Gerando notas de produto")
            tree = xml_input_pipeline()
            
            
            if tree is not None:
                
                xml_buffer = BytesIO()
                tree.write(xml_buffer, encoding="utf-8", xml_declaration=True, default_namespace=None, method='xml', short_empty_elements=True)
                xml_buffer.seek(0)
                
                zip_file.writestr(f"produto.xml", xml_buffer.read())
            else:
                
                return HttpResponse('{"response": "Nenhum Arquivo Gerado"}', content_type="application/json")
        
        
        zip_buffer.seek(0)
        response = HttpResponse(zip_buffer.read(), content_type="application/zip")
        response['Content-Disposition'] = 'attachment; filename="product_xml_files.zip"'
        return response

    except Exception as e:
        return HttpResponse(f'{{"error": "Falha em gerar Arquivo. Certifique-se de que foram adicionados notas de produtos novas."}}', content_type="application/json", status=500)
    

def download_xml_v2_bulk(request):

    year = request.GET.get('year')
    month = request.GET.get('month')

    start_date = '2020-12-01'
    end_date = '2020-12-31'

    if not year or not month:
        return HttpResponse("Missing year or month", status=400)
    
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        
        print(f"Gerando nota para o periodo de {month} de {year}")
            
        tree = xml_output_pipeline(month, year)
        xml_buffer = BytesIO()
        tree.write(xml_buffer, encoding="utf-8", xml_declaration=True)
        xml_buffer.seek(0)
        zip_file.writestr(f"operacao_{year}_{month}_n2.xml", xml_buffer.read())

    zip_buffer.seek(0)
    
    response = HttpResponse(zip_buffer.read(), content_type="application/zip")
    response['Content-Disposition'] = f'attachment; filename="operacao{start_date}_m2.zip"'
        
    return response



import xml.etree.ElementTree as ET
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def upload_xml_obs(request):
    if request.method == 'POST':
        file_type = request.POST.get('type') 
        
        if not file_type:
            return JsonResponse({'status': 'error', 'message': 'Tipo é requirido.'}, status=400)

        if request.FILES.getlist('files'):
            try:
                xml_count = 0
                for uploaded_file in request.FILES.getlist('files'):
                    xml_content = uploaded_file.read().decode('utf-8')  

                    match file_type:
                        case 'compra':
                            process_and_persist(xml_content)
                            
                        case 'venda':
                            process_and_persist_sale(xml_content)
                            
                        case _:
                            continue

                    xml_count = xml_count + 1
                return JsonResponse({'status': 'success', 'type': file_type, 'files_uploaded': xml_count}, status=200)
            
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
        
        else:
            return JsonResponse({'status': 'error', 'message': 'No files uploaded'}, status=400)

    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_db(request, id):
    msg = mysql_pipeline(id)
    return HttpResponse("{'response':" + f"'{msg}'" + "}")



@csrf_exempt
def upload_xml(request, id):
    if request.method == 'POST':
        file_type = request.POST.get('type') 
        
        if not file_type:
            return JsonResponse({'status': 'error', 'message': 'Tipo é requirido.'}, status=400)

        if request.FILES.getlist('files'):
            try:
                xml_count = 0
                connection = connect_mysql_by_id(id)
                for uploaded_file in request.FILES.getlist('files'):
                    xml_content = uploaded_file.read().decode('utf-8')  

                    match file_type:
                        case 'compra':
                            process_and_persist_buy_db(xml_content, connection)
                            
                        case 'venda':
                            process_and_persist_sale_db(xml_content, connection)
                            
                        case _:
                            continue

                    xml_count = xml_count + 1
                connection.commit()
                return JsonResponse({'status': 'success', 'type': file_type, 'files_uploaded': xml_count}, status=200)
            
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
            finally:
                connection.close()
        
        else:
            return JsonResponse({'status': 'error', 'message': 'No files uploaded'}, status=400)

    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
    

    

def download_xml_v1_bulk_by_id(request, id):
    zip_buffer = BytesIO()

    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            print(f"Gerando notas de produto")
            tree = xml_input_pipeline_by_id(id)
            
            
            if tree is not None:
                
                xml_buffer = BytesIO()
                tree.write(xml_buffer, encoding="utf-8", xml_declaration=True, default_namespace=None, method='xml', short_empty_elements=True)
                xml_buffer.seek(0)
                
                zip_file.writestr(f"produto.xml", xml_buffer.read())
            else:
                
                return HttpResponse('{"response": "Nenhum Arquivo Gerado"}', content_type="application/json")
        
        
    zip_buffer.seek(0)
    response = HttpResponse(zip_buffer.read(), content_type="application/zip")
    response['Content-Disposition'] = 'attachment; filename="product_xml_files.zip"'
    return response

    """  except Exception as e:
        return HttpResponse(f'{{"error": "Falha em gerar Arquivo. Certifique-se de que foram adicionados notas de produtos novas."}}', content_type="application/json", status=500)
     """

def download_xml_v2_bulk_by_id(request, id):

    year = request.GET.get('year')
    month = request.GET.get('month')


    if not year or not month:
        return HttpResponse("Missing year or month", status=400)
    
    zip_buffer = BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        
        print(f"Gerando nota para o periodo de {month} de {year}")
            
        tree = xml_output_pipeline(month, year)
        xml_buffer = BytesIO()
        tree.write(xml_buffer, encoding="utf-8", xml_declaration=True)
        xml_buffer.seek(0)
        zip_file.writestr(f"operacao_{year}_{month}_n2.xml", xml_buffer.read())

    zip_buffer.seek(0)
    
    response = HttpResponse(zip_buffer.read(), content_type="application/zip")
    response['Content-Disposition'] = f'attachment; filename="operacao{year}_{month}_m2.zip"'
        
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_enterprises(request):
    user = request.user

    enterprises = user.enterprises.all()

    serializer = EnterpriseSerializer(enterprises, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_db_connection_by_id(request, id):
    
    data = get_database_connections_by_enterprise(id)
    return Response(list(data))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_enterprise_users_view(request, id):
    users = get_users_by_enterprise(id)

    if users is None:
        return Response(
            {'detail': 'Enterprise not found'},
            status=404
        )

    serializer = UserEnterpriseSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_codes_by_id(request, id):
    
    data = fetch_codes_by_id(id)
    
    return Response(data)


@api_view(['GET'])
def import_data_csv(request, id):
   

    data = import_csv_to_mysql(id)
    return Response('cat')


@api_view(['POST'])
def upload_CSV(request, id):

    csv_file = request.FILES.get("file")
    enterprise_id = request.data.get("enterprise_id")

    if not csv_file:
        return Response({"error": "CSV é requerido."}, status=400)

    if not csv_file.name.lower().endswith(".csv"):
        return Response({"error": "Apenas CSV permitido."}, status=400)

    if not enterprise_id:
        return Response({"error": "enterprise_id é obrigatório."}, status=400)

    try:
        result = import_csv_to_mysql(csv_file, int(enterprise_id))
    except Exception as e:
        return Response({"error": str(e)}, status=500)

    if result["status"] == "error":
        return Response(result, status=400)

    return Response({
        "message": "CSV processado com sucesso",
        "inserted": result["inserted"],
        "duplicates": result["duplicates"],
        "failed": result["failed"],
    }, status=200)


@api_view(["POST"])
def insert_code_view(request, enterprise_id):
    try:
        body = json.loads(request.body.decode("utf-8"))
        # dict: { "cod_sup": "...", "cod_int": "...", "un": "..." }

        insert_code(enterprise_id, body)

        return JsonResponse({"success": True, "message": "Row created"})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)



@api_view(["DELETE"])
def delete_code_view(request, enterprise_id, id):
    try:
        delete_code(enterprise_id, id)
        return Response({"success": True, "message": "Row deleted"}, status=200)
    except Exception as e:
        print("DELETE ERROR:", e)
        return Response(
            {"success": False, "error": str(e)},
            status=500
        )

@api_view(["PUT"])
def update_code_view(request, enterprise_id, id):
    try:
        body = json.loads(request.body.decode("utf-8"))


        if not id:
            return JsonResponse({"success": False, "error": "Missing id"}, status=400)

        if not body:
            return JsonResponse({"success": False, "error": "No fields to update"}, status=400)

        update_code(enterprise_id, id, body)

        return JsonResponse({"success": True, "message": "Row updated"})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)

