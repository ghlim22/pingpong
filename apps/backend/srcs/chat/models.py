from django.db import models
from users.models import CustomUser

class Message(models.Model):
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()  # 메시지 내용 필드 이름이 'content'일 수 있음
    timestamp = models.DateTimeField(auto_now_add=True)
