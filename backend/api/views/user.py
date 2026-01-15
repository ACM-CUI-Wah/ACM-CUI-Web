from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from api.models import Student
from api.permissions import IsLeadOrAdmin
from api.serializers import StudentSerializer, StudentListSerializer, PublicStudentSerializer, \
    ProfileUpdateSerializer

User = get_user_model()
DEFAULT_PASSWORD = '12345'


class StudentsListView(generics.ListAPIView):
    serializer_class = StudentListSerializer
    permission_classes = [IsLeadOrAdmin]

    def get_queryset(self):
        if self.request.user.role == 'LEAD':
            club = self.request.user.student.club
            return Student.objects.filter(club=club)
        return Student.objects.all()


class PublicStudentsListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicStudentSerializer

    def get_queryset(self):
        return Student.objects.all()


class StudentRUView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        """Use ProfileUpdateSerializer for PATCH requests (profile updates)"""
        if self.request.method == 'PATCH':
            return ProfileUpdateSerializer
        return StudentSerializer

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests for profile updates with nested user data"""
        instance = self.get_object()
        user = instance.user

        # Parse nested user[field] format from multipart form data
        data = {}
        user_data = {}

        for key, value in request.data.items():
            if key.startswith('user[') and key.endswith(']'):
                # Extract field name from user[field_name]
                field_name = key[5:-1]
                # Only include if the value has actually changed
                if field_name == 'id':
                    continue  # Skip id field
                current_value = getattr(user, field_name, None)
                if str(current_value) != str(value):
                    user_data[field_name] = value
            elif key == 'profile_pic':
                data['profile_pic'] = value
            elif key == 'profile_desc':
                data['profile_desc'] = value

        # Only include user data if there are actual changes
        if user_data:
            data['user'] = user_data

        serializer = self.get_serializer(instance, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)

        # Return full student data after update
        response_serializer = StudentSerializer(instance)
        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Delete student and their associated user account"""
        student = self.get_object()
        user = student.user  # Get the associated user
        student.delete()  # Delete the student record
        user.delete()  # Delete the user record
        return Response(status=status.HTTP_204_NO_CONTENT)
