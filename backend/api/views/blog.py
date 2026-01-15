from django.db import transaction
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema, OpenApiParameter, OpenApiExample
from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.models import Blog
from api.permissions import IsAdmin
from api.serializers import BlogSerializer, BlogUploadSerializer, BlogUpdateSerializer, InlineImageSerializer


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
    permission_classes = [IsAuthenticated, IsAdmin]
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
