from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HotelViewSet, HotelTypeViewSet, CurrentUserHotelsView, HotelImageUploadView, HotelImageDeleteView

router = DefaultRouter()
router.register('types', HotelTypeViewSet, basename='hotel-type')
router.register('hotels', HotelViewSet, basename='hotel')

urlpatterns = [
   path('user/', CurrentUserHotelsView.as_view(), name='current_user_hotels'),
   path('hotels/<int:hotel_id>/upload-images/', HotelImageUploadView.as_view(), name='hotel_upload_images'),
   path('hotels/<int:hotel_id>/delete-images/<int:image_id>/', HotelImageDeleteView.as_view(), name='hotel_delete_images'),
   path('', include(router.urls)),
]
