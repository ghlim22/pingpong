import django


from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import AuthenticationFailed

from .token import authenticate

django.setup()


@database_sync_to_async  # Retrieving the data from the database asynchronously.
def get_user(token: str):
    try:
        user = authenticate(token)
    except AuthenticationFailed:
        user = AnonymousUser()
    return user


class CustomTokenAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope["query_string"]
        query_params = query_string.decode()
        query_dict = parse_qs(query_params)  # Parse the query params from string to dict.
        token = query_dict["token"][0]
        user = await get_user(token)
        scope["user"] = user
        return await self.app(scope, receive, send)
