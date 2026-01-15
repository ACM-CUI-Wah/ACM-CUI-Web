from django.db import models
from datetime import date
from django.conf import settings


def event_image_upload_path(instance, filename):
    return f'events/{instance.id}/{filename}'


class Event(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    date = models.DateField(default=date.today)


class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=event_image_upload_path, default=f'{settings.MEDIA_ROOT}/events/default.png',
                              blank=True, null=True)