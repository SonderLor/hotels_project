from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework import status
from .models import Booking
from .serializers import BookingSerializer, RoomIdListSerializer
from bookings_service.permissions import TokenAuthenticated
from .kafka_events import send_booking_created_event
import logging

logger = logging.getLogger(__name__)


class BookingViewSet(ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [TokenAuthenticated]

    def list(self, request, *args, **kwargs):
        logger.info("Fetching bookings list")
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        logger.info("Retrieving booking ID: %s", kwargs['pk'])
        response = super().retrieve(request, *args, **kwargs)
        logger.info("Booking retrieved successfully for ID: %s", kwargs['pk'])
        return response

    def create(self, request, *args, **kwargs):
        logger.info("Attempting to create a new booking with data: %s", request.data)
        response = super().create(request, *args, **kwargs)
        logger.info("Booking created successfully: %s", response.data)
        send_booking_created_event(response.data)
        return response

    def update(self, request, *args, **kwargs):
        logger.info("Updating booking ID: %s with data: %s", kwargs['pk'], request.data)
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        logger.info("Booking updated successfully for ID: %s", kwargs['pk'])
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        logger.info("Deleting booking ID: %s", kwargs['pk'])
        response = super().destroy(request, *args, **kwargs)
        logger.info("Booking deleted successfully for ID: %s", kwargs['pk'])
        return response


class UnavailableRoomsView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response({"error": "start_date and end_date are required."}, status=status.HTTP_400_BAD_REQUEST)

        booked_rooms = Booking.objects.filter(
            end_date__gte=start_date,
            start_date__lte=end_date,
            status__in=["active", "confirmed"]
        ).values_list('room_id', flat=True)

        unavailable_room_ids = list(set(booked_rooms))
        return Response({"unavailable_room_ids": unavailable_room_ids}, status=status.HTTP_200_OK)


class CurrentUserBookingView(APIView):
    permission_classes = [TokenAuthenticated]

    def get(self, request, *args, **kwargs):
        logger.info("Fetching bookings for user ID: %s", request.user_id)
        try:
            user_id = request.user_id
            bookings = Booking.objects.filter(user_id=user_id)
            serializer = BookingSerializer(bookings, many=True, context={'request': request})
            logger.info("Bookings retrieved successfully for user ID: %s", user_id)
            return Response(serializer.data)
        except Booking.DoesNotExist:
            logger.warning("Bookings not found for user ID: %s", request.user_id)
            return Response({"error": "Bookings not found"}, status=404)


class BookingsByRoomIdView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = RoomIdListSerializer(data=request.data)
        if serializer.is_valid():
            room_ids = serializer.validated_data['room_ids']
            
            bookings = Booking.objects.filter(room_id__in=room_ids)
            response_data = BookingSerializer(bookings, many=True).data
            
            return Response(response_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
