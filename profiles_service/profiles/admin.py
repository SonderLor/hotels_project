from django.contrib import admin
from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'bio', 'birth_date', 'location', 'profile_picture')
    search_fields = ('user_id', 'location')
    list_filter = ('birth_date', 'location')
    fieldsets = (
        ('Basic Information', {
            'fields': ('user_id', 'bio')
        }),
        ('User Data', {
            'fields': ('birth_date', 'location')
        }),
        ('Profile Picture', {
            'fields': ('profile_picture',)
        }),
    )
