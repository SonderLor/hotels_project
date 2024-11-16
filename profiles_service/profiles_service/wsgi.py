"""
WSGI config for profiles_service project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'profiles_service.settings')

application = get_wsgi_application()
