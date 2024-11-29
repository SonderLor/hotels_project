"""
URL configuration for hotels_service project.
"""
from django.conf.urls.static import static
from hotels_service import settings
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hotels-rooms/hotels-app/', include('hotels.urls')),
    path('api/hotels-rooms/rooms-app/', include('rooms.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
