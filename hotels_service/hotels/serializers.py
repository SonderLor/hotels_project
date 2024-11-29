from rest_framework import serializers
from .models import Hotel, HotelType, Image
from rooms.serializers import RoomSerializer


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('id', 'image', 'uploaded_at')


class HotelTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HotelType
        fields = ('name', 'description')


class HotelSerializer(serializers.ModelSerializer):
    type = serializers.SlugRelatedField(
        queryset=HotelType.objects.all(),
        slug_field='name'
    )
    rooms = RoomSerializer(many=True, read_only=True)
    images = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = Hotel
        fields = ('id', 'owner_id', 'name', 'address', 'city', 'country', 'description', 'type', 'rooms', 'images', 'preview_image')
