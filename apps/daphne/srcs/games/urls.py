from django.urls import path, re_path

from . import gameConsumer, gameQueueConsumer, views

app_name = "games"

urlpatterns = [
    re_path(r"^rankgames/(?P<type>[\w-]+)/$", gameQueueConsumer.RankGameRoomConsumer.as_asgi()),
    re_path(r"^start/(?P<game_id>[a-fA-F0-9\-]{36})/(?P<type>[\w-]+)/$", gameConsumer.GameConsumer.as_asgi()),
]
