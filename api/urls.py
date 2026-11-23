from django.urls import path

from api.views.views import DatabaseConnectionViewSet, EnterpriseViewSet, GroupViewSet, UserEnterpriseViewSet, UserViewSet
from .views import *
from rest_framework.routers import DefaultRouter
from django.views.decorators.cache import cache_page
from api.views import *



app_name = 'nfs'

router = DefaultRouter(trailing_slash=False)
router.register(r'databases', DatabaseConnectionViewSet)
router.register(r'enterprises', EnterpriseViewSet)
router.register(r'user', UserViewSet)
router.register(r'groups', GroupViewSet, basename='groups')
router.register(r'userenterprise', UserEnterpriseViewSet, basename='userenterprise')




urlpatterns = router.urls