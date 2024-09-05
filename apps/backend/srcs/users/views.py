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
        permissions.IsAuthenticated,
    ]
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer


@extend_schema(responses=UserSimpleSerializer)
@permission_classes([permissions.IsAuthenticated])
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

        data = serializer.data
        data["picture"] = instance.picture.url

        return Response(data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = request.user
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, "_prefetched_objects_cache", None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        data = serializer.data
        data["picture"] = instance.picture.url

        return Response(data)

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


@extend_schema(
    responses=inline_serializer(
        name="OtherUserDetailSerializer",
        fields={
            "picture": serializers.URLField(),
            "win": serializers.IntegerField(),
            "lose": serializers.IntegerField(),
            "following": serializers.BooleanField(),
            "blocked": serializers.BooleanField(),
        },
    )
)
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def OtherUserDetailView(request, pk):
    """
    Show other user's detail.
    """
    instance = request.user
    obj = get_object_or_404(queryset=CustomUser.objects.all(), pk=pk)
    if instance.pk == obj.pk:
        return Response(data={"error": "You cannot make this request of yourself."}, status=status.HTTP_400_BAD_REQUEST)
    if obj in instance.followings.all():
        following = True
    else:
        following = False
    if obj in instance.blocks.all():
        blocked = True
    else:
        blocked = False

    data = {
        "picture": obj.picture.url,
        "win": obj.win,
        "lose": obj.lose,
        "following": following,
        "blocked": blocked,
    }

    return Response(data=data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def GameLogListView(request, pk):
    """
    List requesting user's game logs.
    """
    instance = get_object_or_404(CustomUser.objects.all(), pk=pk)
    logs = instance.joined_games.all().order_by("-timestamp")
    return_list = []
    for log in logs:
        if instance in log.winners.all():
            won = True
        else:
            won = False

        players = []

        if won:
            opponents = log.losers.all()
        else:
            opponents = log.winners.all()

        for opponent in opponents:
            players.append(opponent.nickname)

        game = {
            "timestamp": log.timestamp,
            "type": log.game_type,
            "won": won,
            "players": players,
        }
        return_list.append(game)

    return Response(data=return_list, status=status.HTTP_200_OK)


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
