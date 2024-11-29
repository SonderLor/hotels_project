"""
ASGI config for bookings_service project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bookings_service.settings')

application = get_asgi_application()
