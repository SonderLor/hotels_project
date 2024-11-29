import jwt
from . import settings
import logging

logger = logging.getLogger(__name__)


class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        user_id = None
        user_role = None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get('user_id')
                user_role = payload.get('role')
                logger.info("User ID %s extracted from token successfully.", user_id)
                logger.info("User role %s extracted from token successfully.", user_role)
            except jwt.ExpiredSignatureError:
                logger.warning("Token has expired.")
            except jwt.InvalidTokenError:
                logger.error("Invalid token provided - %s.", token)

        request.user_id = user_id
        request.user_role = user_role
        logger.info("Request processed with user ID, role: %s, %s", user_id, user_role)
        return self.get_response(request)
