from django.db import models
from django.core.validators import MinValueValidator
from datetime import date


def bill_image_upload_path(instance, filename):
    return f'bills/{instance.id}/{filename}'

class Bill(models.Model):
    description = models.TextField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    date = models.DateField(default=date.today)
    image = models.CharField(max_length=255)
