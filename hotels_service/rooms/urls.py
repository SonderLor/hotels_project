from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, RoomTypeViewSet, RoomImageUploadView, RoomImageDeleteView, SearchRoomsAPIView, SearchRoomsByIdsView

router = DefaultRouter()
router.register('rooms', RoomViewSet, basename='room')
router.register('types', RoomTypeViewSet, basename='room-type')

urlpatterns = [
   path('rooms/<int:room_id>/upload-images/', RoomImageUploadView.as_view(), name='room-upload-images'),
   path('rooms/<int:room_id>/delete-images/<int:image_id>/', RoomImageDeleteView.as_view(), name='room-delete-images'),
   path('search/', SearchRoomsAPIView.as_view(), name='search-rooms'),
   path('search-by-ids/', SearchRoomsByIdsView.as_view(), name='search-by-ids'),
   path('', include(router.urls)),
]
