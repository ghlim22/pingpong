import django
django.setup()
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.db import models
from channels.db import database_sync_to_async
from .models import Message
from users.models import CustomUser


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.other_user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.other_user = await self.get_user(self.other_user_id)
        self.room_name = f"chat_{min(self.user.id, self.other_user.id)}_{max(self.user.id, self.other_user.id)}"

        await self.channel_layer.group_add(self.room_name, self.channel_name)
        await self.accept()

        # 기존 메시지 전송
        await self._send(self.other_user_id)

    async def _send(self, user_id):
        me = await self.get_user(self.user.id)
        other_user = await self.get_user(user_id)
        messages_text = await self.get_messages(me, other_user)

        # 채팅 그룹에 메시지 전송
        await self.channel_layer.send(self.channel_name, {"type": "update", 'messages_text': messages_text})

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_content = text_data_json["message"]

        # 비동기적으로 메시지 저장
        await self.save_message(self.user.id, self.other_user_id, message_content)

        # 메시지 그룹에 전송
        await self.channel_layer.group_send(
            self.room_name, {"type": "chat_message", "message": message_content, "user_name": self.user.nickname}
        )

    async def update(self, event):
        await self.send(text_data=json.dumps(event))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def get_user(self, user_id):
        return CustomUser.objects.get(id=user_id)

    @database_sync_to_async
    def get_messages(self, me, other_user):
        return ("\n".join([f"{msg.sender.nickname}: {msg.content}" for msg in Message.objects.filter(
            (models.Q(sender=me) & models.Q(receiver=other_user)) |
            (models.Q(sender=other_user) & models.Q(receiver=me))
        ).order_by('timestamp')]))

    @database_sync_to_async
    def save_message(self, sender_id, receiver_id, content):
        sender = CustomUser.objects.get(id=sender_id)
        receiver = CustomUser.objects.get(id=receiver_id)
        return Message.objects.create(sender=sender, receiver=receiver, content=content)
