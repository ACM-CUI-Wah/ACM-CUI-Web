from datetime import datetime
from io import BytesIO

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from .permissions import IsLead, IsAdmin, IsAdminOrReadOnly, IsLeadOrAdmin, is_staff, IsTreasurer, SignUpPermission
from .serializers import StudentSerializer, LoginSerializer, OTPSerializer, PasswordChangeSerializer, MeetingSerializer, \
    MeetingAttendanceSerializer, StudentListSerializer, EventSerializer, EventImageEditSerializer, AdminSerializer, PublicStudentSerializer, \
    BillSerializer, BlogSerializer, BlogUploadSerializer, BlogUpdateSerializer, InlineImageSerializer, ProfileUpdateSerializer
from drf_spectacular.utils import OpenApiResponse, extend_schema, OpenApiParameter, OpenApiExample, extend_schema_view
from drf_spectacular.types import OpenApiTypes
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import TokenError
from django.db import transaction
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from rest_framework import generics
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, schema
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bill
from .models import Blog, Meeting, MeetingAttendance, Student, Event, EventImage
from .utils import get_tokens_for_user, send_otp
from .utils import send_password

User = get_user_model()
DEFAULT_PASSWORD = '12345'

@api_view(['GET', 'POST'])
@schema(None)
def api_home(request):
    if request.method == 'POST':
        return Response({
            'message': 'Server is online. API functional.',
            'data': request.data
        })
    return Response({"message": "Server is online. API functional."})


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

@extend_schema(
    request=StudentSerializer,
    responses={
        201: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "success"},
                    "message": {"type": "string", "example": "User registered successfully"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "token": {"type": "string"},
                            "user_id": {"type": "integer"},
                            "username": {"type": "string"},
                            "email": {"type": "string"},
                            "role": {"type": "string"},
                            "club": {"type": "string"},
                            "roll_number": {"type": "string"},
                        }
                    }
                }
            },
            description="User created successfully"
        ),
        400: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "error"},
                    "message": {"type": "object", "example": {"email": ["Email already exists"]}},
                    "data": {"type": "null"}
                }
            },
            description="Validation error"
        ),
        403: OpenApiResponse(description="Forbidden - user does not have Lead permissions"),
    },
    description='Handles student registration using a nested serializer.\nOnly users with the \'Lead\' role are allowed to access this endpoint.'
)
class SignupView(APIView):
    serializer_class = StudentSerializer
    permission_classes = [SignUpPermission]

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            student = serializer.save()
            user = student.user
            token, _ = Token.objects.get_or_create(user=user)
            response_data = {
                "status": "success",
                "message": "User registered successfully",
                "data": {
                    "token": token.key,
                    "user_id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "club": student.club,
                    "roll_number": student.roll_no,
                    "title": student.title,
                }
            }
            send_password(destination=user.email, username=user.username, password=DEFAULT_PASSWORD)
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': serializer.errors,
            'data': None
        }, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    request=LoginSerializer,
    responses={
        200: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "success"},
                    "message": {"type": "string", "example": "Login successful"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "token": {"type": "string", "example": "a1b2c3d4e5f6"},
                            "user_id": {"type": "integer", "example": 42},
                            "role": {"type": "string", "example": "LEAD"}
                        }
                    }
                }
            },
            description="Login successful"
        ),
        400: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "error"},
                    "message": {
                        "type": "object",
                        "example": {"non_field_errors": ["Invalid username or password"]}
                    },
                    "data": {"type": "null"}
                }
            },
            description="Invalid credentials"
        ),
    },
    description='Authenticates a user and returns an auth token.'
)
class LoginView(APIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=False):
            user = serializer.validated_data['user']
            token, _ = Token.objects.get_or_create(user=user)

            # Safely get student_id (None if user has no student)
            student = getattr(user, "student", None)
            student_id = student.id if student else None

            return Response({
                "status": "success",
                "message": "Login successful",
                "data": {
                    "token": token.key,
                    "user_id": user.id,
                    "role": user.role,
                    "student_id": student_id
                }
            }, status=status.HTTP_200_OK)

        return Response({
            'status': 'error',
            'message': serializer.errors,
            'data': None
        }, status=status.HTTP_400_BAD_REQUEST)

@extend_schema(
    request=OTPSerializer,
    responses={
        200: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "token": {
                        "type": "object",
                        "properties": {
                            "refresh": {"type": "string", "example": "eyJ0eXAiOiJKV1QiLC..."},
                            "access": {"type": "string", "example": "eyJ0eXAiOiJKV1QiLC..."},
                            "id": {"type": "integer", "example": 1},
                            "email": {"type": "string", "example": "user@example.com"},
                            "otp": {"type": "string", "example": "1234"}
                        }
                    }
                }
            },
            description="OTP generated and returned with token"
        ),
        400: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "errors": {
                        "type": "object",
                        "example": {
                            "email": ["This field is required."]
                        }
                    }
                }
            },
            description="Validation failed"
        ),
    },
    description=(
        "Generates a One-Time Password (OTP) for the provided email address. "
        "If the email is valid and belongs to an existing user, the API returns "
        "a JWT token set (access & refresh), along with the user's ID, email, "
        "and the generated OTP. The OTP is intended for verification purposes "
        "and should be treated as sensitive information."
    ),
)
class OTPView(APIView):
    permission_classes = [AllowAny]
    serializer_class = OTPSerializer

    User = get_user_model()

    def post(self, request):
        import random
        otp = random.randint(1000, 9999)
        data = request.data
        serializer = self.serializer_class(data=data)
        if serializer.is_valid(raise_exception=False):
            send_otp(data['email'], otp=otp)
            user = User.objects.get(email=data['email'])
            token = get_tokens_for_user(user, otp=str(otp))
            response_data = {
                'token': token
            }
            return Response(data=response_data, status=status.HTTP_200_OK)
        return Response({
            'errors': serializer.errors
        }, status.HTTP_400_BAD_REQUEST)

@extend_schema(
    request=PasswordChangeSerializer,
    responses={
        200: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "success"},
                    "message": {"type": "string", "example": "Password has been updated."}
                }
            },
            description="Password updated successfully."
        ),
        400: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "errors": {
                        "type": "object",
                        "example": {
                            "token": "Token is invalid"
                        }
                    }
                }
            },
            description="Invalid token or validation error."
        )
    },
    description=(
        "Resets the user's password using a valid JWT token.\n\n"
        "The API user must send a valid `token` obtained from `api/auth/otp` "
        "and the new password."
    ),
)
class PasswordChangeView(APIView):
    serializer_class = PasswordChangeSerializer

    def put(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=False):
            user_obj = get_user_model()
            token = serializer.validated_data.get('token')
            password = serializer.validated_data.get('password')
            try:
                payload = UntypedToken(token) # Decode token if it's valid
            except TokenError:
                return Response({
                    'errors': {
                        'token': 'Token is invalid'
                    }
                }, status=status.HTTP_400_BAD_REQUEST)
            user_id = payload['user_id']
            user = user_obj.objects.get(pk=user_id)
            user.set_password(password)
            user.save()
            return Response({
                'status': 'success',
                'message': 'Password has been updated.'
            }, status=status.HTTP_200_OK)
        return Response({
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    request=None,
    responses={
        200: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "status": {"type": "string", "example": "success"},
                    "message": {"type": "string", "example": "Logged out successfully"}
                }
            },
            description="User logged out successfully."
        ),
        401: OpenApiResponse(
            response={
                "type": "object",
                "properties": {
                    "detail": {"type": "string", "example": "Authentication credentials were not provided."}
                }
            },
            description="User is not authenticated."
        ),
    },
    description=(
        "Logs out the currently authenticated user by deleting their auth token "
        "(this view is **not** for JWT-based authentication)"
    ),
)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete() # Not JWT
        return Response({
            'status': 'success',
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
    
    
class InlineImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = InlineImageSerializer(data=request.data)
        if serializer.is_valid():
            image = serializer.save()
            image_url = request.build_absolute_uri(image.image.url)
            return Response({"url": image_url}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      
      
@extend_schema(
    summary="Upload a new blog post with images",
    description=(
        "Creates a new blog post. Only authenticated users can create blogs.\n\n"
        "The request accepts `title`, `content`, and one or more `images`. "
        "Images must be uploaded as multipart form data."
    ),
    request={
        "multipart/form-data": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "example": "My First Blog Post"},
                "content": {"type": "string", "example": "This is the content of the blog post."},
                "images": {
                    "type": "array",
                    "items": {"type": "string", "format": "binary"},
                    "description": "One or more images to attach to the blog post"
                },
            },
            "required": ["title", "content"]
        }
    },
    responses={
        201: OpenApiResponse(
            response=BlogSerializer,
            description="Blog post created successfully.",
            examples=[
                OpenApiExample(
                    "Success Example",
                    value={
                        "status": "success",
                        "message": "Blog post created successfully",
                        "data": {
                            "id": 1,
                            "title": "My First Blog Post",
                            "content": "This is the content of the blog post.",
                            "images": [
                                "http://localhost:8000/media/blog_images/img1.jpg",
                                "http://localhost:8000/media/blog_images/img2.jpg"
                            ],
                            "created_at": "2025-08-27T12:34:56Z",
                            "author": {"id": 5, "username": "john_doe"}
                        }
                    }
                )
            ]
        ),
        400: OpenApiResponse(
            description="Validation error - invalid input",
            examples=[
                OpenApiExample(
                    "Error Example",
                    value={
                        "status": "error",
                        "message": {
                            "title": ["This field is required."],
                            "images": ["Invalid file type."]
                        },
                        "data": None
                    }
                )
            ]
        ),
    }
)
class BlogUploadView(APIView):
    """
    API endpoint to upload a new blog post with one or more images.

    Permissions:
        - Only authenticated users can create a blog post.

    Parsers:
        - MultiPartParser and FormParser to handle file uploads.

    Behavior:
        - Accepts 'title', 'content', and 'images' via POST request.
        - Normalizes single or multiple image uploads into a list.
        - Validates images for type and size using BlogUploadSerializer.
        - Creates a Blog instance and related BlogImage instances atomically.
        - Returns serialized blog data including absolute image URLs on success.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        """
        Handle POST requests to create a new blog post with images.

        Steps:
            1. Normalize 'images' from request.FILES to a list (single or multiple files).
            2. Populate a mutable QueryDict with request data and the normalized images.
            3. Validate and save data using BlogUploadSerializer.
            4. Return a structured JSON response with serialized blog data on success,
               or errors on failure.

        Returns:
            Response: DRF Response object with status, message, and data keys.
        """
        # 1) Normalize "images" to a list for both single/multi uploads
        data = request.data.copy()
        files = request.FILES.getlist('images')
        if not files and 'images' in request.FILES:
            files = [request.FILES['images']]  # single -> list
        if files:
            data.setlist('images', files)
        serializer = BlogUploadSerializer(data=data, context={"request": request})

        if serializer.is_valid():
            with transaction.atomic():  # Ensures all-or-nothing save
                blog = serializer.save()  # No manual image creation here

            resp = BlogSerializer(blog, context={"request": request})
            return Response({
                "status": "success",
                "message": "Blog post created successfully",
                "data": resp.data
            }, status=status.HTTP_201_CREATED)

        return Response({
            "status": "error",
            "message": serializer.errors,
            "data": None
        }, status=status.HTTP_400_BAD_REQUEST)
        

@extend_schema(
    summary="List blog posts",
    description=(
        "Retrieve a list of blog posts.\n\n"
        "- **limit** (optional, int): Restrict the number of blog posts returned.\n"
        "- **student_id** (optional, int): Filter blog posts by the ID of the student who created them.\n\n"
        "Returns all blog posts by default, ordered by creation date (newest first). "
        "If `student_id` is provided, only posts from that student are included. "
        "If `limit` is provided, restricts the number of results."
    ),
    parameters=[
        OpenApiParameter(
            name="limit",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            required=False,
            description="Restrict the number of blog posts returned."
        ),
        OpenApiParameter(
            name="student_id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            required=False,
            description="Filter blog posts by the ID of the student who created them."
        ),
    ],
    responses={
        200: OpenApiResponse(
            response=BlogSerializer(many=True),
            description="List of blog posts retrieved successfully."
        ),
        400: OpenApiResponse(description="Bad request. Invalid query parameter."),
        403: OpenApiResponse(description="Permission denied."),
    }
)
class BlogListAPIView(generics.ListAPIView):
    serializer_class = BlogSerializer

    def get_queryset(self):
        queryset = Blog.objects.all().order_by('-createdAt')

        student_id = self.request.query_params.get('student_id')
        if student_id:
            queryset = queryset.filter(createdBy__id=student_id)

        limit = self.request.query_params.get('limit')
        if limit and limit.isdigit():
            queryset = queryset[:int(limit)]

        return queryset

@extend_schema(
    summary="Edit a blog post",
    description=(
        "Allows authenticated users (author/lead/admin) to edit an existing blog post. "
        "Editing permissions are enforced on the frontend side. "
        "Supports updating text fields (title, content) and optionally replacing images."
    ),
    request=BlogUpdateSerializer,
    responses={
        200: OpenApiResponse(
            response=BlogSerializer,
            description="Blog post updated successfully",
            examples=[
                OpenApiExample(
                    "Successful Update",
                    value={
                        "status": "success",
                        "message": "Blog post updated successfully",
                        "data": {
                            "id": 1,
                            "title": "Updated Blog Title",
                            "content": "Updated content here...",
                            "images": [
                                "http://example.com/media/blogs/updated_image1.jpg"
                            ],
                            "createdAt": "2025-08-27T12:34:56Z",
                            "createdBy": {"id": 5, "username": "student123"},
                        }
                    },
                )
            ],
        ),
        400: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description="Validation error",
            examples=[
                OpenApiExample(
                    "Validation Error",
                    value={
                        "status": "error",
                        "message": {"title": ["This field is required."]},
                        "data": None,
                    },
                )
            ],
        ),
        404: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description="Blog post not found",
            examples=[
                OpenApiExample(
                    "Not Found",
                    value={
                        "status": "error",
                        "message": "Blog post not found",
                        "data": None,
                    },
                )
            ],
        ),
    },
    examples=[
        OpenApiExample(
            "Update Blog Example",
            value={
                "title": "New Blog Title",
                "content": "Updated blog content...",
                "images": ["(binary image file)"]
            },
            request_only=True,
            media_type="multipart/form-data",
        )
    ],
)


class InlineImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = InlineImageSerializer(data=request.data)
        if serializer.is_valid():
            image = serializer.save()
            image_url = request.build_absolute_uri(image.image.url)
            return Response({"url": image_url}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      
      
class BlogEditView(APIView):
    permission_classes = [IsAuthenticated,IsAdmin]
    parser_classes = [MultiPartParser, FormParser]

    def put(self, request, pk, *args, **kwargs):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Blog post not found",
                "data": None
            }, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        files = request.FILES.getlist('images')
        if files:
            data.setlist('images', files)

        serializer = BlogUpdateSerializer(blog, data=data, partial=True, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            resp = BlogSerializer(blog, context={"request": request})
            return Response({
                "status": "success",
                "message": "Blog post updated successfully",
                "data": resp.data
            }, status=status.HTTP_200_OK)

        return Response({
            "status": "error",
            "message": serializer.errors,
            "data": None
        }, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Delete a blog post",
    description=(
        "Allows only admins to delete a blog post. "
        "If the blog does not exist, a 404 error is returned."
    ),
    request=None,
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description="Blog post deleted successfully",
            examples=[
                OpenApiExample(
                    "Successful Deletion",
                    value={
                        "status": "success",
                        "message": "Blog post deleted successfully",
                        "data": None,
                    },
                )
            ],
        ),
        404: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description="Blog post not found",
            examples=[
                OpenApiExample(
                    "Not Found",
                    value={
                        "status": "error",
                        "message": "Blog post not found",
                        "data": None,
                    },
                )
            ],
        ),
    },
)
class BlogDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, pk, *args, **kwargs):
        try:
            blog = Blog.objects.get(pk=pk)
        except Blog.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Blog post not found",
                "data": None
            }, status=status.HTTP_404_NOT_FOUND)

        blog.delete()
        return Response({
            "status": "success",
            "message": "Blog post deleted successfully",
            "data": None
        }, status=status.HTTP_200_OK)

class MeetingCreateView(APIView):
    serializer_class = MeetingSerializer
    permission_classes = [IsLeadOrAdmin]

    def post(self, request, *args, **kwargs):
        data = request.data
        try:
            attendance_data = data.pop('attendance')
        except KeyError:
            return Response({
                'status': 'error',
                'message': {
                    'attendance': 'This field is required.'
                },
                'data': None
            }, status.HTTP_400_BAD_REQUEST)
        meeting_serializer = self.serializer_class(data=data)
        if meeting_serializer.is_valid():
            meeting = meeting_serializer.save()
            for att in attendance_data:
                att['meeting'] = meeting.id
            attendance_serializer = MeetingAttendanceSerializer(many=True, data=attendance_data)
            if attendance_serializer.is_valid():
                attendance_serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Data created',
                    'data': None
                }, status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': meeting_serializer.errors,
            'data': None
        }, status.HTTP_400_BAD_REQUEST)

class MeetingListView(generics.ListAPIView):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [IsLeadOrAdmin]

class MeetingRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [IsLeadOrAdmin]

class MeetingAttendanceListView(generics.ListAPIView):
    serializer_class = MeetingAttendanceSerializer
    permission_classes = [IsLeadOrAdmin]
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        if self.request.user.role == 'LEAD':
            club = self.request.user.student.club
            return MeetingAttendance.objects.filter(user__student__club=club)
        return MeetingAttendance.objects.all()

class MeetingAttendanceRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MeetingAttendance.objects.all()
    serializer_class = MeetingAttendanceSerializer
    permission_classes = [IsLeadOrAdmin]
    lookup_url_kwarg = 'att_pk'

class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.prefetch_related('images')
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        if not is_staff(request.user.role):
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)
        data = request.data
        image_list = request.FILES.getlist('images')
        images = []
        for image in image_list:
            images.append({
                'image': image,
            })
        data.setlist('images', images)
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        data = serializer.data
        return Response(data, status=status.HTTP_201_CREATED)


class EventRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.prefetch_related('images')
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        if not is_staff(request.user.role):
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not is_staff(request.user.role):
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if not is_staff(request.user.role):
            return Response(data=None, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


class EventImageRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EventImage.objects.all()
    serializer_class = EventImageEditSerializer
    permission_classes = [IsLeadOrAdmin]
    lookup_url_kwarg = 'img_pk'

    def get_queryset(self):
        return EventImage.objects.filter(event_id=self.kwargs['pk'])

class MeetingPDFView(APIView):
    
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsLeadOrAdmin]
    
    def get(self, request, pk, *args, **kwargs):
        try:
            meeting = Meeting.objects.get(pk=pk)
            
            if request.user.role == 'LEAD':
                if hasattr(request.user, 'student'):
                    club = request.user.student.club
                    attendance = MeetingAttendance.objects.filter(
                        meeting=meeting,
                        user__student__club=club
                    ).select_related('user')
                else:
                    attendance = MeetingAttendance.objects.none()
            else:
                attendance = MeetingAttendance.objects.filter(
                    meeting=meeting
                ).select_related('user')
                
        except Meeting.DoesNotExist:
            return Response({
                "status": "error",
                "message": "Meeting not found",
                "data": None
            }, status=status.HTTP_404_NOT_FOUND)
        
        
        buffer = BytesIO()
        
        
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=72, leftMargin=72,
                                topMargin=120, bottomMargin=18)
        
        
        elements = []
        
        
        styles = getSampleStyleSheet()
        
        
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            spaceAfter=20,
            alignment=1,
            textColor=colors.HexColor('#2c3e50')
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            spaceAfter=10,
            textColor=colors.HexColor('#34495e')
        )
        
        normal_style = ParagraphStyle(
            'BodyText',
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#2c3e50')
        )
        
        
        def convert_to_12h(time_obj):
            if time_obj:
                return time_obj.strftime('%I:%M %p')
            return "N/A"
        
        start_time_12h = convert_to_12h(meeting.start_time)
        end_time_12h = convert_to_12h(meeting.end_time)
        
        elements.append(Paragraph("Minutes of ACM Meeting", title_style))
        elements.append(Spacer(1, 0.1*inch))
        

        if request.user.role != 'ADMIN':
            club_name = request.user.student.club.replace('_', ' ').title()
            club_style = ParagraphStyle(
                'ClubStyle',
                parent=styles['Heading2'],
                fontSize=14,
                spaceAfter=10,
                alignment=1,
                textColor=colors.HexColor('#2c3e50'),
                fontName='Helvetica-Bold'
            )
            elements.append(Paragraph(f"{club_name} Meeting Minutes", club_style))
            elements.append(Spacer(1, 0.1*inch))



        meeting_data = [
            ["Date:", str(meeting.date)],
            ["Time:", f"{start_time_12h} - {end_time_12h}"],
            ["Venue:", meeting.venue],
            ["Agenda:", meeting.agenda or "Not specified"],
            ["Highlights:", meeting.highlights or "Not specified"]
        ]
        
        meeting_table = Table(meeting_data, colWidths=[1.5*inch, 4*inch])
        meeting_table.setStyle(TableStyle([
            ('FONT', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2c3e50')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ]))
        elements.append(meeting_table)
        elements.append(Spacer(1, 0.25*inch))
        
        
        elements.append(Paragraph("Attendance Record", heading_style))
        elements.append(Spacer(1, 0.1*inch))
        
        
        attendance_data = [["Name", "Roll No", "Status"]]
        for record in attendance:
            try:
                student = record.user.student
                roll_no = student.roll_no
            except:
                roll_no = "N/A"
            
            attendance_data.append([
                f"{record.user.first_name} {record.user.last_name}",
                roll_no,
                record.status
            ])
        
        
        if len(attendance_data) > 1:
            attendance_table = Table(attendance_data, colWidths=[2.5*inch, 1.5*inch, 1*inch])
            attendance_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dee2e6')),
            ]))
            elements.append(attendance_table)
        else:
            elements.append(Paragraph("No attendance records found.", normal_style))
        
        
        elements.append(Spacer(1, 0.25*inch))
        present_count = attendance.filter(status='PRESENT').count()
        absent_count = attendance.filter(status='ABSENT').count()
        leave_count = attendance.filter(status='LEAVE').count()
        
        summary_text = f"<b>Summary:</b> Present: {present_count}, Absent: {absent_count}, Leave: {leave_count}, Total: {attendance.count()}"
        elements.append(Paragraph(summary_text, normal_style))
        
    
        elements.append(Spacer(1, 0.5*inch))
        generated_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        footer_style = ParagraphStyle(
            name='Footer',
            fontName='Helvetica-Oblique',
            fontSize=8,
            textColor=colors.HexColor('#7f8c8d'),
            alignment=1
        )
        elements.append(Paragraph(f"Generated on: {generated_date}", footer_style))
        
        
        def add_header(canvas, doc):
            canvas.saveState()
            
            
            canvas.setFillColor(colors.HexColor("#FFFFFF"))
            canvas.rect(0, doc.pagesize[1] - 1.2*inch, doc.pagesize[0], 1.2*inch, fill=1, stroke=0)
            
            
            import os
            from django.conf import settings
            logo_path = os.path.join(settings.BASE_DIR, 'assets', 'acm_logo.png')
            
            if os.path.exists(logo_path):
                try:
    
                    logo_x = 1 * inch
                    logo_y = doc.pagesize[1] - 1.1 * inch
                    logo_size = 1 * inch
                    
                    canvas.drawImage(logo_path, logo_x, logo_y, 
                                    width=logo_size, height=logo_size, preserveAspectRatio=True)
                except Exception as e:
                    print(f"Error adding logo: {e}")
            
            
            logo_width = 0.8 * inch if os.path.exists(logo_path) else 0
            text_start_x = logo_x + logo_width + 0.2 * inch
            
            
            canvas.setFillColor(colors.black)
            canvas.setFont('Helvetica-Bold', 16)
            main_text = "ASSOCIATION FOR COMPUTING MACHINERY"
            canvas.drawString(text_start_x, doc.pagesize[1] - 0.6*inch, main_text)
            
            
            canvas.setFont('Helvetica', 10)
            sub_text = "COMSATS University Islamabad, Wah Chapter"
            canvas.drawString(text_start_x+ 0.9*inch, doc.pagesize[1] - 0.8*inch, sub_text)
            
            
            canvas.setStrokeColor(colors.HexColor("#000000"))
            canvas.setLineWidth(1.5)
            canvas.line(0.5*inch, doc.pagesize[1] - 1.2*inch, 
                       doc.pagesize[0] - 0.5*inch, doc.pagesize[1] - 1.2*inch)
            
            canvas.restoreState()
        
    
        doc.build(elements, onFirstPage=add_header)
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="acm_meeting_minutes_{meeting.date}.pdf"'
        
        return response



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


class BillListCreateView(generics.ListCreateAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsTreasurer]


class BillRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer
    permission_classes = [IsTreasurer]