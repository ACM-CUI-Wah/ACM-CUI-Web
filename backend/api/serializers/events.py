from rest_framework import serializers
from api.models import Event, EventType, EventImage
from django.utils import timezone

class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = ['id', 'type']
        read_only_fields = ['id']

class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ['id', 'image']

class EventSerializer(serializers.ModelSerializer):
    event_type = EventTypeSerializer(read_only=True)
    event_type_id = serializers.PrimaryKeyRelatedField(
        queryset=EventType.objects.all(),
        source='event_type',
        write_only=True
    )
    images = EventImageSerializer(many=True, read_only=True)
    agenda = serializers.JSONField(required=False, allow_null=True)
    class Meta:
        model = Event
        fields = ['id','event_type','event_type_id','title','description','content','date','time','location','agenda','images','total_seats']
        read_only_fields = ['id', 'images']
    
    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()
    
    def validate_agenda(self, value):
        if value is None:
            return value
        
        if not isinstance(value, list):
            raise serializers.ValidationError(
                "Agenda must be a list of objects with 'time' and 'purpose' fields."
            )
        
        for item in value:
            if not isinstance(item, dict):
                raise serializers.ValidationError("Each agenda item must be an object.")
            
            if 'time' not in item or 'purpose' not in item:
                raise serializers.ValidationError(
                    "Each agenda item must include both 'time' and 'purpose' fields."
                )
        
        return value
    def create(self, validated_data):
        if 'date' not in validated_data or validated_data['date'] is None:
            validated_data['date'] = timezone.now().date()
        if 'time' not in validated_data or validated_data['time'] is None:
            validated_data['time'] = timezone.now().time()
        event = Event.objects.create(**validated_data)
        return event
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class EventListSerializer(serializers.ModelSerializer):
    event_type_name = serializers.CharField(source='event_type.type', read_only=True)
    class Meta:
        model = Event
        fields = ['id','event_type_name','title','description','date','time','location','total_seats']
        read_only_fields = fields