import json
import logging
import uuid

import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger("django")

class mainConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "main"
        self.redis = redis.from_url("redis://redis")

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        self.user = self.scope["user"]
        if self.user.is_authenticated:
            await self.save_user_info(True)
        else:   
            self.close()
        await self._send()
        
    async def save_user_info(self, status):
        user_info = {
            "nick" : self.user.nickname,
            "img" : self.user.picture.url,
            "id" : self.user.id,
            "isLoggedin" : status,
        }
        await self.redis.hset("main", self.user.id, json.dumps(user_info))

    async def disconnect(self, close_code):
        if self.user and self.user.id:
            await self.redis.hdel("main", self.user.id)
            await self.save_user_info(False)
            await self._send()
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f"[main] 사용자 연결 해제됨: {self.channel_name}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        if (data.get("type") == 'updateMine'):
            user_info_dict = await self.redis.hgetall("main")
            user_info_list = [
                json.loads(user_info_dict[channel_name])
                for channel_name in user_info_dict
            ]
            await self.channel_layer.send(self.channel_name, {"type": "update", "users": user_info_list})
    
    async def _send(self):
        user_info_dict = await self.redis.hgetall("main")
        user_info_list = [
            json.loads(user_info_dict[channel_name])
            for channel_name in user_info_dict
        ]
        await self.channel_layer.group_send(self.room_group_name, {"type": "update", "users": user_info_list})

    async def update(self, event):
        await self.send(text_data=json.dumps(event))

    async def disconnected(self, event):
        await self.send(text_data=json.dumps(event))
