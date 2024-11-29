from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from .models import Profile
from .permissions import TokenAuthenticated
from .serializers import ProfileSerializer
import logging

logger = logging.getLogger(__name__)


class CurrentUserProfileView(APIView):
    permission_classes = [TokenAuthenticated]

    def get(self, request, *args, **kwargs):
        logger.info("Fetching profile for user ID: %s", request.user_id)
        try:
            user_id = request.user_id
            profile = Profile.objects.get(user_id=user_id)
            serializer = ProfileSerializer(profile, context={'request': request})
            logger.info("Profile retrieved successfully for user ID: %s", user_id)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            logger.warning("Profile not found for user ID: %s", request.user_id)
            return Response({"error": "Profile not found"}, status=404)


class ProfileViewSet(ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [TokenAuthenticated]

    def list(self, request, *args, **kwargs):
        logger.info("Fetching profile list for user: %s", request.user_id)
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        logger.info("Attempting to create a new profile with data: %s", request.data)
        response = super().create(request, *args, **kwargs)
        logger.info("Profile created successfully: %s", response.data)
        return response

    def retrieve(self, request, *args, **kwargs):
        logger.info("Retrieving profile ID: %s", kwargs['pk'])
        response = super().retrieve(request, *args, **kwargs)
        logger.info("Profile retrieved successfully for ID: %s", kwargs['pk'])
        return response

    def update(self, request, *args, **kwargs):
        logger.info("Updating profile ID: %s with data: %s", kwargs['pk'], request.data)
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info("Profile updated successfully for ID: %s", kwargs['pk'])
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        logger.info("Deleting profile ID: %s", kwargs['pk'])
        response = super().destroy(request, *args, **kwargs)
        logger.info("Profile deleted successfully for ID: %s", kwargs['pk'])
        return response
