from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.response import Response

from .models import CustomUser
from .serializers import SignInSerializer, SignUpSerializer

# Create your views here.


class SignUpView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = SignUpSerializer


class SignInView(generics.GenericAPIView):
    serializer_class = SignInSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data  # Return value of serializer.validate()
        return Response(data, status=status.HTTP_200_OK)
