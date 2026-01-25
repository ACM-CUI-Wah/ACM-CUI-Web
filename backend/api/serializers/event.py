from rest_framework import serializers
from api.models import Event, EventType


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    event_type = EventTypeSerializer(read_only=True)
    time_from = serializers.TimeField(format='%I:%M %p')
    time_to = serializers.TimeField(format='%I:%M %p')

    class Meta:
        model = Event
        fields = '__all__'


class EventWriteSerializer(serializers.ModelSerializer):
    event_type = serializers.PrimaryKeyRelatedField(
        queryset=EventType.objects.all()
    )
    time_from = serializers.TimeField(format='%I:%M %p')
    time_to = serializers.TimeField(format='%I:%M %p')

    class Meta:
        model = Event
        fields = [
            'id',
            'event_type',
            'title',
            'description',
            'content',
            'date',
            'time_from',
            'time_to',
            'location',
            'image',
            'total_seats',
            'tags',
        ]
        read_only_fields = ['id']