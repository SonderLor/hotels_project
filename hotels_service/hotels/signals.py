from django.core.cache import cache
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Hotel


@receiver([post_save, post_delete], sender=Hotel)
def clear_hotel_search_cache(sender, **kwargs):
    pattern = "hotels_search:*"
    cache.delete_pattern(pattern)
