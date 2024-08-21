from urllib.parse import quote

import requests
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import redirect
from django.utils.http import urlencode
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import generics, permissions, serializers, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request
from rest_framework.response import Response

from .models import CustomUser
from .serializers import (
    UserBlockSerializer,
    UserFollowSerializer,
    UserSerializer,
    UserSignInSerializer,
    UserSimpleSerializer,
)

# Create your views here.


class UserCreateAPIView(generics.CreateAPIView):
    """
    Create a new user
    """

    permission_classes = [
        permissions.AllowAny,
    ]
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


class UserAPIViewSet(viewsets.ModelViewSet):
    """
    create(), retrieve(), list(), update(), partial_update(), delete().
    """

    permission_classes = [
        permissions.AllowAny,
    ]
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


@extend_schema(responses=UserSimpleSerializer)
@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def get_active_user_list(request):
    queryset = CustomUser.objects.all().filter(status__gte=1)
    serializer = UserSimpleSerializer(queryset, many=True)
    return Response(data=serializer.data, status=status.HTTP_200_OK)


class UserCurrentAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    Performs an action for requesting user himself.
    Possible actions: Retrieve(GET), Update(PUT), Partial Update(PATCH), and Delete(DELETE).
    """

    permission_classes = [
        permissions.IsAuthenticated,
    ]
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = request.user
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = request.user
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data

        for (key, value) in validated_data.items():
            if not hasattr(instance, key):
                raise serializers.ValidationError({key: "User does not have this field."})
            # Check if the new value is different from the existing value except password.
            if getattr(instance, key) == value:
                raise serializers.ValidationError({key: "The new value must be different from the existing value."})

        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = request.user
        self.perform_delete(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema(responses=UserFollowSerializer)
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def getFollowList(request: Request) -> Response:
    """
    Return requesting user's following and followers' list.
    """
    serializer = UserFollowSerializer(instance=request.user)
    return Response(data=serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def follow(request, pk):
    """
    Follow or unfollow a user with given pk.
    """
    instance = request.user
    obj = get_object_or_404(queryset=CustomUser.objects.all(), pk=pk)
    if instance.pk == obj.pk:
        return Response(data={"error": "You cannot make this request of yourself."}, status=status.HTTP_400_BAD_REQUEST)
    if obj in instance.followings.all():
        instance.followings.remove(obj)
    else:
        instance.followings.add(obj)
    return Response(status=status.HTTP_200_OK)


@extend_schema(responses=UserBlockSerializer)
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_block_list(request):
    """
    Return request user's block and blocked list.
    """
    serializer = UserBlockSerializer(instance=request.user)
    return Response(data=serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def block(request, pk):
    """
    Block or unblock a user with given pk.
    """
    instance = request.user
    obj = get_object_or_404(queryset=CustomUser.objects.all(), pk=pk)
    if instance.pk == obj.pk:
        return Response(data={"error": "You cannot make this request of yourself."}, status=status.HTTP_400_BAD_REQUEST)
    if obj in instance.blocks.all():
        instance.blocks.remove(obj)
    else:
        instance.blocks.add(obj)
    return Response(status=status.HTTP_200_OK)


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
                "pk": serializers.IntegerField(),
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


@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def signin_remote(request):
    referral_url = request.GET.get("referral_url")
    if referral_url:
        request.session["referral_url"] = referral_url
        referral_url = quote(referral_url)
    params = {
        "client_id": "u-s4t2ud-b89b6b91d03e4c4ba5eb82d9171a46da61dcfde5635fbebec0afa55cd6fba2cb",
        "redirect_uri": "http://localhost:8000/api/users/signin/remote/callback",
        "response_type": "code",
    }
    url = "https://api.intra.42.fr/oauth/authorize?"
    url += urlencode(params)
    return redirect(to=url)


@permission_classes([permissions.AllowAny])
@api_view(["GET"])
def get_42access_token(request):
    code = request.GET.get("code")
    print(code)
    if not code:
        return Response(data={"error": "code is missing."}, status=status.HTTP_400_BAD_REQUEST)
    params = {
        "grant_type": "authorization_code",
        "client_id": "u-s4t2ud-b89b6b91d03e4c4ba5eb82d9171a46da61dcfde5635fbebec0afa55cd6fba2cb",
        "client_secret": "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",
        "code": code,
        # "redirect_uri": "http://localhost:8000/api/users/signin/remote/callback",
    }
    response = requests.post(url="https://api.intra.42.fr/oauth/token", data=params)
    if not response.status_code == 200:
        return Response(data={"error": "failed to obtain access token."}, status=status.HTTP_401_UNAUTHORIZED)
    access_token = response.json().get("access_token")
    print(access_token)

    return Response(status=status.HTTP_200_OK)


def callback(request):
    print(request.data)
