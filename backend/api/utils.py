from datetime import datetime
from .supabase import supabase
from django.conf import settings
from uuid import uuid4
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail


def get_tokens_for_user(user, **claims):
    """
    Creates the JWT manually and adds custom claims. The claims will
    be encoded in the JWT.

    :param user: The User instance
    :param claims: Dict containing additional claims
    :return: Encoded access and refresh tokens
    """
    refresh = RefreshToken.for_user(user)
    refresh['user_id'] = user.id
    refresh['email'] = user.email
    refresh['otp'] = claims['otp']
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def send_otp(destination: str, **data):
    """
    Sends OTP to destination. This function is currently development
    only. It uses the 'file' backend and so it will dump all emails to tmp/api_messages.

    :param destination: Receiver's email
    :param data: Dict containing extra data (Optional)
    """
    send_mail(
        "OTP Verification",
        f"This is your requested OTP: {data['otp']}",
        "no_reply@example.com",
        [destination],
        fail_silently=False,
    )


def send_password(destination: str, **data):
    send_mail(
        subject='Account Creation Notice',
        message=f'Your account has been created with username: {data["username"]} and password: {data["password"]}.\nYou are advised to change the password as soon as possible.',
        from_email='no_reply@example.com',
        recipient_list=[destination],
        fail_silently=False,
    )


def current_time():
    return datetime.now().time()


def upload_file(file, folder):
    """
    Upload a file to the public bucket.
    Returns the path that can be used to construct the URL.
    """

    path = f"{folder}/{uuid4()}_{file.name}"

    supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
        path,
        file.read(),
        file_options={"content-type": file.content_type}
    )
    return path

def get_bucket_public_url(path):
    return f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_BUCKET}/{path}"