import secrets
from urllib.parse import quote, urlencode, urlparse

import requests
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.http import (
    HttpResponse,
    HttpResponsePermanentRedirect,
    HttpResponseRedirect,
)
from django.shortcuts import redirect
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.models import CustomUser

# Create your views here.


def redirect_with_params(
    url: str, params: dict, permanent: bool = False
) -> HttpResponsePermanentRedirect | HttpResponseRedirect:
    url += urlencode(params)
    print(url)
    return redirect(to=url, permanent=permanent)


def redirect_failure() -> HttpResponsePermanentRedirect:
    data = {
        "status": "failure",
    }
    return redirect_with_params("https://localhost/login/?", data, True)


def get_access_token(code: str) -> str | HttpResponse:
    url = "https://api.intra.42.fr/oauth/token"
    params = {
        "grant_type": "authorization_code",
        "client_id": settings.API_UID,
        "client_secret": settings.API_SECRET,
        "code": code,
        "redirect_uri": settings.API_REDIRECT,
    }
    response = requests.post(url=url, data=params)
    if response.status_code != status.HTTP_200_OK:
        return Response(status=response.status_code)
        # return redirect_failure()
    access_token = response.json().get("access_token")
    return access_token


def get_user_data(access_token: str) -> dict | HttpResponse:
    url = "https://api.intra.42.fr/v2/me"
    headers = {
        "Authorization": f"Bearer {access_token}",
    }
    response = requests.get(url=url, headers=headers)
    if response.status_code != status.HTTP_200_OK:
        return Response(status=response.status_code)
        # return redirect_failure()
    data = {
        "status": "success",
        "email": response.json().get("email"),
        "login": response.json().get("login"),
        "image": response.json().get("image").get("link"),
    }
    print(data)
    return data


def redirect_to_start(user: CustomUser) -> HttpResponsePermanentRedirect | HttpResponseRedirect:
    token = Token.objects.get(user=user)
    data = {
        "pk": user.pk,
        "email": user.email,
        "nickname": user.nickname,
        "picture": user.picture.url,
        "token": token.key,
    }
    return redirect_with_params("https://localhost/login/?", params=data, permanent=True)


def login(email: str) -> HttpResponse:
    user = CustomUser.objects.get(email=email)
    # return redirect_to_start(user)
    token = Token.objects.get(user=user)
    data = {
        "pk": user.pk,
        "email": user.email,
        "nickname": user.nickname,
        "picture": user.picture.url,
        "token": token.key,
    }
    return Response(data, status.HTTP_200_OK)


def register(email: str, nickname: str, image: str) -> HttpResponse:
    try:
        CustomUser.objects.get(nickname=nickname)
        nickname = secrets.token_hex(6)
    except ObjectDoesNotExist:
        pass
    user = CustomUser.objects.create_user(email=email, password=None, nickname=nickname)
    image_name = urlparse(url=image).path.split("/")[-1]
    response = requests.get(image)
    if response.status_code == status.HTTP_200_OK:
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
    return Response(data, status.HTTP_201_CREATED)
    # return redirect_to_start(user)


@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def authenticate(request):
    code = request.GET.get("code")
    if not code:
        return Response(data={"error": "code is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        # return redirect_failure()

    access_token = get_access_token(code)
    user_data = get_user_data(access_token)

    email = user_data.get("email")
    nickname = user_data.get("login")
    image = user_data.get("image")

    print(user_data)
    for (key, value) in request.META.items():
        print(f"{key}: {value}")
    try:
        return login(email)
    except ObjectDoesNotExist:
        return register(email, nickname, image)


@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def redirect_to_oauth(request):
    referer = request.GET.get("referer")
    if referer:
        request.session["referer"] = referer
        referer = quote(referer)
    params = {
        "client_id": settings.API_UID,
        "redirect_uri": settings.API_REDIRECT,
        "response_type": "code",
    }
    return redirect_with_params("https://api.intra.42.fr/oauth/authorize?", params)
