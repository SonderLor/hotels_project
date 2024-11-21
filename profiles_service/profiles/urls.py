from django.conf.urls.static import static
from django.urls import path
from profiles_service import settings
from .views import ProfileListCreateView, ProfileDetailView, CurrentUserProfileView

urlpatterns = [
    path('', ProfileListCreateView.as_view(), name='profile_list_create'),
    path('<int:pk>/', ProfileDetailView.as_view(), name='profile_detail'),
    path('current/', CurrentUserProfileView.as_view(), name='current_user_profile'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
