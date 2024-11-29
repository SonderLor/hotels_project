from rest_framework import serializers
from .models import Room, RoomType, Image
from hotels.models import Hotel


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ('id', 'image', 'uploaded_at')


class RoomTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomType
        fields = ('name', 'description')


class RoomSerializer(serializers.ModelSerializer):
    type = serializers.SlugRelatedField(
        queryset=RoomType.objects.all(),
        slug_field='name'
    )
    hotel = serializers.PrimaryKeyRelatedField(queryset=Hotel.objects.all())
    images = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = ('id', 'name', 'price_per_night', 'is_available', 'type', 'hotel', 'images', 'preview_image')
