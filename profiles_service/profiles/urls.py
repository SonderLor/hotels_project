from django.conf.urls.static import static
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from profiles_service import settings
from .views import CurrentUserProfileView, ProfileViewSet

router = DefaultRouter()
router.register('profiles', ProfileViewSet, basename='profile')

urlpatterns = [
    path('current/', CurrentUserProfileView.as_view(), name='current_user_profile'),
    path('', include(router.urls)),
]
