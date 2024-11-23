from django.db import models


def profile_picture_upload_path(instance, filename):
    return f"profile_pictures/{instance.id}.png"


class Profile(models.Model):
    user_id = models.BigIntegerField(unique=True)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=100)
    bio = models.TextField(blank=True, null=True)
    birth_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    profile_picture = models.ImageField(upload_to=profile_picture_upload_path, blank=True, null=True)

    def __str__(self):
        return f"Profile for User ID {self.user_id}"
