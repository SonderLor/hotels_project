from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Booking


@receiver(post_save, sender=Booking)
def schedule_task_for_booking(sender, instance, created, **kwargs):
    if created and instance.status in ['active', 'confirmed']:
        from bookings_service.celery import app
        run_time = instance.end_date
        app.send_task(
            'bookings_service.tasks.mark_booking_as_finished',
            args=[instance.id],
            eta=run_time
        )
