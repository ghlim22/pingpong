from django.urls import re_path

from . import gameConsumer, gameQueueConsumer, mainConsumer, tourGameConsumer

websocket_urlpatterns = [
    re_path(r"^wss/games/queue/(?P<type>[\w-]+)/$", gameQueueConsumer.GameQueueConsumer.as_asgi()),
    re_path(r"^wss/games/start/(?P<game_id>[a-fA-F0-9\-]{36})/(?P<type>[\w-]+)/$", gameConsumer.GameConsumer.as_asgi()),
    re_path(r"^wss/games/main/$", mainConsumer.mainConsumer.as_asgi()),
    re_path(r"^wss/games/tour/(?P<room_name>[a-fA-F0-9\-]{36})/$", tourGameConsumer.TourConsumer.as_asgi()),
]
