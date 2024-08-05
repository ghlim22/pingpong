from django.shortcuts import render
from rest_framework import generics

from apps.backend.srcs.users.models import CustomUser
from apps.backend.srcs.users.serializers import SignUpSerializer

# Create your views here.


class SignUpView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = SignUpSerializer
