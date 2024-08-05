from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext as _

from .managers import CustomUserManager

# Create your models here.


class CustomUser(AbstractUser):
    """
    Email and password are required. Other fields are optional.
    """

    username = None
    email = models.EmailField(_("Email Address"), unique=True, help_text=_("Required."))
    first_name = None
    last_name = None

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email
