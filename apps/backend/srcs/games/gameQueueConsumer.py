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
        self.token = self.scope['query_string'].decode('utf-8').split('=')[1]
        self.redis = redis.from_url("redis://redis")
        self.game_id = str(uuid.uuid4())  # 고유한 game_id 생성
        if self.game_type == 'tournament':
            self.game_id2 = str(uuid.uuid4())
            self.game_id3 = str(uuid.uuid4())  # 고유한 game_id 생성
        else:
            self.game_id2 = "false"
            self.game_id3 = "false"

        await self.accept()
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )

        # Save user information in Redis
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            await self.save_user_info(self.user)
        else:
            self.close()

        if self.game_type == 'tournament':
            await self._send()
        await self.increment_and_check_group_size(self.room_group_name)


    async def save_user_info(self, user):
        user_info = {
            "nickname": user.nickname,
            "picture": user.picture.url
        }
        await self.redis.hset(f"{self.game_type}_game", self.channel_name, json.dumps(user_info))

    async def disconnect(self, close_code):
        if self.user and self.user.id:
            await self.decrement_group_size(self.room_group_name)
            await self.redis.hdel(f"{self.game_type}_game", self.channel_name)
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        if self.game_type == 'tournament':
            await self._send()


    async def receive(self, text_data):
            data = json.loads(text_data)
            type = data.get("type")
            if type == "disconnect":
                await self.channel_layer.group_send(
                    self.game_group,
                    {
                        'type': 'disconnect_all'
                    }
                )


    async def increment_and_check_group_size(self, group_name):
        lua_script = """
        local size = redis.call('INCR', KEYS[1])
        return size
        """
        group_size = await self.redis.eval(lua_script, 1, group_name)
        num = 2
        if self.game_type == 'tournament' or self.game_type == '4P':
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
        user_info_dict = await self.redis.hgetall(f"{self.game_type}_game")
        user_info_list = [
            json.loads(user_info_dict[channel_name])
            for channel_name in user_info_dict
        ]
        data = {
                    "game_id": self.game_id,
                    "game_id2" : self.game_id2,
                    "game_id3" : self.game_id3,
                    "user_info": user_info_list,
                }
        await self.channel_layer.group_send(self.room_group_name, {"type": "create", "data": data})

    async def create(self, event):
        # Send the data to WebSocket
        await self.send(text_data=json.dumps(event))

    async def _send(self):
        user_info_dict = await self.redis.hgetall(f"{self.game_type}_game")
        user_info_list = [
            json.loads(user_info_dict[channel_name])
            for channel_name in user_info_dict
        ]
        await self.channel_layer.group_send(self.room_group_name, {"type": "update", "users": user_info_list})

    async def update(self, event):
        # Send the data to WebSocket
        await self.send(text_data=json.dumps(event))

    async def disconnect_all(self, event):
        await self.send(text_data=json.dumps(event))