import secrets
from urllib.parse import urlparse

import requests
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.http import HttpResponse
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED
from users.models import CustomUser


def request_token(code: str) -> str | HttpResponse:
    """
    Request an access token to 42API.
    """
    url = "https://api.intra.42.fr/oauth/token"
    params = {
        "grant_type": "authorization_code",
        "client_id": settings.API_UID,
        "client_secret": settings.API_SECRET,
        "code": code,
        "redirect_uri": settings.API_REDIRECT,
    }

    response = requests.post(url=url, data=params)
    if response.status_code != HTTP_200_OK:
        return Response(status=response.status_code)
    access_token = response.json().get("access_token")

    return access_token


def request_user(access_token: str) -> dict | HttpResponse:
    url = "https://api.intra.42.fr/v2/me"
    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    response = requests.get(url=url, headers=headers)
    if response.status_code != HTTP_200_OK:
        return Response(status=response.status_code)

    data = {
        "email": response.json().get("email"),
        "login": response.json().get("login"),
        "image": response.json().get("image").get("link"),
    }

    return data


def login(email: str) -> HttpResponse:
    """
    Log in a user with given credentials from 42API.
    """
    user = CustomUser.objects.get(email=email)
    token = Token.objects.get(user=user)
    data = {
        "pk": user.pk,
        "email": user.email,
        "nickname": user.nickname,
        "picture": user.picture.url,
        "token": token.key,
    }

    return Response(data, HTTP_200_OK)


def register(email: str, nickname: str, image: str) -> HttpResponse:
    """
    Create a user with given credentials from 42API.
    """
    try:
        CustomUser.objects.get(nickname=nickname)
        nickname = secrets.token_hex(6)
    except ObjectDoesNotExist:
        pass

    user = CustomUser.objects.create_user(email=email, password=None, nickname=nickname)
    image_name = urlparse(url=image).path.split("/")[-1]
    response = requests.get(url=image)
    if response.status_code == HTTP_200_OK:
        user.picture.save(name=image_name, content=ContentFile(response.content))
    user.save()

    token = Token.objects.get(user=user)
    data = {
        "pk": user.pk,
        "email": user.email,
        "nickname": user.nickname,
        "picture": user.picture.url,
        "token": token.key,
    }

    return Response(data, HTTP_201_CREATED)
