from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext as _

from .managers import CustomUserManager

# Create your models here.


class CustomUser(AbstractUser):
    """
    User model with email as identifier.
    Email, password, and nickname are required. Other fields are optional.
    """

    # Unused fields
    username = None
    first_name = None
    last_name = None

    # Profile
    email = models.EmailField(_("Email Address"), unique=True, help_text=_("Required."))
    nickname = models.CharField(_("Nickname"), unique=True, max_length=8, help_text=_("Required."))
    picture = models.ImageField(
        _("Picture"), upload_to="users/profile/", default="users/profile-default.png", help_text=_("Required.")
    )

    # Relationships
    followings = models.ManyToManyField(to="self", related_name="followers", blank=True, symmetrical=False)
    blocks = models.ManyToManyField(to="self", related_name="blocked", blank=True, symmetrical=False)

    # Game
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = [
        "nickname",
    ]

    objects = CustomUserManager()

    def __str__(self):
        return self.email
