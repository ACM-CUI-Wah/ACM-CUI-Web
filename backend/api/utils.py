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
    refresh['otp'] = claims.get('otp')
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def send_otp(destination: str, **data):
    """
    Sends OTP to destination using Resend HTTP API.
    More reliable than SMTP on cloud platforms like Railway.

    :param destination: Receiver's email
    :param data: Dict containing extra data (Optional)
    """
    import requests
    
    resend_api_key = settings.EMAIL_HOST_PASSWORD  # Use the Resend API key
    
    if not resend_api_key or resend_api_key == '':
        print("WARNING: No Resend API key configured, skipping email")
        return
    
    try:
        response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {resend_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'from': settings.DEFAULT_FROM_EMAIL,
                'to': [destination],
                'subject': 'OTP Verification',
                'html': f'<p>This is your requested OTP: <strong>{data.get("otp")}</strong></p>'
            }
        )
        
        if response.status_code != 200:
            error_msg = response.json() if response.text else response.text
            print(f"Resend API Error: {response.status_code} - {error_msg}")
            raise Exception(f"Failed to send email: {error_msg}")
            
        print(f"✅ OTP email sent successfully to {destination}")
        
    except Exception as e:
        print("OTP EMAIL ERROR:", e)
        raise

def send_password(destination: str, **data):
    """
    Sends password email using Resend HTTP API.
    """
    import requests
    
    resend_api_key = settings.EMAIL_HOST_PASSWORD
    
    if not resend_api_key or resend_api_key == '':
        print("WARNING: No Resend API key configured, skipping email")
        return
        
    try:
        response = requests.post(
            'https://api.resend.com/emails',
            headers={
                'Authorization': f'Bearer {resend_api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'from': settings.DEFAULT_FROM_EMAIL,
                'to': [destination],
                'subject': 'Account Creation Notice',
                'html': f'''
                    <p>Your account has been created with the following credentials:</p>
                    <p><strong>Username:</strong> {data.get("username")}</p>
                    <p><strong>Password:</strong> {data.get("password")}</p>
                    <p><em>You are advised to change the password as soon as possible.</em></p>
                '''
            }
        )
        
        if response.status_code != 200:
            error_msg = response.json() if response.text else response.text
            print(f"Resend API Error: {response.status_code} - {error_msg}")
            raise Exception(f"Failed to send email: {error_msg}")
            
        print(f"✅ Password email sent successfully to {destination}")
        
    except Exception as e:
        print("PASSWORD EMAIL ERROR:", e)
        raise

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

def delete_from_bucket(bucket: str, path: str):
    if not path:
        return
    supabase.storage.from_(bucket).remove([path])