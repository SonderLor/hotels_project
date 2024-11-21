import jwt
from profiles_service import settings
import logging

logger = logging.getLogger(__name__)


class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        user_id = None

        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user_id = payload.get('user_id')
                logger.info("User ID %s extracted from token successfully.", user_id)
            except jwt.ExpiredSignatureError:
                logger.warning("Token has expired.")
            except jwt.InvalidTokenError:
                logger.error("Invalid token provided - %s.", token)

        request.user_id = user_id
        logger.info("Request processed with user ID: %s", user_id)
        return self.get_response(request)
