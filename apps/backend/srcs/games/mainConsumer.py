import json
import logging
import uuid

import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger("django")

class mainConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "main"

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        user = self.scope["user"]
        if user.is_authenticated:
            self.disconnect()

        self.data = {
            "nick" : user.nickname,
            "img" : user.picture,
            "id" : user.id,
        }
        
        await self.channel_layer.group_send(self.room_group_name, {"type": "connected", "data": self.data})

    async def disconnect_message(self, close_code):
        await self.channel_layer.group_send(self.room_group_name, {"type": "disconnected", "data": self.data})

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        logger.info(f"[RANK] 사용자 연결 해제됨: {self.channel_name}")

    async def modify_message(self):
        # Send user info to all clients
        await self.channel_layer.group_send(self.room_group_name, {"type": "modify", "data": self.data})

    async def connected(self, event):
        await self.send(text_data=json.dumps(event))

    async def disconnected(self, event):
        await self.send(text_data=json.dumps(event))

    async def modify(self, event):
        await self.send(text_data=json.dumps(event))
