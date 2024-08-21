from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.validators import UniqueValidator

# Create your tests here.
from .models import CustomUser
from .validators import NicknameValidator


class UserSignInSerializer(serializers.Serializer):
    email = serializers.CharField(required=True, min_length=3)
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    def validate(self, data):
        user = authenticate(**data)
        if user is None:
            raise serializers.ValidationError({"error": "Unable to sign in with provided credentials."})
        if not user.is_active:
            raise serializers.ValidationError({"error": "User account is disabled."})
        if user.is_superuser:
            raise serializers.ValidationError({"error": "Sign in with superuser account is disabled."})
        user.last_login = timezone.now()
        user.status = CustomUser.Status.CONNECTED
        user.save(update_fields=["last_login", "status"])
        token = Token.objects.get(user=user)
        return {
            "pk": user.pk,
            "email": user.email,
            "nickname": user.nickname,
            "picture": user.picture.url,
            "token": token.key,
        }


class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            "pk",
            "picture",
            "nickname",
            "status",
        ]
        read_only_fields = [
            "pk",
            "picture",
            "nickname",
            "status",
        ]


class UserFollowSerializer(serializers.ModelSerializer):
    followings = UserSimpleSerializer(many=True, read_only=True)
    followers = UserSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "followings",
            "followers",
        ]


class UserBlockSerializer(serializers.ModelSerializer):
    blocks = UserSimpleSerializer(many=True, read_only=True)
    blocked = UserSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "blocks",
            "blocked",
        ]


class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(queryset=CustomUser.objects.all()),
        ],
        min_length=3,
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[
            validate_password,
        ],
        min_length=8,
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
    )
    nickname = serializers.CharField(
        required=True,
        validators=[
            UniqueValidator(queryset=CustomUser.objects.all()),
            NicknameValidator(),
        ],
        min_length=2,
        max_length=8,
    )
    picture = serializers.ImageField(
        required=True,
    )
    followings = UserSimpleSerializer(many=True, read_only=True)
    followers = UserSimpleSerializer(many=True, read_only=True)
    blocks = UserSimpleSerializer(many=True, read_only=True)
    blocked = UserSimpleSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            "pk",
            "email",
            "password",
            "confirm_password",
            "nickname",
            "picture",
            "followings",
            "followers",
            "blocks",
            "blocked",
            "win",
            "lose",
            "status",
        ]
        read_only_fields = [
            "pk",
            "win",
            "lose",
            "status",
        ]

    def validate(self, data):
        data.setdefault("password", None)
        data.setdefault("confirm_password", None)
        if data["password"] is None:
            return data
        if data["confirm_password"] is None:
            raise serializers.ValidationError({"confirm_password": "This field is required."})
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Password didn't match."})
        del data["confirm_password"]
        return data

    def create(self, validated_data):
        return CustomUser.objects.create_user(**validated_data)

    def update(self, instance: CustomUser, validated_data):
        password = validated_data.pop("password", None)
        if password is not None:
            instance.set_password(password)
        for (key, value) in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance
