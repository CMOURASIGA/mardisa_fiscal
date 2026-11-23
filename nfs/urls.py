"""
URL configuration for nfs_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django import views
from django.contrib import admin
from django.urls import include, path

from nfs.views import *
from api.views.views import LoginView
from rest_framework_simplejwt.views import TokenRefreshView

base_url = 'api/v1/'

urlpatterns = [
    #path('api/v1/', include('api.urls', namespace='api')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/v1/', include('api.urls', namespace='api')),
    path('admin/', admin.site.urls),
    path('enter-file-name/', get_file_name, name='get_file_name'),
    path(base_url + 'download/xml_v1/', download_xml_v1, name='download_xml_v1'),
    path(base_url + 'download/xml_v2/', download_xml_v2, name='download_xml_v2'),
    path(base_url + 'bulk_buy', bulk_loader_buy, name='bulk_loader_buy'),
    path(base_url + 'bulk_sale', bulk_loader_sale, name='bulk_loader_sale'),

    #ORM OBSOLETE
    path(base_url + 'download/bulk_v1/', download_xml_v1_bulk, name='bulk_v1'),
    path(base_url + 'download/bulk_v2/', download_xml_v2_bulk, name='bulk_v2'),
    path(base_url + 'fetch-buy', fetch_nf_buy_json, name='fetch_buy'),
    path(base_url + 'fetch-sale', fetch_nf_sale_json, name='fetch_sale'),
    path(base_url + 'fetch-report', fetch_report_data_json, name='fetch_report'),

    #MULTI-TENANT CURRENT
    path(base_url + 'download/bulk_v1/<int:id>', download_xml_v1_bulk_by_id, name='bulk_v1'),
    path(base_url + 'download/bulk_v2/<int:id>', download_xml_v2_bulk_by_id, name='bulk_v2'),
    path(base_url + 'fetch-buy/<int:id>', fetch_nf_buy_json_by_id, name='fetch_buy_by_id'),
    path(base_url + 'fetch-sale/<int:id>', fetch_nf_sale_json_by_id, name='fetch_sale_by_id'),
    path(base_url + 'fetch-report/<int:id>', fetch_report_data_json_by_id, name='fetch_report_by_id'),
    path(base_url + 'fetch-db/<int:id>', get_db_connection_by_id, name='fetch_db_by_enterprise_id'),
    path(base_url + 'fetch-code/<int:id>', get_codes_by_id, name='fetch_codes_id'),
    path(base_url + 'fetch-user/<int:id>', get_enterprise_users_view, name='fetch_user_by_enterprise_id'),
    path(base_url + 'upload_csv/<int:id>', upload_CSV, name='fetch_user_by_enterprise_id'),

    #CODE ENDPOINTS
    path(base_url + 'delete-code/<int:enterprise_id>/<int:id>', delete_code_view, name='delete_code_by_enterprise_id'),
    path(base_url + 'update-code/<int:enterprise_id>/<int:id>', update_code_view, name='update_code_by_enterprise_id'),
    path(base_url + 'insert-code/<int:enterprise_id>', insert_code_view, name='insert_code'),


    path(base_url + 'createdb/<int:id>/', create_db, name='create_db'),
    path(base_url + 'enterprises/user/', get_user_enterprises, name='enterprise-user'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path(base_url + 'upload-xml/<int:id>/', upload_xml, name='upload_xml_obs'),
    path(base_url + 'upload-xml/', upload_xml_obs, name='upload_xml'),
]
