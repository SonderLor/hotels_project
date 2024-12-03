from celery import shared_task
from bookings.models import Booking
from datetime import datetime


@shared_task
def mark_booking_as_finished(booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
        if booking.status == 'active' or booking.status == 'confirmed' and booking.end_date < datetime.now():
            booking.status = 'finished'
            booking.save()
            return f'Booking {booking_id} marked as finished.'
        return f'Booking {booking_id} is already {booking.status}.'
    except Booking.DoesNotExist:
        return f'Booking {booking_id} does not exist.'
