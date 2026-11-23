from django.http import JsonResponse
from django.shortcuts import render
from rest_framework import viewsets
from api.Models.model_enterprise import Enterprise
from api.Models.model_db import DatabaseConnection
from api.Models.model_NFECompra import NFECompra
from api.serializers.serializers import DatabaseConnectionSerializer, EnterpriseSerializer, GroupSerializer, NFECompraSerializer, UserEnterpriseSerializer, UserSerializer
from django.contrib.auth.models import User, Group
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
import xml.etree.ElementTree as ET

class NFECompraViewSet(viewsets.ModelViewSet):
    queryset = NFECompra.objects.all()
    serializer_class = NFECompraSerializer

class DatabaseConnectionViewSet(viewsets.ModelViewSet):
    queryset = DatabaseConnection.objects.all()
    serializer_class = DatabaseConnectionSerializer

class EnterpriseViewSet(viewsets.ModelViewSet):
    queryset = Enterprise.objects.all()
    serializer_class = EnterpriseSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            groups = list(user.groups.values_list("name", flat=True))
            role = groups[0] if groups else "user"

            user_data = {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": role
            }
            print(user_data)
            return Response({
                'access': access_token,
                'refresh': refresh_token,
                'user': user_data,
            })
        else:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)
        



class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer


class UserEnterpriseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserEnterpriseSerializer