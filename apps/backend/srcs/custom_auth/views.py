from urllib.parse import quote, urlencode, urlparse

import requests
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.core.files.base import ContentFile
from django.shortcuts import redirect
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from users.models import CustomUser

# Create your views here.


def get_access_token(code: str) -> str:
    url = "https://api.intra.42.fr/oauth/token"
    params = {
        "grant_type": "authorization_code",
        "client_id": settings.API_UID,
        "client_secret": settings.API_SECRET,
        "code": code,
        "redirect_uri": settings.API_REDIRECT,
    }
    response = requests.post(url=url, data=params)
    if response.status_code != 200:
        # return redirect(to="https://localhost")
        return Response(data=response.json(), status=response.status_code)
    access_token = response.json().get("access_token")
    return access_token


def get_user_data(access_token: str) -> dict:
    url = "https://api.intra.42.fr/v2/me"
    headers = {
        "Authorization": f"Bearer {access_token}",
    }
    response = requests.get(url=url, headers=headers)
    if response.status_code != 200:
        # return redirect(to="https://localhost")
        return Response(data=response.json(), status=response.status_code)
    data = {
        "email": response.json().get("email"),
        "login": response.json().get("login"),
        "image": response.json().get("image").get("link"),
    }
    print(data)
    return data


@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def authenticate(request):
    code = request.GET.get("code")
    if not code:
        return Response(data={"error": "code is missing."}, status=status.HTTP_400_BAD_REQUEST)
    access_token = get_access_token(code)
    user_data = get_user_data(access_token)
    print(user_data)
    try:
        user = CustomUser.objects.get(email=user_data.get("email"))
        token = Token.objects.get(user=user)
        data = {
            "pk": user.pk,
            "email": user.email,
            "nickname": user.nickname,
            "picture": user.picture.url,
            "token": token.key,
        }
        return Response(data=data, status=status.HTTP_200_OK)
    except ObjectDoesNotExist:
        email = user_data.get("email")
        data = {
            "nickname": user_data.get("login"),
        }
        user = CustomUser.objects.create_user(email=email, password=None, **data)
        image_url = user_data.get("image")
        image_name = urlparse(image_url).path.split("/")[-1]
        response = requests.get(image_url)
        if response.status_code == status.HTTP_200_OK:
            user.picture.save(image_name, ContentFile(response.content))
        user.save()

    return Response(status=status.HTTP_200_OK)


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
    url = "https://api.intra.42.fr/oauth/authorize?"
    url += urlencode(params)
    print(url)
    return redirect(to=url)
