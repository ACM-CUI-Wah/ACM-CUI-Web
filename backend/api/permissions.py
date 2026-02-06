from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied

ADMIN = 'ADMIN'
LEAD = 'LEAD'
STUDENT = 'STUDENT'
TREASURER = 'TREASURER'

# Custom permissions for user types

class IsLead(permissions.BasePermission):
    message = 'Only user type: \'lead\' is allowed to use this endpoint.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == LEAD

class IsAdmin(permissions.BasePermission):
    """
    Allows access only to users with role = 'ADMIN'.
    """
    message = 'Only admins are allowed to perform this action.'

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == ADMIN

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:  # GET, HEAD, OPTIONS
            return True
        return request.user.is_authenticated and request.user.role == ADMIN

class IsLeadOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.role == LEAD or ADMIN)

def is_staff(role: str):
    return role == LEAD or ADMIN

class IsTreasurer(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.student.title.upper() == TREASURER)

class SignUpPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user.is_authenticated and (request.user.role == LEAD or ADMIN):
            if request.user.role == LEAD and request.user.student.club != request.data['club']:
                raise PermissionDenied('Registering users of another club is not allowed.')
        return True


class IsAdminOrAuthor(permissions.BasePermission):
    """
    Allows access to admins or the author of the blog.
    """
    message = 'Only admins or the author of this blog can perform this action.'

    def has_permission(self, request, view):
        # Allow authenticated users to reach object-level check
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin can do anything
        if request.user.role == ADMIN:
            return True

        # Author can access their own blog
        return obj.createdBy == request.user