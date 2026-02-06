import os
import uuid
from django.db import models
from api.models import User


def blog_image_upload_path(instance, filename):
    # Store images under: media/blog_images/<blog_uuid>/<filename>
    return f'blog_images/{instance.blog.id}/{filename}'

class Blog(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    createdBy = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blogs')
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)


class BlogImage(models.Model):
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=blog_image_upload_path)

    def __str__(self):
        return f'Image for blog {self.blog.id}'

def temp_inline_upload_path(instance, filename):
    """
    Store inline images in temp_inline/ with a unique filename
    to prevent collisions.
    """
    ext = os.path.splitext(filename)[1]  # keep extension (.jpg, .png, etc.)
    unique_name = f"{uuid.uuid4().hex}{ext}"
    return f"temp_inline/{unique_name}"

class InlineImage(models.Model):
    image = models.ImageField(upload_to=temp_inline_upload_path)
    uploaded_at = models.DateTimeField(auto_now_add=True)