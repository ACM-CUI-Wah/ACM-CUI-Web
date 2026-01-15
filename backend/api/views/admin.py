from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.response import Response
from api.permissions import IsAdmin
from api.serializers import AdminSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

@extend_schema(
    summary="Retrieve, Update, or Delete an Admin",
    description="Manages a single Admin user by their ID. Restricted to Admins."
)
class AdminRUDView(generics.RetrieveUpdateDestroyAPIView):
    """ Retrieve, Update, or Delete an Admin user. """
    serializer_class = AdminSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return User.objects.filter(role='ADMIN')

    def update(self, request, *args, **kwargs):
        response = super().update(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            return Response({
                "status": "success",
                "message": "Admin user updated successfully",
                "data": response.data
            }, status=status.HTTP_200_OK)
        return response

    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response({
            "status": "success",
            "message": "Admin user deleted successfully",
            "data": None
        }, status=status.HTTP_200_OK)
