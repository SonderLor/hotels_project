from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from .models import Hotel, HotelType, Image
from .serializers import HotelSerializer, HotelTypeSerializer, ImageSerializer
from hotels_service.permissions import TokenAuthenticated, RoleStaff
import logging

logger = logging.getLogger(__name__)


class HotelImageUploadView(APIView):
    permission_classes = [TokenAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, hotel_id, *args, **kwargs):
        logger.info("Uploading images for hotel ID: %s", hotel_id)
        try:
            hotel = Hotel.objects.get(id=hotel_id)
            if hotel.owner_id != request.user_id:
                logger.warning("User ID %s does not own hotel ID %s", request.user_id, hotel_id)
                return Response({"error": "You do not own this hotel"}, status=403)

            files = request.FILES.getlist('images')
            if not files:
                return Response({"error": "No images provided"}, status=400)

            image_objects = []
            for file in files:
                image = Image.objects.create(hotel=hotel, image=file)
                image_objects.append(image)
                logger.info("Image uploaded for hotel ID %s: %s", hotel_id, file.name)

            serializer = ImageSerializer(image_objects, many=True)
            logger.info("Images uploaded successfully for hotel ID %s", hotel_id)
            return Response(serializer.data, status=201)

        except Hotel.DoesNotExist:
            logger.error("Hotel ID %s does not exist", hotel_id)
            return Response({"error": "Hotel not found"}, status=404)

        except Exception as e:
            logger.error("Error uploading images for hotel ID %s: %s", hotel_id, e, exc_info=True)
            return Response({"error": "Something went wrong"}, status=500)


class HotelImageDeleteView(APIView):
    permission_classes = [TokenAuthenticated]

    def delete(self, request, hotel_id, image_id, *args, **kwargs):
        logger.info("Deleting image ID %s for hotel ID %s", image_id, hotel_id)
        try:
            hotel = Hotel.objects.get(id=hotel_id)
            image = Image.objects.get(id=image_id, hotel=hotel)

            if hotel.owner_id != request.user_id:
                logger.warning("User ID %s does not own hotel ID %s", request.user_id, hotel_id)
                return Response({"error": "You do not own this hotel"}, status=403)

            image.delete()
            logger.info("Image ID %s deleted successfully for hotel ID %s", image_id, hotel_id)
            return Response({"message": "Image deleted successfully"}, status=204)

        except Hotel.DoesNotExist:
            logger.error("Hotel ID %s does not exist", hotel_id)
            return Response({"error": "Hotel not found"}, status=404)

        except Image.DoesNotExist:
            logger.error("Image ID %s does not exist for hotel ID %s", image_id, hotel_id)
            return Response({"error": "Image not found"}, status=404)

        except Exception as e:
            logger.error("Error deleting image ID %s for hotel ID %s: %s", image_id, hotel_id, e, exc_info=True)
            return Response({"error": "Something went wrong"}, status=500)


class HotelTypeViewSet(ModelViewSet):
    queryset = HotelType.objects.all()
    serializer_class = HotelTypeSerializer
    permission_classes = [TokenAuthenticated]

    def list(self, request, *args, **kwargs):
        logger.info("Fetching all hotel types")
        return super().list(request, *args, **kwargs)


class HotelViewSet(ModelViewSet):
    queryset = Hotel.objects.prefetch_related('rooms')
    serializer_class = HotelSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [TokenAuthenticated(), RoleStaff()]
        return [TokenAuthenticated()]

    def list(self, request, *args, **kwargs):
        logger.info("Fetching hotels list")
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        logger.info("Retrieving hotel ID: %s", kwargs['pk'])
        response = super().retrieve(request, *args, **kwargs)
        logger.info("Hotel retrieved successfully for ID: %s", kwargs['pk'])
        return response

    def create(self, request, *args, **kwargs):
        logger.info("Attempting to create a new hotel with data: %s", request.data)
        response = super().create(request, *args, **kwargs)
        logger.info("Hotel created successfully: %s", response.data)
        return response

    def update(self, request, *args, **kwargs):
        logger.info("Updating hotel ID: %s with data: %s", kwargs['pk'], request.data)
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info("Hotel updated successfully for ID: %s", kwargs['pk'])
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        logger.info("Deleting hotel ID: %s", kwargs['pk'])
        response = super().destroy(request, *args, **kwargs)
        logger.info("Hotel deleted successfully for ID: %s", kwargs['pk'])
        return response


class CurrentUserHotelsView(APIView):
    permission_classes = [TokenAuthenticated, RoleStaff]

    def get(self, request, *args, **kwargs):
        logger.info("Fetching hotels for user ID: %s", request.user_id)
        try:
            user_id = request.user_id
            hotels = Hotel.objects.filter(owner_id=user_id)
            if not hotels.exists():
                logger.warning("No hotels found for user ID: %s", user_id)
                return Response({"error": "No hotels found"}, status=404)
            serializer = HotelSerializer(hotels, many=True, context={'request': request})
            logger.info("Hotels retrieved successfully for user ID: %s", user_id)
            return Response(serializer.data)
        except Exception as e:
            logger.error("Error fetching hotels for user ID: %s, error: %s", user_id, str(e))
            return Response({"error": "Something went wrong"}, status=500)
