from urllib.parse import quote, urlencode

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import redirect
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
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

    access_token = oauth.get_token(code)
    user_data = oauth.get_user_data(access_token)

    email = user_data.get("email")
    nickname = user_data.get("login")
    image = user_data.get("image")

    print(user_data)
    for (key, value) in request.META.items():
        print(f"{key}: {value}")
    try:
        return oauth.login(email)
    except ObjectDoesNotExist:
        return oauth.register(email, nickname, image)


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
    url = "https://api.intra.42.fr/oauth/authorize?" + urlencode(params)
    return redirect(to=url)
