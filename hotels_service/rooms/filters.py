from django.db.models.functions import Lower
import django_filters
from .models import Room

class RoomFilter(django_filters.FilterSet):
    hotel = django_filters.CharFilter(method='filter_hotel_name_icontains')
    country = django_filters.CharFilter(method='filter_hotel_country_icontains')
    city = django_filters.CharFilter(method='filter_hotel_city_icontains')
    type = django_filters.CharFilter(field_name='type__name', lookup_expr='exact')
    name = django_filters.CharFilter(method='filter_name_icontains')
    price_per_night_min = django_filters.NumberFilter(field_name='price_per_night', lookup_expr='gte')
    price_per_night_max = django_filters.NumberFilter(field_name='price_per_night', lookup_expr='lte')
    is_available = django_filters.BooleanFilter(field_name='is_available')

    class Meta:
        model = Room
        fields = ['hotel', 'country', 'city', 'type__name', 'name', 'price_per_night_min', 'price_per_night_max', 'is_available']

    def filter_name_icontains(self, queryset, name, value):
        return queryset.annotate(name_lower=Lower('name')).filter(name_lower__icontains=value)

    def filter_hotel_name_icontains(self, queryset, name, value):
        return queryset.annotate(hotel_name_lower=Lower('hotel__name')).filter(hotel_name_lower__icontains=value)

    def filter_hotel_country_icontains(self, queryset, name, value):
        return queryset.annotate(hotel_country_lower=Lower('hotel__country')).filter(hotel_country_lower__icontains=value)

    def filter_hotel_city_icontains(self, queryset, name, value):
        return queryset.annotate(hotel_city_lower=Lower('hotel__city')).filter(hotel_city_lower__icontains=value)
