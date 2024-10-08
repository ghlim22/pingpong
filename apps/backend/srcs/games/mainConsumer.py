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
            await self.close()
        await self._send()

    async def save_user_info(self, status):
        user_info = {
            "nick": self.user.nickname,
            "img": self.user.picture.url,
            "id": self.user.id,
            "channel_name": self.channel_name,  # 유저 ID와 채널 매핑 저장
            "isLoggedin": status,
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
        if data.get("type") == "updateMine":
            user_info_dict = await self.redis.hgetall("main")
            user_info_list = [json.loads(user_info_dict[channel_name]) for channel_name in user_info_dict]
            await self.channel_layer.send( self.channel_name, {"type": "update", "users": user_info_list, "my_id": self.user.id} )
        elif data.get("type") == "invite":
            await self.invite_user(data)
        elif data.get("type") == "update_user_info":
            field = data.get("field")
            new_value = data.get("value")
            if field and new_value:
                await self.update_user_info(field, new_value)
                await self._send()

    async def update_user_info(self, field, new_value):
        # Redis에서 현재 사용자 정보 가져오기
        user_info = await self.redis.hget("main", self.user.id)
        user_info = json.loads(user_info)
        # 필드 업데이트
        if field == "nick":
            user_info["nick"] = new_value
        elif field == "img":
            user_info["img"] = new_value
        # 업데이트된 정보를 Redis에 저장
        await self.redis.hset("main", self.user.id, json.dumps(user_info))
        logger.info(f"User {self.user.id} updated {field} to {new_value}")

    async def invite_user(self, data):
        target_user_id = data.get("target_user_id")

        target_user_info = await self.redis.hget("main", target_user_id)
        if target_user_info:
            target_user_info = json.loads(target_user_info)
            target_channel_name = target_user_info["channel_name"]

            await self.channel_layer.send(
                target_channel_name,
                {
                    "type": "game_invitation",
                    "nick": self.user.nickname,
                    "img": self.user.picture.url,
                },
            )

    async def _send(self):
        user_info_dict = await self.redis.hgetall("main")
        user_info_list = [json.loads(user_info_dict[channel_name]) for channel_name in user_info_dict]
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "update", "users": user_info_list, "my_id": self.user.id}
        )

    async def update(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_invitation(self, event):
        # 게임 초대 메시지 전송
        await self.send(text_data=json.dumps(event))

    async def disconnected(self, event):
        await self.send(text_data=json.dumps(event))
