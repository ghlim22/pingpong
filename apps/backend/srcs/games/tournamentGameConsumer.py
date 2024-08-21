import json
import logging
import uuid

import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger("django")

class tournamentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_group_name = "tournament"
        self.redis = redis.from_url("redis://redis")
        self.game_id = str(uuid.uuid4())  # 고유한 game_id 생성

        # 방 그룹에 추가
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        user = self.scope["user"]
        if user.is_authenticated:
            await self.save_user_info(user)

        await self.increment_and_check_group_size(self.room_group_name)

        await self._send()

    async def _send(self):
        user_info_dict = await self.redis.hgetall("tournament")
        user_info_list = [
            json.loads(user_info_dict[channel_name])
            for channel_name in user_info_dict
        ]
        await self.channel_layer.group_send(self.room_group_name, {"type": "update", "users": user_info_list})

    async def save_user_info(self, user):
        user_info = {
            "nickname": user.nickname,
            "picture": user.picture.url
        }
        await self.redis.hset("tournament", self.channel_name, json.dumps(user_info))

    async def disconnect(self, close_code):
        await self.decrement_group_size(self.room_group_name)

        # Remove user info from Redis
        await self.redis.hdel("tournament", self.channel_name)

        # 방 그룹에서 제거
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        logger.info(f"[RANK] 사용자 연결 해제됨: {self.channel_name}")


    async def increment_and_check_group_size(self, group_name):
        lua_script = """
        local size = redis.call('INCR', KEYS[1])
        return size
        """
        group_size = await self.redis.eval(lua_script, 1, group_name)
        logger.info(f"[RANK] 사용자 연결됨: {group_size}")

        if self.game_type == "2P":
            num = 2
        elif self.game_type == "4P":
            num = 4

        if group_size == num:
            try:
                await self.create_game()
            except Exception as e:
                logger.error(f"게임 생성 오류: {e}")

    async def decrement_group_size(self, group_name):
        await self.redis.decr(group_name)

    async def create_game(self):
        # Get all user info from Redis
        user_info_dict = await self.redis.hgetall("game_users")
        user_info_list = [
            json.loads(user_info_dict[channel_name])
            for channel_name in user_info_dict
        ]

        data = {
                    "game_id": self.game_id,
                    "user_info": user_info_list,
                }
        # Send user info to all clients
        await self.channel_layer.group_send(self.room_group_name, {"type": "create", "data": data})

    async def create(self, event):
        # Send the data to WebSocket
        await self.send(text_data=json.dumps(event))
