from django.db import models
from users.models import CustomUser

class GameLog(models.Model):
    winners = models.ManyToManyField(CustomUser, related_name='won_games', blank=True)
    losers = models.ManyToManyField(CustomUser, related_name='lost_games', blank=True)
    game_type = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
