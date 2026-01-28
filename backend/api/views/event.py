from rest_framework import generics
from api.models import Event, EventType
from api.serializers import (
    EventSerializer,
    EventWriteSerializer,
    EventTypeSerializer
)


class EventListCreateView(generics.ListCreateAPIView):
    queryset = Event.objects.select_related('event_type')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventWriteSerializer
        return EventSerializer


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Event.objects.select_related('event_type')

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventWriteSerializer
        return EventSerializer


class EventTypeListCreateView(generics.ListCreateAPIView):
    queryset = EventType.objects.all()
    serializer_class = EventTypeSerializer