from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from api.models import Event, EventImage
from api.permissions import IsLeadOrAdmin, is_staff
from api.serializers import EventSerializer, EventImageEditSerializer


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