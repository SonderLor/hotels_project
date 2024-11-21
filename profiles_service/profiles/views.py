from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Profile
from .serializers import ProfileSerializer
import logging

logger = logging.getLogger(__name__)


class CurrentUserProfileView(APIView):

    def get(self, request, *args, **kwargs):
        try:
            user_id = request.user.id
            profile = Profile.objects.get(user_id=user_id)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            logger.warning(f"Profile not found for user ID {request.user.id}")
            return Response({"error": "Profile not found"}, status=404)


class ProfileListCreateView(generics.ListCreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def list(self, request, *args, **kwargs):
        logger.info("Fetching profile list for user: %s", request.user)
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        logger.info("Creating a new profile with data: %s", request.data)
        response = super().create(request, *args, **kwargs)
        logger.info("Profile created successfully: %s", response.data)
        return response


class ProfileDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def retrieve(self, request, *args, **kwargs):
        logger.info("Retrieving profile ID: %s", kwargs['pk'])
        return super().retrieve(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        logger.info("Updating profile ID: %s with data: %s", kwargs['pk'], request.data)
        response = super().update(request, *args, **kwargs)
        logger.info("Profile updated successfully: %s", response.data)
        return response

    def destroy(self, request, *args, **kwargs):
        logger.info("Deleting profile ID: %s", kwargs['pk'])
        response = super().destroy(request, *args, **kwargs)
        logger.info("Profile deleted successfully.")
        return response
