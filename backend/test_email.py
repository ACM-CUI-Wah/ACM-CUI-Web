from django.core.mail import send_mail
from django.conf import settings

# Test email sending
try:
    send_mail(
        'Test Email from ACM CUI',
        'This is a test email to verify SMTP configuration works.',
        settings.DEFAULT_FROM_EMAIL,
        ['acmcuidevs@gmail.com'],  # Send to the email from the screenshot
        fail_silently=False,
    )
    print("✅ Email sent successfully!")
except Exception as e:
    print(f"❌ Email failed: {e}")
