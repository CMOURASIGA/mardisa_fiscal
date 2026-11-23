from rest_framework import serializers
from api.Models.model_enterprise import Enterprise
from api.Models.model_db import DatabaseConnection
from api.Models.model_NFECompra import NFECompra
from django.contrib.auth.models import User, Group



class ICMS70Serializer(serializers.ModelSerializer):
    class Meta:
        model = NFECompra
        fields = [
            'modBC', 'pICMSST', 'vICMSST', 'pRedBC', 'orig', 'CST', 'modBCST', 
            'vBCST', 'vBC', 'vICMS', 'pICMS'
        ]

class NFECompraSerializer(serializers.ModelSerializer):
    icms70 = ICMS70Serializer()

    class Meta:
        model = NFECompra
        fields = '__all__'  


class EnterpriseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Enterprise
        fields = '__all__'  

class DatabaseConnectionSerializer(serializers.ModelSerializer):
    enterprise = EnterpriseSerializer(source='enterprise_id', read_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = DatabaseConnection
        fields = '__all__'



class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    # Retorna os Grupos detalhados no GET
    groups_detail = GroupSerializer(source='groups', many=True, read_only=True)

    # Grupos enviados no POST/PUT
    groups = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    # Empresas enviadas no POST/PUT e também retornadas no GET
    enterprises = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Enterprise.objects.all(),
        required=False
    )

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'password',
            'email',
            'first_name',
            'last_name',
            'groups',            # write-only
            'groups_detail',     # read-only
            'enterprises',       # read/write
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        # 🔥 FIX: garante que groups nunca seja None
        group_ids = validated_data.pop("groups", []) or []
        enterprises = validated_data.pop("enterprises", []) or []
        password = validated_data.pop("password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        # Add groups
        if group_ids:
            groups = Group.objects.filter(id__in=group_ids)
            user.groups.set(groups)

        # Add enterprises
        if enterprises:
            user.enterprises.set(enterprises)

        return user

    def update(self, instance, validated_data):
        # group_ids e enterprises podem vir vazios ou None, mas não podem quebrar o .filter/.set
        group_ids = validated_data.pop("groups", None)
        enterprises = validated_data.pop("enterprises", None)
        password = validated_data.pop("password", None)

        # Update normal fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        # Update groups
        if group_ids is not None:
            groups = Group.objects.filter(id__in=group_ids or [])
            instance.groups.set(groups)

        # Update enterprises
        if enterprises is not None:
            instance.enterprises.set(enterprises or [])

        return instance



""" class UserSerializer(serializers.ModelSerializer):
    groups = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Group.objects.all(),
        required=False
    )

    enterprises = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Enterprise.objects.all(),
        required=False
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "password",
            "email",
            "first_name",
            "last_name",
            "groups",
            "enterprises",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        groups = validated_data.pop("groups", [])
        enterprises = validated_data.pop("enterprises", [])

        user = User.objects.create_user(**validated_data)

        if groups:
            user.groups.set(groups)

        if enterprises:
            user.enterprises.set(enterprises)

        return user

    def update(self, instance, validated_data):
        groups = validated_data.pop("groups", None)
        enterprises = validated_data.pop("enterprises", None)

        instance = super().update(instance, validated_data)

        if groups is not None:
            instance.groups.set(groups)

        if enterprises is not None:
            instance.enterprises.set(enterprises)

        return instance

     """


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


""" class UserEnterpriseSerializer(serializers.ModelSerializer):
    enterprises = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Enterprise.objects.all()
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "enterprises"]

    def update(self, instance, validated_data):
       
        enterprises = validated_data.pop("enterprises", None)

        
        instance = super().update(instance, validated_data)

        
        if enterprises is not None:
            instance.enterprises.set(enterprises)

        return instance

    def create(self, validated_data):
        enterprises = validated_data.pop("enterprises", None)

        user = User.objects.create(**validated_data)

        if enterprises:
            user.enterprises.set(enterprises)

        return user """

class UserEnterpriseSerializer(serializers.ModelSerializer):
    enterprises = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Enterprise.objects.all()
    )

    class Meta:
        model = User
        fields = ["id", "username", "email", "enterprises"]

    def create(self, validated_data):
        enterprises = validated_data.pop("enterprises", [])

        user = User.objects.create_user(**validated_data)
        user.enterprises.set(enterprises)

        return user

    def update(self, instance, validated_data):
        enterprises = validated_data.pop("enterprises", None)

        instance = super().update(instance, validated_data)

        if enterprises is not None:
            instance.enterprises.set(enterprises)

        return instance
