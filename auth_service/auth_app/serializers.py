from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
import logging

logger = logging.getLogger(__name__)


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        logger.debug("Token created for user: %s", user.username)
        return token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        logger.info("Creating a new user with data: %s", validated_data)
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
        )
        logger.info("User created successfully with ID: %s", user.id)
        return user

    def update(self, instance, validated_data):
        logger.info("Updating user ID %s with data: %s", instance.id, validated_data)
        password = validated_data.pop('password', None)
        email = validated_data.get('email', instance.email)

        if email != instance.email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
            logger.info("Password updated for user ID: %s", instance.id)
        return user
