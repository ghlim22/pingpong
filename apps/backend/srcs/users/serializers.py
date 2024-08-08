from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.validators import UniqueValidator

# Create your tests here.
from .models import CustomUser
from .validators import NicknameValidator


class UserSignUpSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all())],
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
    )
    confirm_password = serializers.CharField(
        write_only=True,
        required=True,
    )
    nickname = serializers.CharField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all()), NicknameValidator()],
    )
    picture = serializers.ImageField(
        write_only=True,
        required=False,
        default="users/profile-default.png",
    )

    class Meta:
        model = CustomUser
        fields = ["email", "password", "confirm_password", "nickname", "picture"]

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Password didn't match"})
        del data["confirm_password"]
        return data

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            nickname=validated_data["nickname"],
            picture=validated_data["picture"],
        )
        # Token.objects.create(user=user)  # Generate a DRF default token for given user.
        return user


class UserSignInSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        user = authenticate(**data)
        if user is None:
            raise serializers.ValidationError({"error": "Unable to sign in with provided credentials."})
        if not user.is_active:
            raise serializers.ValidationError({"error": "User account is disabled."})
        if user.is_superuser:
            raise serializers.ValidationError({"error": "Sign in with superuser account is disabled."})
        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])
        token = Token.objects.get(user=user)
        return {"email": user.email, "nickname": user.nickname, "token": token.key}
