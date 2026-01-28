from django.db import models
from datetime import date
from django.conf import settings
from django.contrib.postgres.fields import ArrayField


def event_image_upload_path(instance, filename):
    return f'events/{instance.id}/{filename}'

class EventType(models.Model):

    type = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering =['type']
        verbose_name = 'Event Type'
        verbose_name_plural = 'Event Types'

    def save(self, *args, **kwargs):
        if self.type:
            self.type = self.type.upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.type

class Event(models.Model):
    
    event_type = models.ForeignKey(EventType, on_delete=models.PROTECT, related_name='events', null=True)

    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500, default="")
    content = models.TextField()
    date = models.DateField(default=date.today)
    time_from = models.TimeField()
    time_to = models.TimeField()
    location = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to='events/', default=f'{settings.MEDIA_ROOT}/events/default.png', blank=True, null=True)
    total_seats = models.PositiveIntegerField(default=0)
    tags = ArrayField(
        models.CharField(
            max_length=25,
            blank=True,
            default=list,
        ),
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['event_type']),
        ]

    def __str__(self):
        return self.title

# NOTE: Only remove this when serializers and views are finished
class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=event_image_upload_path, default=f'{settings.MEDIA_ROOT}/events/default.png',
                              blank=True, null=True)