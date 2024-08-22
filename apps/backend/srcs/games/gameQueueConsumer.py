import json
import logging
import uuid

import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger("django")

class GameQueueConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_type = self.scope["url_route"]["kwargs"]["type"]
        self.room_group_name = self.game_type
        self.redis = redis.from_url("redis://redis")
        self.game_id = str(uuid.uuid4())  # 고유한 game_id 생성

        # 방 그룹에 추가
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()

        # Save user information in Redis
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            await self.save_user_info(self.user)
        else:
            self.close()

        await self.increment_and_check_group_size(self.room_group_name)

        logger.info(f"[RANK] 사용자 연결됨: {self.channel_name}, Game ID: {self.game_id}")

    async def save_user_info(self, user):
        user_info = {
            "nickname": user.nickname,
            "picture": user.picture.url
        }
        await self.redis.hset("game_users", self.channel_name, json.dumps(user_info))

    async def disconnect(self, close_code):
        if self.user and self.user.id:
            await self.decrement_group_size(self.room_group_name)
            await self.redis.hdel("game_users", self.channel_name)
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
        else:
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
