from django.db import models
from datetime import date
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.core.validators import RegexValidator


def event_image_upload_path(instance, filename):
    return f'events/{instance.id}/{filename}'


class RegistrationType(models.TextChoices):
    SINGLE = 'SINGLE'
    TEAM = 'TEAM'


class RegistrationStatus(models.TextChoices):
    PENDING = 'PENDING'
    COMPLETED = 'COMPLETED'
    CANCELLED = 'CANCELLED'


class EventType(models.Model):
    type = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['type']
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
    image = models.CharField(max_length=255, blank=True, null=True)
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
    hosts = ArrayField(
        models.CharField(
            max_length=30,
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


class EventRegistration(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='registrations'
    )

    registration_type = models.CharField(
        max_length=10,
        choices=RegistrationType.choices
    )

    team_name = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=10,
        choices=RegistrationStatus.choices,
        default=RegistrationStatus.PENDING
    )

    def __str__(self):
        return f"{self.event.title} - {self.registration_type}"


class EventParticipant(models.Model):
    registration = models.ForeignKey(
        EventRegistration,
        on_delete=models.CASCADE,
        related_name='participants'
    )

    name = models.CharField(max_length=100)
    email = models.EmailField()
    # reg_no_regex = RegexValidator(
    #     regex=r'^(?:FA|SP)[0-9]{2}-B(?:CS|AI|SE)-[0-9]{3}$',
    #     message='Enter a valid registration number (e.g, FA22-BCS-012).',
    # )
    reg_no = models.CharField(max_length=30)
    current_semester = models.PositiveSmallIntegerField()
    department = models.CharField(max_length=100)
    # phone_regex = RegexValidator(
    #     regex=r'^\+92[0-9]{10}$',
    #     message="Enter a valid Pakistani number in the format +92XXXXXXXXXX.",
    # )
    phone_no = models.CharField(max_length=20)


    def __str__(self):
        return self.name


# NOTE: Only remove this when serializers and views are finished
class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=event_image_upload_path, default=f'{settings.MEDIA_ROOT}/events/default.png',
                              blank=True, null=True)