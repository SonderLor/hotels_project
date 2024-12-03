from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, UnavailableRoomsView, CurrentUserBookingView, BookingsByRoomIdView

router = DefaultRouter()
router.register('', BookingViewSet, basename='booking')

urlpatterns = [
   path('unavailable-rooms/', UnavailableRoomsView.as_view(), name='unavailable-rooms'),
   path('user/', CurrentUserBookingView.as_view(), name='current-user-bookings'),
   path('get-by-room-id/', BookingsByRoomIdView.as_view(), name='get-by-room-id'),
   path('', include(router.urls)),
]
