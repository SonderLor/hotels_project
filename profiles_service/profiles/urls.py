from django.conf.urls.static import static
from django.urls import path
from profiles_service import settings
from .views import ProfileListCreateView, ProfileDetailView

urlpatterns = [
    path('', ProfileListCreateView.as_view(), name='profile_list_create'),
    path('<int:pk>/', ProfileDetailView.as_view(), name='profile_detail'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
