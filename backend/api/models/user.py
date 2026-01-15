from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator


class UserRole(models.TextChoices):
    STUDENT = "STUDENT", "student"
    LEAD = "LEAD", "lead"
    ADMIN = "ADMIN", "admin"



class User(AbstractUser):
    """
    Custom user model extending Django's built-in AbstractUser.
    Includes additional fields and a user role selector.
    """
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=UserRole.choices)
    username = models.CharField(max_length=150, unique=True)
    phone_regex = RegexValidator(
        regex=r'\+92[0-9]{10}$',
        message="Enter a valid Pakistani number in the format +92XXXXXXXXXX."
    )
    phone_number = models.CharField(
        validators=[phone_regex],
        max_length=13,
        unique=True
    )

    # def save(self, *args, **kwargs):
    #     if self.phone_number.startswith('0'):
    #         self.phone_number = '+92' + self.phone_number[1:]
    #     super().save(*args, **kwargs)

    REQUIRED_FIELDS = ['email', 'first_name', 'last_name']
    USERNAME_FIELD = 'username'


class Student(models.Model):
    """
    Model representing a student. Inherits from User using OneToOne relationship.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student')
    roll_no = models.CharField(max_length=20, default="")
    club = models.CharField(max_length=50)
    title = models.CharField(max_length=30, null=True, blank=True) # Designation in the ACM hierarchy structure
    profile_pic = models.ImageField(upload_to='profile_pics/', default='profile_pics/default.jpg')
    profile_desc = models.TextField(max_length=200, null=True, blank=True)
