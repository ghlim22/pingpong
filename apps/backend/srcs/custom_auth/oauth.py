import secrets
from urllib.parse import urlencode, urlparse

import requests
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework.status import HTTP_200_OK
from users.models import CustomUser

from .token import create_token, logout_all


def redirect_home(params: dict = None) -> HttpResponse:
    """
    Redirect to home.
    """
    url = "https://" + settings.SERVER_ADDR + "/login?"
    if params is not None:
        url += urlencode(params)

    return redirect(to=url, permanent=True)


def request_token(code: str) -> str | HttpResponse:
    """
    Request an access token to 42API.
    """
    url = "https://api.intra.42.fr/oauth/token"
    callback_url = "https://" + settings.SERVER_ADDR + "/api/auth/redirect"
    params = {
        "grant_type": "authorization_code",
        "client_id": settings.API_UID,
        "client_secret": settings.API_SECRET,
        "code": code,
        "redirect_uri": callback_url,
    }

    response = requests.post(url=url, data=params)
    if response.status_code != HTTP_200_OK:
        return redirect_home()
    access_token = response.json().get("access_token")

    return access_token


def request_user(access_token: str) -> dict | HttpResponse:
    """
    Request the resource owner's data to 42API.
    """
    url = "https://api.intra.42.fr/v2/me"
    headers = {
        "Authorization": f"Bearer {access_token}",
    }

    response = requests.get(url=url, headers=headers)
    if response.status_code != HTTP_200_OK:
        return redirect_home()

    data = {
        "email": response.json().get("email"),
        "login": response.json().get("login"),
        "image": response.json().get("image").get("link"),
    }

    return data


def register(**kwargs) -> CustomUser:
    """
    Create a user with given credentials from 42API.
    """
    email = kwargs.get("email")
    nickname = kwargs.get("nickname")
    image = kwargs.get("image")

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

    return user


def login(**kwargs) -> dict:
    """
    Login a user with given credentials from 42API.
    """
    try:
        user = CustomUser.objects.get(email=kwargs.get("email"))
    except ObjectDoesNotExist:
        user = register(kwargs)
    logout_all(user)
    token = create_token(user)
    data = {
        "pk": user.pk,
        "email": user.email,
        "nickname": user.nickname,
        "picture": user.picture.url,
        "token": token,
    }

    return data
