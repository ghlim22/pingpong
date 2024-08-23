from urllib.parse import quote, urlencode

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse
from django.shortcuts import redirect
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from . import oauth

# Create your views here.


@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def authenticate(request):
    code = request.GET.get("code")
    if not code:
        return Response(data={"error": "code is missing."}, status=status.HTTP_401_UNAUTHORIZED)
        # return redirect_failure()

    access_token = oauth.request_token()
    user = oauth.request_user(access_token)

    email = user.get("email")
    nickname = user.get("login")
    image = user.get("image")

    try:
        return oauth.login(email)
    except ObjectDoesNotExist:
        return oauth.register(email, nickname, image)


@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def redirect_to_oauth(request: Request) -> HttpResponse:
    referer = request.GET.get("referer")
    if referer:
        request.session["referer"] = referer
        referer = quote(referer)
    params: dict = {
        "client_id": settings.API_UID,
        "redirect_uri": settings.API_REDIRECT,
        "response_type": "code",
    }
    url = "https://api.intra.42.fr/oauth/authorize?" + urlencode(params)
    return redirect(to=url)
