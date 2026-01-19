from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from api.models import Event, EventImage
from api.permissions import IsLeadOrAdmin, is_staff
from api.serializers import EventSerializer, EventImageEditSerializer
from rest_framework.parsers import MultiPartParser, FormParser



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

# Aroosad edited below
class EventRUDView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /events/<id>/  -> Public
    PUT    /events/<id>/  -> Staff only
    PATCH  /events/<id>/  -> Staff only
    DELETE /events/<id>/  -> Staff only
    """
    queryset = Event.objects.select_related('event_type').prefetch_related('images')
    serializer_class = EventSerializer
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def update(self, request, *args, **kwargs):
        if not is_staff(request.user.role):
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )

        response = super().update(request, *args, **kwargs)

        # Allow adding new images on update
        images = request.FILES.getlist('images')
        for image in images:
            EventImage.objects.create(event=self.get_object(), image=image)

        return response

    def destroy(self, request, *args, **kwargs):
        if not is_staff(request.user.role):
            return Response(
                {"detail": "You do not have permission to perform this action."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class EventImageRUDView(generics.RetrieveUpdateDestroyAPIView):
    """
    Manage a single event image
    """
    serializer_class = EventImageEditSerializer
    permission_classes = [IsLeadOrAdmin]
    lookup_url_kwarg = 'img_pk'

    def get_queryset(self):
        return EventImage.objects.filter(event_id=self.kwargs['pk'])