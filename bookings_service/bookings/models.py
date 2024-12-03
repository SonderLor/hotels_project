from django.db import models


class Booking(models.Model):
    user_id = models.BigIntegerField()
    room_id = models.BigIntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=50)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking by {self.user} for room {self.room} from {self.start_date} to {self.end_date}"
