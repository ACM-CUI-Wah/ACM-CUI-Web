from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator, EmailValidator
from datetime import date

#  ENUMS/CHOICES 
class ApplicationStatus(models.TextChoices):
    UNDER_REVIEW = "UNDER_REVIEW", "Under Review"
    ACCEPTED = "ACCEPTED", "Accepted"
    REJECTED = "REJECTED", "Rejected"
    INTERVIEWS = "INTERVIEWS", "Interviews"
class Program(models.TextChoices):
    BSCS = "BSCS", "BSCS"
    BSSE = "BSSE", "BSSE"
    BSAI = "BSAI", "BSAI"
class Role(models.TextChoices):
    CODEHUB = "CODEHUB", "CodeHub"
    GRAPHICS_MEDIA = "GRAPHICS_MEDIA", "Graphics & Media"
    SOCIAL_MEDIA_MARKETING = "SOCIAL_MEDIA_MARKETING", "Social Media and Marketing"
    REGISTRATION_DECOR = "REGISTRATION_DECOR", "Registration & Decor"
    EVENTS_LOGISTICS = "EVENTS_LOGISTICS", "Events & Logistics"

#  RECRUITMENT SESSION MODEL 
class RecruitmentSession(models.Model):
    uni_session_regex = RegexValidator(
        regex=r'^(FA|SP)\d{2}$',
        message="uni_session must start with 'FA' or 'SP' followed by 2 digits (e.g., FA24, SP25)."
    )
    uni_session = models.CharField(
        max_length=4,
        unique=True,
        validators=[uni_session_regex],
        help_text="Format: FAXX or SPXX (e.g., FA24, SP25)"
    )
    application_start = models.DateField()
    application_end = models.DateField()
    interview_start = models.DateField()
    interview_end = models.DateField()
    result_date = models.DateField()
    class Meta:
        ordering = ['-application_start']
        verbose_name = "Recruitment Session"
        verbose_name_plural = "Recruitment Sessions"
    def __str__(self):
        return f"{self.uni_session} - {self.application_start} to {self.result_date}"

    def clean(self):
        errors = {}
        if self.application_end and self.application_start:
            if self.application_end < self.application_start:
                errors['application_end'] = "Application end date cannot be before application start date."
        if self.interview_start and self.application_end:
            if self.interview_start < self.application_end:
                errors['interview_start'] = "Interview start date must be on or after application end date."
        if self.interview_end and self.interview_start:
            if self.interview_end < self.interview_start:
                errors['interview_end'] = "Interview end date cannot be before interview start date."
        if self.result_date and self.interview_end:
            if self.result_date < self.interview_end:
                errors['result_date'] = "Result date must be on or after interview end date."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

# RECRUITMENT APPLICATIONS MODEL

class RecruitmentApplications(models.Model):
    recruitment_session = models.ForeignKey(
        RecruitmentSession,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.UNDER_REVIEW
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ['-submitted_at']
        verbose_name = "Recruitment Application"
        verbose_name_plural = "Recruitment Applications"

    def __str__(self):
        return f"Application #{self.id} - {self.recruitment_session.uni_session} - {self.status}"

#PERSONAL INFO MODEL 

class PersonalInfo(models.Model):
    application = models.OneToOneField(
        RecruitmentApplications,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='personal_info'
    )
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(
        validators=[EmailValidator()],
        help_text="Valid email address required"
    )
    phone_regex = RegexValidator(
        regex=r'^\+92[0-9]{10}$',
        message="Enter a valid Pakistani number in the format +92XXXXXXXXXX."
    )
    phone_number = models.CharField(
        max_length=13,
        validators=[phone_regex]
    )
    class Meta:
        verbose_name = "Personal Information"
        verbose_name_plural = "Personal Information"

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.email}"


# ACADEMIC INFO MODEL 

class AcademicInfo(models.Model):
    application = models.OneToOneField(
        RecruitmentApplications,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='academic_info'
    )
    reg_no = models.CharField(
        max_length=20,
        help_text="Student registration number"
    )
    current_semester = models.IntegerField(
        help_text="Current semester number (e.g., 1, 2, 3...)"
    )
    program = models.CharField(
        max_length=10,
        choices=Program.choices
    )
    skills = models.JSONField(
        default=list,
        help_text="List of skills (stored as JSON array)"
    )
    relevant_coursework = models.JSONField(
        default=list,
        help_text="List of relevant courses (stored as JSON array)"
    )
    class Meta:
        verbose_name = "Academic Information"
        verbose_name_plural = "Academic Information"
    def __str__(self):
        return f"{self.reg_no} - {self.program} - Semester {self.current_semester}"
# ROLE PREFERENCES MODEL 

class RolePreferences(models.Model):
    application = models.OneToOneField(
        RecruitmentApplications,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='role_preferences'
    )
    preferred_role = models.CharField(
        max_length=30,
        choices=Role.choices
    )
    secondary_role = models.CharField(
        max_length=30,
        choices=Role.choices
    )
    join_purpose = models.TextField(
        help_text="Why do you want to join ACM?"
    )
    previous_experience = models.TextField(
        blank=True,
        null=True,
        help_text="Any previous relevant experience"
    )
    weekly_availability = models.CharField(
        max_length=100,
        help_text="Available hours per week for ACM activities"
    )
    linkedin_profile = models.URLField(
        blank=True,
        null=True,
        help_text="LinkedIn profile URL (optional)"
    )
    is_confirmed = models.BooleanField(
        default=False,
        help_text="Confirmation that all information is accurate"
    )
    class Meta:
        verbose_name = "Role Preference"
        verbose_name_plural = "Role Preferences"
    def __str__(self):
        return f"Preferred: {self.preferred_role}, Secondary: {self.secondary_role}"