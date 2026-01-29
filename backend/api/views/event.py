from rest_framework import generics
from api.models import Event, EventType, EventRegistration, EventParticipant, RegistrationType, RegistrationStatus
from api.serializers import (
    EventSerializer,
    EventWriteSerializer,
    EventTypeSerializer,
    EventRegistrationCreateSerializer,
    RegistrationStatusUpdateSerializer,
    EventParticipantSerializer,
    EventParticipantReadSerializer,
    EventRegistrationReadSerializer,
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


class RegistrationStatusUpdateView(generics.UpdateAPIView):
    queryset = EventRegistration.objects.all()
    serializer_class = RegistrationStatusUpdateSerializer
    http_method_names = ['patch']


class EventRegistrationListCreateView(generics.ListCreateAPIView):
    queryset = EventRegistration.objects.prefetch_related('participants')

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return EventRegistrationReadSerializer
        return EventRegistrationCreateSerializer

class EventRegistrationDetailView(generics.RetrieveAPIView):
    queryset = EventRegistration.objects.select_related('event').prefetch_related('participants')
    serializer_class = EventRegistrationReadSerializer


class EventRegistrationDeleteView(generics.DestroyAPIView):
    queryset = EventRegistration.objects.all()