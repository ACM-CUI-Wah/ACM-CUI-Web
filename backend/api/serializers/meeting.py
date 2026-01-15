from rest_framework import serializers
from api.models import Meeting, MeetingAttendance

class MeetingAttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingAttendance
        fields = '__all__'


class MeetingSerializer(serializers.ModelSerializer):
    start_time = serializers.TimeField(format='%I:%M %p')
    end_time = serializers.TimeField(format='%I:%M %p')

    class Meta:
        model = Meeting
        fields = '__all__'
