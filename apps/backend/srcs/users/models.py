from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.translation import gettext as _
from rest_framework.authtoken.models import Token

from .managers import CustomUserManager

# Create your models here.


class CustomUser(AbstractUser):
    """
    User model with email as identifier.
    Email, password, and nickname are required. Other fields are optional.
    """

    username = None
    first_name = None
    last_name = None
    email = models.EmailField(_("Email Address"), unique=True, help_text=_("Required."))
    nickname = models.CharField(_("Nickname"), unique=True, max_length=8, help_text=_("Required."))
    picture = models.ImageField(
        _("Picture"), upload_to="users/profile/", default="users/profile-default.png", help_text=_("Required.")
    )
    followings = models.ManyToManyField(to="self", related_name="followers", blank=True, symmetrical=False)
    blocks = models.ManyToManyField(to="self", related_name="blocked", blank=True, symmetrical=False)

    # 2FA Fields
    # otp_auth_url = models.CharField(_("OTP Auth URL"), max_length=255, blank=True, default="", help_text=_("Optional."))
    # otp_base_32 = models.CharField(_("OTP Base 32"), max_length=255, blank=True, default="", help_text=_("Optional."))
    # otp_qrcode = models.ImageField(
    #     _("OTP QR Code"), upload_to="users/otp/", blank=True, null=True, help_text=_("Optional.")
    # )
    # otp_login = models.CharField(_("OTP Login"), max_length=255, blank=True, default="", help_text=_("Optional."))
    # otp_login_used = models.CharField(
    #     _("OTP Login Used"), max_length=255, blank=True, default="", help_text=_("Optional.")
    # )
    # otp_created_at = models.DateTimeField(_("OTP Created At"), blank=True, null=True, help_text=_("Optional."))

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = [
        "nickname",
    ]

    objects = CustomUserManager()

    def __str__(self):
        return self.email

    # @staticmethod
    # @receiver(post_save, sender=settings.AUTH_USER_MODEL)
    # def create_default_auth_token(sender, instance=None, created=False, **kwargs):
    #     """
    #     Generate a default authentication token for each newly created user.
    #     """
    #     if created:
    #         Token.objects.create(user=instance)
