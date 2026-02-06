from django.db import models
from datetime import date
from api.models import User
from api.utils import current_time


class AttendanceStatus(models.TextChoices):
    PRESENT = 'PRESENT', 'present'
    ABSENT = 'ABSENT', 'absent'
    LEAVE = 'LEAVE', 'leave'


class Meeting(models.Model):
    date = models.DateField(default=date.today)
    start_time = models.TimeField(default=current_time)  # 12-hour format
    end_time = models.TimeField()
    venue = models.CharField(max_length=50)
    agenda = models.TextField(null=True, blank=True)
    highlights = models.TextField(null=True, blank=True)


class MeetingAttendance(models.Model):
    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name='attendance')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attending_student')
    status = models.CharField(max_length=10, choices=AttendanceStatus.choices)