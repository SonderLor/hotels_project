from rest_framework import serializers
from .models import Booking


class RoomIdListSerializer(serializers.Serializer):
    room_ids = serializers.ListField(
        child=serializers.IntegerField(), 
        allow_empty=False
    )


class BookingSerializer(serializers.ModelSerializer):

    class Meta:
        model = Booking
        fields = ['id', 'user_id', 'room_id', 'start_date', 'end_date', 'created_at', 'updated_at', 'status']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, data):
        if 'room_id' in data and 'start_date' in data and 'end_date' in data:
            room_id = data['room_id']
            start_date = data['start_date']
            end_date = data['end_date']

            if start_date >= end_date:
                raise serializers.ValidationError("End date must be after start date.")

            overlapping_bookings = Booking.objects.filter(
                room_id=room_id,
                start_date__lt=end_date,
                end_date__gt=start_date,
                status__in=["active", "confirmed"]
            )
            if overlapping_bookings.exists():
                raise serializers.ValidationError("This room is already booked for the selected dates.")

        return data
