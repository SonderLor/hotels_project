from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser
from rest_framework.views import APIView
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import ListAPIView
from .models import Room, RoomType, Image
from .serializers import RoomSerializer, RoomTypeSerializer, ImageSerializer
from .filters import RoomFilter
from hotels_service.permissions import TokenAuthenticated, RoleStaff
import logging

logger = logging.getLogger(__name__)


class RoomImageUploadView(APIView):
    permission_classes = [TokenAuthenticated]
    parser_classes = [MultiPartParser]

    def post(self, request, room_id, *args, **kwargs):
        logger.info("Uploading images for room ID: %s", room_id)
        try:
            room = Room.objects.get(id=room_id)
            if room.hotel.owner_id != request.user_id:
                logger.warning("User ID %s does not own hotel ID %s", request.user_id, room.hotel.id)
                return Response({"error": "You do not own this hotel"}, status=403)

            files = request.FILES.getlist('images')
            if not files:
                return Response({"error": "No images provided"}, status=400)

            image_objects = list()
            for file in files:
                image = Image.objects.create(room=room, image=file)
                image_objects.append(image)
                logger.info("Image uploaded for room ID %s: %s", room_id, file.name)

            serializer = ImageSerializer(image_objects, many=True)
            logger.info("Images uploaded successfully for room ID %s", room_id)
            return Response(serializer.data, status=201)

        except Room.DoesNotExist:
            logger.error("Room ID %s does not exist", room_id)
            return Response({"error": "Room not found"}, status=404)

        except Exception as e:
            logger.error("Error uploading images for room ID %s: %s", room_id, e, exc_info=True)
            return Response({"error": "Something went wrong"}, status=500)


class RoomImageDeleteView(APIView):
    permission_classes = [TokenAuthenticated]

    def delete(self, request, room_id, image_id, *args, **kwargs):
        logger.info("Deleting image ID %s for room ID %s", image_id, room_id)
        try:
            room = Room.objects.get(id=room_id)
            image = Image.objects.get(id=image_id, room=room)

            if room.hotel.owner_id != request.user_id:
                logger.warning("User ID %s does not own room ID %s", request.user_id, room_id)
                return Response({"error": "You do not own this room"}, status=403)

            image.delete()
            logger.info("Image ID %s deleted successfully for room ID %s", image_id, room_id)
            return Response({"message": "Image deleted successfully"}, status=204)

        except Room.DoesNotExist:
            logger.error("Room ID %s does not exist", room_id)
            return Response({"error": "Room not found"}, status=404)

        except Image.DoesNotExist:
            logger.error("Image ID %s does not exist for room ID %s", image_id, room_id)
            return Response({"error": "Image not found"}, status=404)

        except Exception as e:
            logger.error("Error deleting image ID %s for room ID %s: %s", image_id, room_id, e, exc_info=True)
            return Response({"error": "Something went wrong"}, status=500)


class RoomTypeViewSet(ModelViewSet):
    queryset = RoomType.objects.all()
    serializer_class = RoomTypeSerializer
    permission_classes = [TokenAuthenticated]

    def list(self, request, *args, **kwargs):
        logger.info("Fetching all room types")
        return super().list(request, *args, **kwargs)


class RoomViewSet(ModelViewSet):
    queryset = Room.objects.select_related('hotel')
    serializer_class = RoomSerializer
    
    def get_permissions(self):
        if self.action == 'create' or self.action == 'update' or self.action == 'destroy':
            return [RoleStaff()]
        return [TokenAuthenticated()]

    def list(self, request, *args, **kwargs):
        logger.info("Fetching rooms list")
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        logger.info("Retrieving room ID: %s", kwargs['pk'])
        response = super().retrieve(request, *args, **kwargs)
        logger.info("Room retrieved successfully for ID: %s", kwargs['pk'])
        return response

    def create(self, request, *args, **kwargs):
        logger.info("Attempting to create a new room with data: %s", request.data)
        response = super().create(request, *args, **kwargs)
        logger.info("Room created successfully: %s", response.data)
        return response

    def update(self, request, *args, **kwargs):
        logger.info("Updating room ID: %s with data: %s", kwargs['pk'], request.data)
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info("Room updated successfully for ID: %s", kwargs['pk'])
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        logger.info("Deleting room ID: %s", kwargs['pk'])
        response = super().destroy(request, *args, **kwargs)
        logger.info("Room deleted successfully for ID: %s", kwargs['pk'])
        return response


class SearchRoomsAPIView(ListAPIView):
    queryset = Room.objects.select_related('hotel')
    serializer_class = RoomSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = RoomFilter
    ordering_fields = ['price_per_night']
    ordering = ['price_per_night']


class SearchRoomsByIdsView(APIView):
    permission_classes = [TokenAuthenticated]

    def post(self, request):
        room_ids = request.data.get('room_ids', [])
        hotel = request.data.get('hotel')
        country = request.data.get('country')
        city = request.data.get('city')
        room_type = request.data.get('type')
        name = request.data.get('name')
        price_min = request.data.get('price_min')
        price_max = request.data.get('price_max')
        sort = request.data.get('sort')

        query = Room.objects.exclude(id__in=room_ids).select_related('hotel')

        if hotel:
            query = query.filter(hotel__name__icontains=hotel)
        if country:
            query = query.filter(hotel__country__icontains=country)
        if city:
            query = query.filter(hotel__city__icontains=city)
        if room_type:
            query = query.filter(type__name=room_type)
        if name:
            query = query.filter(name__icontains=name)
        if price_min:
            query = query.filter(price_per_night__gte=price_min)
        if price_max:
            query = query.filter(price_per_night__lte=price_max)

        if sort:
            query = query.order_by(sort)

        serialized_rooms = RoomSerializer(query, many=True, context={'request': request}).data
        return Response({"rooms": serialized_rooms}, status=status.HTTP_200_OK)
