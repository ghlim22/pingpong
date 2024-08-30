from urllib.parse import quote, urlencode

from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse, HttpResponseRedirect
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request

from . import oauth

# Create your views here.


@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def authenticate(request):
    code = request.GET.get("code")
    if not code:
        return oauth.redirect_failure()

    access_token = oauth.request_token(code)
    user_credentials = oauth.request_user(access_token)

    email = user_credentials.get("email")
    nickname = user_credentials.get("login")
    image = user_credentials.get("image")

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
    callback_url = "https://" + settings.SERVER_ADDR + "/api/auth/redirect"
    params: dict = {
        "client_id": settings.API_UID,
        "redirect_uri": callback_url,
        "response_type": "code",
    }
    url = "https://api.intra.42.fr/oauth/authorize?" + urlencode(params)
    return HttpResponseRedirect(url)
