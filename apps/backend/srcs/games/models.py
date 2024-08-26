from django.db import models
from users.models import CustomUser


class GameLog(models.Model):
    winners = models.ManyToManyField(CustomUser, related_name="won_games", blank=True)
    losers = models.ManyToManyField(CustomUser, related_name="lost_games", blank=True)
    game_type = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        winner_names = ', '.join([winner.nickname for winner in self.winners.all()])
        loser_names = ', '.join([loser.nickname for loser in self.losers.all()])
        return (f"GameLog (ID: {self.id}, Game Type: {self.game_type}, Timestamp: {self.timestamp}, "
                f"Winners: [{winner_names}], Losers: [{loser_names}])")
