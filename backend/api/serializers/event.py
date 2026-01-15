from rest_framework import serializers
from api.models import Event, EventImage


class EventImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = ['id', 'image']

class EventSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True)
    content = serializers.CharField(required=True)
    images = EventImageSerializer(required=False, many=True)

    class Meta:
        model = Event
        fields = ['id', 'title', 'content', 'images', 'date']
        read_only_fields = ['images']

    def create(self, validated_data):
        images_data = validated_data.pop('images', None)
        event = Event.objects.create(**validated_data)
        if images_data:
            for image in images_data:
                EventImage.objects.create(event=event, **image)
        return event

    def update(self, instance, validated_data):
        image_data = validated_data.pop('images', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # The images should only be added to the existing event when using this serializer
        if image_data:
            for image in image_data:
                EventImage.objects.create(event=instance, image=image)

        instance.save()
        return instance

    # This adds the `images` field to the `validated_data` dict
    def to_internal_value(self, data):
        internal_values = super().to_internal_value(data)
        images = data.getlist('images')
        if images:
            internal_values['images'] = images
        return internal_values

class EventImageEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventImage
        fields = '__all__'
        read_only_fields = ['id', 'event']