from rest_framework import generics, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from api.models import Event, EventImage
from api.permissions import IsLeadOrAdmin, is_staff
from api.serializers import EventSerializer, EventImageEditSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse


@extend_schema(
    summary="List and Create Events",
    description="Retrieve a list of events or create a new event (Staff only).",
    responses={
        200: OpenApiResponse(response=EventSerializer(many=True), description="List of events retrieved successfully."),
        201: OpenApiResponse(response=EventSerializer, description="Event created successfully."),
        403: OpenApiResponse(description="Permission denied."),
    }
)
class EventListCreateView(generics.ListCreateAPIView):
    # Optimistic: Assuming event_type will be added.
    # queryset = Event.objects.select_related('event_type').prefetch_related('images')
    queryset = Event.objects.prefetch_related('images')
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "status": "success",
            "message": "Events retrieved successfully",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        # Check if user is authenticated first, then check role
        if not request.user.is_authenticated or not is_staff(request.user.role):
            return Response({
                "status": "error",
                "message": "You do not have permission to perform this action.",
                "data": None
            }, status=status.HTTP_403_FORBIDDEN)

        data = request.data.copy()
        image_list = request.FILES.getlist('images')
        
        # Logic to handle images naturally if serializer expects them in data, 
        # or manual handling if we keep the previous pattern. 
        # The previous pattern manually constructed a list of dicts.
        # We will keep the previous logic but ensure it works with the copy.
        if image_list:
            images = []
            for image in image_list:
                images.append({'image': image})
            data.setlist('images', images)

        # Use the standard create behavior but wrap response
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response({
                "status": "success",
                "message": "Event created successfully",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED, headers=headers)
        
        return Response({
            "status": "error",
            "message": serializer.errors,
            "data": None
        }, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        # We might need manual image handling here if the Serializer doesn't handle it fully
        # explicitly as seen in the previous 'create' method.
        # But looking at EventSerializer.create(), it DOES handle images!
        # "images_data = validated_data.pop('images', None)"
        # So we can trust the serializer.
        serializer.save()


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