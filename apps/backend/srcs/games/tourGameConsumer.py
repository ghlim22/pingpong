from channels.generic.websocket import AsyncWebsocketConsumer
import json
import redis.asyncio as redis
import logging


logger = logging.getLogger("django")

class TourConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # URL에서 room_name 추출
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'
        self.redis = redis.from_url("redis://redis")
        self.user = self.scope["user"]

        await self._increment_and_get_group_size(self.room_group_name)

        # 그룹에 추가
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # 그룹에서 제거
        if self.user and self.user.id:
            await self.decrement_group_size(self.room_group_name)
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def decrement_group_size(self, group_name):
        await self.redis.decr(group_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'get_client_count':
            # 클라이언트 수 응답
            await self.send(text_data=json.dumps({
                'type': 'client_count',
                'count': await self._get_group_size(self.room_group_name)
            }))

    async def _increment_and_get_group_size(self, group_name):
        lua_script = """
        local size = redis.call('INCR', KEYS[1])
        return size
        """
        group_size = await self.redis.eval(lua_script, 1, group_name)
        logger.info(f"queue group 사용자 연결됨: {group_size}")

    async def _get_group_size(self, group_name):
        group_size = await self.redis.get(group_name)
        
        if group_size is None:
            return 0
        return int(group_size)