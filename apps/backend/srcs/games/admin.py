from django.contrib import admin

from .models import GameLog

# Register your models here.


class GameLogAdmin(admin.ModelAdmin):
    filter_horizontal = [
        "players",
        "winners",
        "losers",
    ]


admin.site.register(GameLog, GameLogAdmin)
