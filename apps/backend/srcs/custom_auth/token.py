from knox.auth import TokenAuthentication
from knox.models import get_token_model
from knox.settings import CONSTANTS
from knox.views import LoginView


def create_token(user):
    token_prefix = LoginView.get_token_prefix()
    token = get_token_model().objects.create(user=user, expiry=LoginView.get_token_ttl(), prefix=token_prefix)
    return token


def logout_all(user):
    user.auth_token_set.all().delete()


def authenticate(token: str):
    authenticator = TokenAuthentication()
    (user, auth_token) = authenticator.authenticate_credentials(token)
    return user
