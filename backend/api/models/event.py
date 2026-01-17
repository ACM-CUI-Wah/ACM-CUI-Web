from django.db import models
from datetime import date
from django.utils import timezone
from django.conf import settings


def event_image_upload_path(instance, filename):
    return f'events/{instance.id}/{filename}'

#Event Type Model to categrize Events
class EventType(models.Model):

    type = models.CharField(max_length=50, unique=True)

    class Meta: # Rueles abt data
        ordering =['type']
        verbose_name = 'Event Type'
        verbose_name_plural = 'Event Types'

    def __str__(self):
        return self.type

class Event(models.Model):
    
    event_type = models.ForeignKey(EventType, on_delete=models.PROTECT, related_name='events')

    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500)
    content = models.TextField()
    date = models.DateField(default=date.today)
    time = models.TimeField(default=timezone.now)
    location = models.CharField(max_length=200, blank=True)

    agenda = models.JSONField(
        default=list,
        blank=True,
        help_text="List of {'time': 'HH:MM', 'purpose': 'text'} objects"
    )

    total_seats = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-date', '-time']
        indexes = [
            models.Index(fields=['date', 'time']),
            models.Index(fields=['event_type']),
        ]

    def __str__(self):
        return self.title



class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=event_image_upload_path, default=f'{settings.MEDIA_ROOT}/events/default.png',
                              blank=True, null=True)