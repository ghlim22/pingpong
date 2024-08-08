from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response

from .models import CustomUser
from .serializers import UserSignInSerializer, UserSignUpSerializer

# Create your views here.


class UserSignUpAPIView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSignUpSerializer


class UserSignInAPIView(generics.GenericAPIView):
    serializer_class = UserSignInSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data  # Return value of serializer.validate()
        return Response(data, status=status.HTTP_200_OK)
