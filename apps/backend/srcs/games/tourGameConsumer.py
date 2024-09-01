import json
import logging

import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger("django")


class TourConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # URL에서 room_name 추출
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"tourc_{self.room_name}"
        self.redis = redis.from_url("redis://redis")
        self.user = self.scope["user"]

        await self._increment_group_size(self.room_group_name)

        # 그룹에 추가
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        if self.user and self.user.id:
            await self.decrement_group_size(self.room_group_name)
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def decrement_group_size(self, group_name):
        await self.redis.decr(group_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get("type") == "get_client_count":
            size = await self._get_group_size(self.room_group_name)
            await self.channel_layer.send(self.channel_name, {"type": "client_count", "count": size})

    async def _increment_group_size(self, group_name):
        lua_script = """
        local size = redis.call('INCR', KEYS[1])
        return size
        """
        await self.redis.eval(lua_script, 1, group_name)

    async def _get_group_size(self, group_name):
        group_size = await self.redis.get(group_name)

        if group_size is None:
            return 0
        return int(group_size)

    async def client_count(self, event):
        await self.send(text_data=json.dumps(event))