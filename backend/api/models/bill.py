from django.db import models
from django.core.validators import MinValueValidator
from datetime import date


def bill_image_upload_path(instance, filename):
    return f'bills/{instance.id}/{filename}'

class Bill(models.Model):
    description = models.TextField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    date = models.DateField(default=date.today)
    image = models.ImageField(upload_to=bill_image_upload_path)

    def save(self, *args, **kwargs):
        if self.id is None:
            saved_image = self.image
            self.image = None
            super(Bill, self).save(*args, **kwargs)
            self.image = saved_image
            if 'force_insert' in kwargs:
                kwargs.pop('force_insert')

        super().save(*args, **kwargs)
