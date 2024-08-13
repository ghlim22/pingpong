"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

import games.routing
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": 
        AllowedHostsOriginValidator(
            AuthMiddlewareStack(
                URLRouter(
                    games.routing.websocket_urlpatterns
                )
            )
        ),
})