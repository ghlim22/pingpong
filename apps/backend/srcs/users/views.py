from drf_spectacular.utils import (
    OpenApiExample,
    extend_schema,
    inline_serializer,
)
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response

from .models import CustomUser
from .serializers import UserSignInSerializer, UserSignUpSerializer

# Create your views here.


class UserSignUpAPIView(generics.CreateAPIView):
    """
    Create a new user
    """

    permission_classes = [
        permissions.AllowAny,
    ]
    queryset = CustomUser.objects.all()
    serializer_class = UserSignUpSerializer


class UserSignInAPIView(generics.GenericAPIView):
    """
    Login a user
    """

    permission_classes = [
        permissions.AllowAny,
    ]
    serializer_class = UserSignInSerializer

    @extend_schema(
        responses=inline_serializer(
            name="UserSignInResponseSerializer",
            fields={
                "email": serializers.EmailField(),
                "nickname": serializers.CharField(),
                "picture": serializers.CharField(),
                "token": serializers.CharField(),
            },
        ),
    )
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data  # Return value of serializer.validate()
        return Response(data, status=status.HTTP_200_OK)
