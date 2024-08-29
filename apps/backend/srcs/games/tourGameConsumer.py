from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TourConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # URL에서 room_name 추출
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        # 그룹에 추가
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # 그룹에서 제거
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'get_client_count':
            # 클라이언트 수 응답
            await self.send(text_data=json.dumps({
                'type': 'client_count',
                'count': len(await self.get_group_clients(self.room_group_name))
            }))

    async def get_group_clients(self, group_name):
        # 현재 그룹의 클라이언트 수를 반환하는 함수
        channel_layer = self.channel_layer
        group = await channel_layer.group_get(group_name)
        return [member for member in group]
