from knox.auth import TokenAuthentication
from knox.models import get_token_model
from knox.settings import knox_settings


def create_token(user):
    token = get_token_model().objects.create(
        user=user, expiry=knox_settings.TOKEN_TTL, prefix=knox_settings.TOKEN_PREFIX
    )
    return token


def logout_all(user):
    user.auth_token_set.all().delete()


def authenticate(token: str):
    authenticator = TokenAuthentication()
    (user, auth_token) = authenticator.authenticate_credentials(token)
    return user
