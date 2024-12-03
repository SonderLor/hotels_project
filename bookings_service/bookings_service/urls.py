"""
URL configuration for bookings_service project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/bookings/', include('bookings.urls')),
]
