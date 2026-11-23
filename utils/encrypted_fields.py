from django.db import models
from cryptography.fernet import Fernet
from django.conf import settings
import base64
import hashlib


def get_fernet():
    """
    Creates a valid 32-byte Fernet key derived from Django SECRET_KEY.
    Ensures full compatibility with Django 4/5 + Python 3.11.
    """
    key = hashlib.sha256(settings.SECRET_KEY.encode()).digest()
    return Fernet(base64.urlsafe_b64encode(key))


class EncryptedCharField(models.CharField):
    """
    Transparent encryption/decryption field that works on Django 4/5.
    """
    def get_prep_value(self, value):
        if value is None:
            return value
        f = get_fernet()
        return f.encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value
        f = get_fernet()
        return f.decrypt(value.encode()).decode()

    def to_python(self, value):
        if value is None:
            return value
        # Already decrypted?
        try:
            f = get_fernet()
            return f.decrypt(value.encode()).decode()
        except Exception:
            return value
