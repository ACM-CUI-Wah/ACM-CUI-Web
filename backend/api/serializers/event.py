from rest_framework import serializers
from api.models import Event, EventType, EventRegistration, EventParticipant, RegistrationType, RegistrationStatus
from django.db import transaction
from api.utils import get_bucket_public_url, upload_file


class EventTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventType
        fields = '__all__'


class EventSerializer(serializers.ModelSerializer):
    event_type = EventTypeSerializer(read_only=True)
    time_from = serializers.TimeField(format='%I:%M %p')
    time_to = serializers.TimeField(format='%I:%M %p')
    registration_count = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = '__all__'

    def get_registration_count(self, obj):
        return obj.registrations.exclude(
            status=RegistrationStatus.CANCELLED
        ).count()

    def get_image(self, obj):
        if not obj.image:
            return None
        return get_bucket_public_url(obj.image)


class EventWriteSerializer(serializers.ModelSerializer):
    event_type = serializers.PrimaryKeyRelatedField(
        queryset=EventType.objects.all()
    )
    time_from = serializers.TimeField(format='%I:%M %p')
    time_to = serializers.TimeField(format='%I:%M %p')

    image = serializers.ImageField(
        write_only=True,
        required=False
    )

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
            'hosts',
        ]
        read_only_fields = ['id']

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        event = Event.objects.create(**validated_data)

        if image:
            event.image = upload_file(image, "events")
            event.save(update_fields=["image"])

        return event

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if image:
            instance.image_path = upload_file(image, "events")

        instance.save()
        return instance


class EventParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventParticipant
        fields = [
            'name',
            'email',
            'reg_no',
            'current_semester',
            'department',
            'phone_no',
        ]


class EventRegistrationCreateSerializer(serializers.ModelSerializer):
    participants = EventParticipantSerializer(many=True, write_only=True)

    class Meta:
        model = EventRegistration
        fields = [
            'event',
            'registration_type',
            'team_name',
            'participants',
        ]

    # For enforcing the total seats/spots limit
    def validate(self, data):
        event = data['event']
        participants = data.get('participants', [])
        reg_type = data['registration_type']

        if event.registrations.count() >= event.total_seats:
            raise serializers.ValidationError(
                "No seats available for this event."
            )

        if reg_type == RegistrationType.SINGLE and len(participants) != 1:
            raise serializers.ValidationError(
                "Single registration must have exactly one participant."
            )

        # NOTE: Not sure if a team will not be allowed to have only one member.
        # if reg_type == RegistrationType.TEAM and len(participants) < 2:
        #     raise serializers.ValidationError(
        #         "Team registration must have at least two participants."
        #     )

        return data

    @transaction.atomic
    def create(self, validated_data):
        participants_data = validated_data.pop('participants')

        registration = EventRegistration.objects.create(**validated_data)

        EventParticipant.objects.bulk_create([
            EventParticipant(
                registration=registration,
                **participant
            )
            for participant in participants_data
        ])

        return registration


class RegistrationStatusUpdateSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=RegistrationStatus.choices)

    class Meta:
        model = EventRegistration
        fields = ['status']


class EventParticipantReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventParticipant
        fields = [
            'id',
            'name',
            'email',
            'reg_no',
            'current_semester',
            'department',
            'phone_no',
        ]
        read_only_fields = fields


class EventRegistrationReadSerializer(serializers.ModelSerializer):
    participants = EventParticipantReadSerializer(many=True, read_only=True)

    class Meta:
        model = EventRegistration
        fields = [
            'id',
            'event',
            'registration_type',
            'team_name',
            'status',
            'participants',
        ]
        read_only_fields = fields
