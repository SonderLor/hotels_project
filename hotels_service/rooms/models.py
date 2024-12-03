from django.db import models
from hotels.models import Hotel


def preview_image_upload_path(instance, filename):
    return f"rooms/{instance.name}/preview/{filename}.png"


def images_upload_path(instance, filename):
    return f"rooms/{instance.room.name}/images/{filename}.png"


class RoomType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Room(models.Model):
    hotel = models.ForeignKey(Hotel, on_delete=models.CASCADE, related_name='rooms')
    type = models.ForeignKey(RoomType, on_delete=models.SET_NULL, null=True, related_name='rooms')
    name = models.CharField(max_length=100)
    price_per_night = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    preview_image = models.ImageField(upload_to=preview_image_upload_path, blank=True, null=True)
    total_bookings = models.BigIntegerField()

    def __str__(self):
        return f"{self.hotel.name} - {self.name}"


class Image(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=images_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for Room: {self.room}"
