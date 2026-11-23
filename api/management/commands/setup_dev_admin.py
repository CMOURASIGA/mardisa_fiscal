"""Provisiona um administrador de homologação sem credenciais fixas no repositório.

Uso: defina FISCAL_DEV_ADMIN_PASSWORD no ambiente e execute
python manage.py setup_dev_admin
"""
import os

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction


class Command(BaseCommand):
    help = "Cria ou atualiza o administrador de homologação, preservando outros usuários."

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("Comando permitido somente com DEBUG=True em ambiente local.")
        username = os.environ.get("FISCAL_DEV_ADMIN_USERNAME", "admin").strip()
        password = os.environ.get("FISCAL_DEV_ADMIN_PASSWORD", "")
        if not username or not password:
            raise CommandError(
                "Defina FISCAL_DEV_ADMIN_PASSWORD no ambiente antes de executar."
            )
        if len(password) < 10:
            raise CommandError("A senha de homologação deve ter pelo menos 10 caracteres.")

        User = get_user_model()
        with transaction.atomic():
            user, created = User.objects.get_or_create(username=username)
            user.is_active = True
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.save()
            group, _ = Group.objects.get_or_create(name="admin")
            user.groups.add(group)
        action = "criado" if created else "atualizado"
        self.stdout.write(self.style.SUCCESS(
            f"Administrador de homologação '{username}' {action}. Outros usuários preservados."
        ))
