from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from .models import UserRole, Blog, BlogImage
from io import BytesIO
from PIL import Image
from django.core.files.uploadedfile import SimpleUploadedFile

file = SimpleUploadedFile(
    name='example.jpg',
    content=b'file content here',
    content_type='image/jpeg'
)


User = get_user_model()

'''
class SignupViewTests(APITestCase):

    def setUp(self):
        self.lead_user = User.objects.create_user(
            username="leaduser",
            password="leadpass123",
            email="lead@example.com",
            role=UserRole.LEAD
        )
        self.token = Token.objects.create(user=self.lead_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        self.url = reverse('signup')     

    def test_signup_success_by_lead(self):
        """A LEAD can successfully register a student."""
        data = {
            "user": {
                "username": "student1",
                "password": "pass1234",
                "email": "student1@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "role": UserRole.STUDENT
            },
            "roll_no": "FA23-BCS-123",  # ✅ valid format
            "club": "codehub"
        }
        response = self.client.post(
            self.url, data, format='json',
            HTTP_AUTHORIZATION=f"Token {self.token.key}"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["status"], "success")
        self.assertEqual(response.data["data"]["username"], "student1")

    def test_signup_fails_if_not_lead(self):
        """Non-LEAD users cannot register a student."""
        self.client.credentials()  # clear any previously set credentials
        student_user = User.objects.create_user(
            username="studentuser",
            password="pass123",
            email="student@example.com",
            role=UserRole.STUDENT
        )
        student_token = Token.objects.create(user=student_user)

        data = {
            "user": {
                "username": "student2",
                "password": "pass1234",
                "email": "student2@example.com",
                "first_name": "Jane",
                "last_name": "Doe",
                "role": UserRole.STUDENT
            },
            "roll_no": "FA23-BCS-124",
            "club": "codehub"
        }
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {student_token.key}")
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_signup_requires_authentication(self):
        self.client.credentials()  # clear credentials
        data = {
            "user": {
                "username": "noauthstudent",
                "password": "pass1234",
                "email": "noauthstudent@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "role": UserRole.STUDENT
            },
            "roll_no": "FA23-BCS-777",
            "club": "codehub"
        }

        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_signup_success_creates_user_and_profile(self):
        data = {
            "user": {
                "username": "student_db",
                "password": "pass1234",
                "email": "student_db@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "role": UserRole.STUDENT
            },
            "roll_no": "FA23-BCS-999",
            "club": "codehub"
        }
        # auth header set via self.client.credentials in setUp
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Verify user exists
        user = User.objects.get(username="student_db")
        self.assertEqual(user.email, "student_db@example.com")
        self.assertTrue(user.check_password("pass1234"))
        self.assertEqual(user.role, UserRole.STUDENT)

        # If roll_no stored on a profile model, check that here:
        # from .models import StudentProfile
        # profile = StudentProfile.objects.get(user=user)
        # self.assertEqual(profile.roll_no, "FA23-BCS-999")
        # self.assertEqual(profile.club, "codehub")

    def test_non_lead_forbidden_status_and_message(self):
        student_user = User.objects.create_user(
            username="studentuser2", password="pass123", email="s2@example.com", role=UserRole.STUDENT
        )
        token = Token.objects.create(user=student_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        data = {
            "user": {
                "username": "shouldfail",
                "password": "pass1234",
                "email": "shouldfail@example.com",
                "first_name": "Fail",
                "last_name": "User",
                "role": UserRole.STUDENT
            },
            "roll_no": "FA23-BCS-555",
            "club": "codehub"
        }

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        # optional: assert message shape
        self.assertIn('detail', response.data)  # or whichever key your view returns

    def test_signup_duplicate_username_returns_400(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        User.objects.create_user(username="dup", password="x", email="dup@example.com", role=UserRole.STUDENT)
        data = {
            "user": {"username": "dup", "password": "pass", "email": "dup2@example.com", "role": UserRole.STUDENT},
            "roll_no": "FA23-BCS-100",
            "club": "codehub"
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data['user'])
        

class LoginViewTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123",
            email="test@example.com",
            role=UserRole.STUDENT
        )
        self.url = reverse('login')

    def test_login_success(self):
        """Correct credentials should return a token."""
        data = {"username": "testuser", "password": "testpass123"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertIn("token", response.data["data"])

    def test_login_invalid_credentials(self):
        """Wrong password should return an error."""
        data = {"username": "testuser", "password": "wrongpass"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # DRF's default error structure
        self.assertIn("non_field_errors", response.data["message"])


    def test_login_success_returns_existing_token(self):
        data = {"username": "testuser", "password": "testpass123"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token_key = response.data["data"]["token"]
        # Verify the token is in DB and belongs to the user
        self.assertTrue(Token.objects.filter(key=token_key, user=self.user).exists())

    def test_login_nonexistent_user_returns_400(self):
        data = {"username": "noone", "password": "whatever"}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
'''

class BlogUploadTests(APITestCase):
    ALLOW_TEXT_ONLY = False  # Added so test_missing_images won't error

    def setUp(self):
        print("\n[setUp] Initializing test setup...")
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="pass1234")
        self.client.force_authenticate(user=self.user)
        self.url = reverse('blog-upload')
        print(f"[setUp] ✅ Created and authenticated user: {self.user.username} (ID: {self.user.id})")

    def generate_image_file(self, name='test.jpg', color='red', size_bytes=None):
        print(f"[generate_image_file] Creating in-memory image: name={name}, color={color}")

        file = BytesIO()
        image = Image.new('RGB', (100, 100), color=color)
        image.save(file, 'JPEG')
        if size_bytes:
            # Pad the file to desired size
            file.write(b'\0' * (size_bytes - file.tell()))
        file.name = name
        file.seek(0)

        actual_size = file.getbuffer().nbytes
        print(f"[generate_image_file] ✅ Generated file: {file.name} ({actual_size} bytes)")
        return file

    def test_blog_upload_single_image(self):
        image_file = self.generate_image_file(name='single.jpg')

        data = {
            "title": "Test Blog Single Image",
            "content": "Testing upload with one image.",
            "images": image_file
        }
        response = self.client.post(self.url, data, format='multipart')

        self.assertEqual(response.status_code, 201, msg=f"Expected 201, got {response.status_code}: {response.data}")
        # Adjust to match API structure (look in 'data' instead of 'message')
        self.assertIn("content", str(response.data))

    def test_blog_upload_multiple_images(self):
        image_file1 = self.generate_image_file(name='multi1.jpg', color='blue')
        image_file2 = self.generate_image_file(name='multi2.jpg', color='green')

        data = {
            "title": "Test Blog Multiple Images",
            "content": "Testing upload with multiple images.",
            "images": [image_file1, image_file2]
        }
        response = self.client.post(self.url, data, format='multipart')

        self.assertEqual(response.status_code, 201, msg=f"Expected 201, got {response.status_code}: {response.data}")
        self.assertIn('data', response.data)

    def test_upload_invalid_file_type(self):
        invalid_file = SimpleUploadedFile(
            name='not_an_image.txt',
            content=b"Hello world",
            content_type='text/plain'
        )
        data = {
            'title': 'Test Blog',
            'content': 'Invalid file type test',
            'images': [invalid_file]
        }
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, 400)
        # Match actual error text from API
        self.assertIn('Upload a valid image', str(response.data))

    def test_upload_large_image(self):
        large_image = self.generate_image_file(
            name='large.jpg',
            size_bytes=5 * 1024 * 1024 + 1
        )
        data = {
            'title': 'Big Image Blog',
            'content': 'Testing large image rejection',
            'images': [large_image]
        }
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, 400)
        # Match actual message API returns
        self.assertIn('exceeds the max size', str(response.data))

    def test_upload_without_authentication(self):
        self.client.force_authenticate(user=None)
        image = self.generate_image_file(name='unauthenticated.jpg')
        data = {
            'title': 'Unauthorized Blog',
            'content': 'Should not work',
            'images': [image]
        }
        response = self.client.post(self.url, data, format='multipart')
        self.assertEqual(response.status_code, 401)

    def test_missing_text_content(self):
        image = SimpleUploadedFile(
            "test.jpg",
            b"fake image content",
            content_type="image/jpeg"
        )
        response = self.client.post(
            self.url,
            data={"images": image},  # no text content
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Adjusted to match API's nested structure
        self.assertIn('content', response.data['message'])

    def test_missing_images(self):
        payload = {
            "title": "Text Only Blog",
            "content": "This is a blog post without images."
        }
        response = self.client.post(self.url, payload, format="multipart")

        if self.ALLOW_TEXT_ONLY:
            self.assertEqual(response.status_code, 201)
        else:
            self.assertEqual(response.status_code, 400)
            self.assertIn("images", response.data["message"])

class BlogEditViewTests(APITestCase):
    def setUp(self):
        print("\n[setUp] Initializing test setup...")
        self.client = APIClient()
        self.user = User.objects.create_user(username="testuser", password="pass1234")
        self.client.force_authenticate(user=self.user)
        self.blog = Blog.objects.create(
            title="Test Blog",
            content="Some content",
            createdBy=self.user
        )
        self.url = f'http://localhost:8000/api/blogs/{self.blog.pk}/edit/'
        print(f"[setUp] ✅ Created and authenticated user: {self.user.username} (ID: {self.user.id})")

    def test_edit_blog_as_user(self):
        self.client.force_authenticate(user=self.user)
        print(f'To-be-deleted blog\'s pk: {self.blog.pk}')
        response = self.client.put(self.url, {"title": "Updated Title"}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.blog.refresh_from_db()
        self.assertEqual(self.blog.title, "Updated Title")

    def test_edit_nonexistent_blog(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.put("/api/blogs/9999/edit/", {"title": "Updated Title"}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_edit_blog_with_invalid_data(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.put(self.url, {"title": ""}, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class BlogDeleteViewTests(APITestCase):
    def setUp(self):
        print("\n[setUp] Initializing test setup...")
        self.client = APIClient()
        self.user = User.objects.create_user(username="testadmin", password="pass1234", role=UserRole.ADMIN, email='testadmin@gmail.com ')
        self.non_admin_user = User.objects.create_user(username='testuser', password='pass1234', role=UserRole.STUDENT, email='test@gmail.com')
        self.client.force_authenticate(user=self.user)
        self.client.force_authenticate(user=self.non_admin_user)
        self.blog = Blog.objects.create(
            title="Test Blog",
            content="Some content",
            createdBy=self.non_admin_user
        )
        self.url = f'http://localhost:8000/api/blogs/{self.blog.pk}/delete/'
        print(f"[setUp] ✅ Created and authenticated user: {self.user.username} (ID: {self.user.id})")

    def test_delete_blog_as_admin(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "success")
        self.assertFalse(Blog.objects.filter(pk=self.blog.pk).exists())

    def test_delete_blog_as_non_admin_forbidden(self):
        self.client.force_authenticate(user=self.non_admin_user)
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_nonexistent_blog(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.delete("/api/blogs/9999/delete/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
