import json
from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from api.models import Student
from api.permissions import IsLeadOrAdmin
from api.serializers import StudentSerializer, StudentListSerializer, PublicStudentSerializer, \
    ProfileUpdateSerializer
from api.utils import delete_from_bucket

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
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            student = self.get_object()
            if student.user_id == self.request.user.id:
                return ProfileUpdateSerializer   
            return StudentSerializer             
        return StudentSerializer

    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests and parse frontend FormData bracket notation"""
        
        print("INCOMING FILES:", request.FILES)
        print("INCOMING DATA:", request.data)
        print("CONTENT TYPE:", request.content_type)

        instance = self.get_object()
        
        # request.data is immutable for multipart/form-data. 
        # We copy it so we can reformat the keys for the serializer.
        data = request.data.copy()
        user_data = {}
        
        # Intercept keys like 'user[first_name]' and build a proper Python dictionary
        keys_to_remove = []
        for key in data.keys():
            if key.startswith('user[') and key.endswith(']'):
                field_name = key[5:-1] # Extracts 'first_name' from the brackets
                # Skip the ID to prevent accidental primary key updates
                if field_name != 'id': 
                    user_data[field_name] = data[key]
                keys_to_remove.append(key)
                
        # Remove the raw flat keys
        for key in keys_to_remove:
            data.pop(key)
            
        # Assign the nested dictionary back to the 'user' key
        if user_data:
            data['user'] = user_data

        serializer = self.get_serializer(instance, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)

        # Return full student data after update so the frontend UI refreshes properly
        response_serializer = StudentSerializer(instance)
        return Response(response_serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Delete student and their associated user account"""
        student = self.get_object()
        user = student.user  
        student.delete()  
        user.delete()  
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        delete_from_bucket("media", instance.profile_pic)
        instance.delete()
