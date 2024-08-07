from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.validators import UniqueValidator

# Create your tests here.
from .models import CustomUser


class SignUpSerializer(serializers.ModelSerializer):
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
        validators=[UniqueValidator(queryset=CustomUser.objects.all())],
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
        Token.objects.create(user=user)  # Generate a DRF default token for given user.
        return user


class SignInSerializer(serializers.Serializer):
    email = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        user = authenticate(**data)
        if user:
            token = Token.objects.get(user=user)
            return token
        raise serializers.ValidationError({"error": "Unable to sign in with provided credentials."})
