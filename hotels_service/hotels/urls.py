from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HotelViewSet, HotelTypeViewSet, CurrentUserHotelsView, HotelImageUploadView, HotelImageDeleteView, SearchHotelsAPIView

router = DefaultRouter()
router.register('types', HotelTypeViewSet, basename='hotel-type')
router.register('hotels', HotelViewSet, basename='hotel')

urlpatterns = [
   path('user/', CurrentUserHotelsView.as_view(), name='current-user-hotels'),
   path('<int:hotel_id>/upload-images/', HotelImageUploadView.as_view(), name='hotel-upload-images'),
   path('<int:hotel_id>/delete-images/<int:image_id>/', HotelImageDeleteView.as_view(), name='hotel-delete-images'),
   path('search/', SearchHotelsAPIView.as_view(), name='search-hotels'),
   path('', include(router.urls)),
]
