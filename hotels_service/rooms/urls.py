from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, RoomTypeViewSet, RoomImageUploadView, RoomImageDeleteView

router = DefaultRouter()
router.register('rooms', RoomViewSet, basename='room')
router.register('types', RoomTypeViewSet, basename='room-type')

urlpatterns = [
   path('rooms/<int:room_id>/upload-images/', RoomImageUploadView.as_view(), name='room_upload_images'),
   path('rooms/<int:room_id>/delete-images/<int:image_id>/', RoomImageDeleteView.as_view(), name='room_delete_images'),
   path('', include(router.urls)),
]
