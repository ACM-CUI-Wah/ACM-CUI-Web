from django.contrib.auth import get_user_model
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import UntypedToken
from api.permissions import SignUpPermission
from api.serializers import StudentSerializer, LoginSerializer, OTPSerializer, PasswordChangeSerializer
from api.utils import get_tokens_for_user, send_otp
from api.utils import send_password

User = get_user_model()
DEFAULT_PASSWORD = '12345'


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
                payload = UntypedToken(token)  # Decode token if it's valid
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
        request.user.auth_token.delete()  # Not JWT
        return Response({
            'status': 'success',
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)
