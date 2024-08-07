from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext as _

from .managers import CustomUserManager

# Create your models here.


class CustomUser(AbstractUser):
    """
    Email, password, and nickname are required. Other fields are optional.
    """

    username = None
    email = models.EmailField(_("Email Address"), unique=True, help_text=_("Required."))
    first_name = None
    last_name = None
    nickname = models.CharField(_("Nickname"), unique=True, max_length=8, help_text=_("Required."))
    picture = models.ImageField(
        _("Picture"), default="users/profile-default.png", upload_to="users/", help_text=_("Optional.")
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = [
        "nickname",
    ]

    objects = CustomUserManager()

    def __str__(self):
        return self.email
