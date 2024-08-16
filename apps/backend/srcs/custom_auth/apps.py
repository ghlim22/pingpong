import django
from django.apps import AppConfig


class CustomAuthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "custom_auth"

    def ready(self):
        # from channels.db import database_sync_to_async
        # from django.contrib.auth.models import AnonymousUser
        # from django.core.exceptions import ObjectDoesNotExist
        # from rest_framework.authtoken.models import Token
        # from urllib.parse import parse_qs
        import custom_auth.signals

        # django.setup()
