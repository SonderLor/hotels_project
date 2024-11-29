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
        if user.is_superuser:
            token['role'] = 'superuser'
        elif user.is_staff:
            token['role'] = 'staff'
        else:
            token['role'] = 'active'
        logger.debug("Token created for user: %s with role: %s", user.username, token['role'])
        return token


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        logger.info("Creating a new user with data: %s", validated_data)
        role = validated_data.pop('role', 'active')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
        )
        if role == 'staff':
            user.is_staff = True
        elif role == 'superuser':
            user.is_superuser = True
        user.save()
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
