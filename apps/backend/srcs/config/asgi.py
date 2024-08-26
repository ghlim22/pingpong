"""
ASGI config for config project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django
import chat.routing
import games.routing
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from custom_auth.middlewares import CustomTokenAuthMiddleware
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()
application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        # "websocket": AuthMiddlewareStack(URLRouter(games.routing.websocket_urlpatterns))
        "websocket": CustomTokenAuthMiddleware(
            AllowedHostsOriginValidator(
                URLRouter(games.routing.websocket_urlpatterns + chat.routing.websocket_urlpatterns)
            )
        ),
    }
)
