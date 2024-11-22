from rest_framework.permissions import BasePermission


class TokenAuthenticated(BasePermission):
    def has_permission(self, request, view):
        return request.user_id is not None
