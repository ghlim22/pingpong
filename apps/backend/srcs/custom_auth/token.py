import binascii
from hmac import compare_digest

from django.utils.translation import gettext_lazy as _
from knox.auth import TokenAuthentication
from knox.crypto import hash_token
from knox.models import get_token_model
from knox.settings import CONSTANTS, knox_settings
from rest_framework import exceptions


class CustomTokenAuthentication(TokenAuthentication):
    def authenticate_credentials(self, token):
        """
        Due to the random nature of hashing a value, this must inspect
        each auth_token individually to find the correct one.

        Tokens that have expired will be deleted and skipped
        """
        msg = _("Invalid token.")
        for auth_token in get_token_model().objects.filter(token_key=token[: CONSTANTS.TOKEN_KEY_LENGTH]):
            if self._cleanup_token(auth_token):
                continue

            try:
                digest = hash_token(token)
            except (TypeError, binascii.Error):
                raise exceptions.AuthenticationFailed(msg)
            if compare_digest(digest, auth_token.digest):
                if knox_settings.AUTO_REFRESH and auth_token.expiry:
                    self.renew_token(auth_token)
                return self.validate_user(auth_token)
        raise exceptions.AuthenticationFailed(msg)


def create_token(user):
    instance, token = get_token_model().objects.create(
        user=user, expiry=knox_settings.TOKEN_TTL, prefix=knox_settings.TOKEN_PREFIX
    )
    return token


def logout_all(user):
    user.auth_token_set.all().delete()


def authenticate(token: str):
    authenticator = CustomTokenAuthentication()
    (user, auth_token) = authenticator.authenticate_credentials(token)
    return user
