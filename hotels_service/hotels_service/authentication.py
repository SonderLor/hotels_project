import jwt
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from hotels_service import settings
import logging

logger = logging.getLogger(__name__)


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.warning("No valid Authorization header found.")
            return None

        token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            logger.info("Token decoded successfully for user ID: %s", payload.get('user_id'))
        except jwt.ExpiredSignatureError:
            logger.warning("Authentication failed: Token has expired.")
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            logger.error("Authentication failed: Invalid token.")
            raise AuthenticationFailed('Invalid token')

        user_id = payload.get('user_id')
        user_role = payload.get('role')
        if not user_id:
            logger.error("Authentication failed: Token payload does not contain user ID.")
            raise AuthenticationFailed('Invalid payload')
        if not user_role:
            logger.error("Authentication failed: Token payload does not contain user role.")
            raise AuthenticationFailed('Invalid payload')

        return user_id
