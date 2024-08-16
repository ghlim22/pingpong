from django.utils.translation import gettext as _
from rest_framework import serializers


class NicknameValidator:
    code = "invalid"

    def __init__(self, code=None):
        if code is None:
            self.code = code

    def __call__(self, value):
        if not isinstance(value, str):
            detail = _("Nickname must be a string")
            raise serializers.ValidationError(detail, code=self.code)
        if len(value) < 2:
            detail = _("Nickname must be at least 2 characters")
            raise serializers.ValidationError(detail, code=self.code)
        if len(value) > 8:
            detail = _("Nickname must be at most 8 characters")
            raise serializers.ValidationError(detail, code=self.code)
        if not value.isalnum():
            detail = _("Nickname must contain only alphanumeric characters")
            raise serializers.ValidationError(detail, code=self.code)
