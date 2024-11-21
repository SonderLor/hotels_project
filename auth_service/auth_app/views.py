from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from .kafka_events import send_user_created_event, send_user_deleted_event
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)


class UserCreateView(APIView):
    def post(self, request, *args, **kwargs):
        logger.info("Received request to create a new user with data: %s", request.data)
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info("User created successfully with ID: %s", user.id)
            send_user_created_event(user.id, user.username)
            return Response({
                'message': 'User created successfully!',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        logger.warning("Invalid input for user creation: %s", serializer.errors)
        return Response({"detail": "Invalid input", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer: UserSerializer):
        logger.info("Performing user creation.")
        user = serializer.save()
        logger.info("User created successfully with ID: %s", user.id)
        send_user_created_event(user.id, user.username)

    def perform_update(self, serializer):
        logger.info("Performing update for user ID: %s", serializer.instance.id)
        serializer.save()

    def perform_destroy(self, instance):
        logger.info("Performing delete for user ID: %s", instance.id)
        user_id = instance.id
        instance.delete()
        send_user_deleted_event(user_id)
        logger.info("User deleted successfully with ID: %s", user_id)
