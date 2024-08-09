from django.shortcuts import render
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import CustomUser
from .serializers import UserSignInSerializer, UserSignUpSerializer

# Create your views here.


@swagger_auto_schema()
class UserSignUpAPIView(generics.CreateAPIView):
    permission_classes = [
        permissions.AllowAny,
    ]
    queryset = CustomUser.objects.all()
    serializer_class = UserSignUpSerializer


@swagger_auto_schema(
    # method="POST",
    operation_id="sign up",
    operation_description="user sign up operation",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            "email": openapi.Schema(type=openapi.TYPE_STRING, description="Email", min_length=3),
            "password": openapi.Schema(type=openapi.TYPE_STRING, description="Password", min_length=8),
            "confirm_password": openapi.Schema(type=openapi.TYPE_STRING, description="Password", min_length=8),
            "nickname": openapi.Schema(type=openapi.TYPE_STRING, description="Nickname", min_length=2, max_length=8),
            "picture": openapi.Schema(
                type=openapi.TYPE_FILE, description="Picture", required=["False"], default="users/profile-default.png"
            ),
        },
    ),
    tags=["User"],
    responses={
        201: openapi.Response(
            description="201 CREATED",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    "email": openapi.Schema(type=openapi.TYPE_STRING, description="Email"),
                    "nickname": openapi.Schema(type=openapi.TYPE_STRING, description="Nickname"),
                    # "token": openapi.Schema(type=openapi.TYPE_STRING, description="Token"),
                    # "picture": openapi.Schema(type=openapi.TYPE_STRING, description="Picture URL"),
                    # 'access_token': openapi.Schema(type=openapi.TYPE_STRING, description="Access Token"),
                    # 'refresh_token': openapi.Schema(type=openapi.TYPE_STRING, description="Refresh Token"),
                },
            ),
        )
    },
)
class UserSignInAPIView(generics.GenericAPIView):
    permission_classes = [
        permissions.AllowAny,
    ]
    serializer_class = UserSignInSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data  # Return value of serializer.validate()
        return Response(data, status=status.HTTP_200_OK)
