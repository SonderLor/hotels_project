from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .kafka_events import send_user_created_event, send_user_deleted_event
from .permissions import TokenAuthenticated
from .serializers import UserSerializer
import logging

logger = logging.getLogger(__name__)


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [TokenAuthenticated()]

    def list(self, request, *args, **kwargs):
        logger.info("Fetching users list")
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        logger.info("Retrieving user ID: %s", kwargs['pk'])
        response = super().retrieve(request, *args, **kwargs)
        logger.info("User retrieved successfully for ID: %s", kwargs['pk'])
        return response

    def create(self, request, *args, **kwargs):
        logger.info("Attempting to create a new user with data: %s", request.data)
        response = super().create(request, *args, **kwargs)
        logger.info("User created successfully: %s", response.data)
        new_user = User.objects.get(username=request.data['username'], email=request.data['email'])
        send_user_created_event(user_id=new_user.id, email=new_user.email, username=new_user.username)
        return response

    def update(self, request, *args, **kwargs):
        logger.info("Updating user ID: %s with data: %s", kwargs['pk'], request.data)
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info("User updated successfully for ID: %s", kwargs['pk'])
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        logger.info("Deleting user ID: %s", kwargs['pk'])
        response = super().destroy(request, *args, **kwargs)
        logger.info("User deleted successfully for ID: %s", kwargs['pk'])
        send_user_deleted_event(kwargs['pk'])
        return response
