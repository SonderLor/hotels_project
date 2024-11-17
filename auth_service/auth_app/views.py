from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from .kafka_events import send_user_created_event, send_user_deleted_event
from .serializers import UserSerializer


class UserCreateView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            send_user_created_event(user.id, user.username)
            return Response({
                'message': 'User created successfully!',
                'user': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer: UserSerializer):
        user = serializer.save()
        send_user_created_event(user.id, user.username)

    def perform_update(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        user_id = instance.id
        instance.delete()
        send_user_deleted_event(user_id)
