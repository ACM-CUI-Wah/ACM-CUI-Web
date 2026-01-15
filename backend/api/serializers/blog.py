from typing import Optional
from django.conf import settings
from rest_framework import serializers
from api.models import Blog, BlogImage, InlineImage

# Allowed types & default max size (5 MB)
ALLOWED_IMAGE_TYPES = ("image/jpeg", "image/png", "image/webp")
MAX_IMAGE_SIZE = getattr(settings, "MAX_BLOG_IMAGE_SIZE", 5 * 1024 * 1024)  # bytes
TEMP_INLINE_PREFIX = "/media/temp_inline/"


class BlogImageSerializer(serializers.ModelSerializer):
    relative_path = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = BlogImage
        fields = ("id", "relative_path", "image_url")

    def get_relative_path(self, obj) -> str:
        return obj.image.name

    def get_image_url(self, obj) -> Optional[str]:
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class InlineImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = InlineImage
        fields = ['id', 'image', 'uploaded_at']


class BlogSerializer(serializers.ModelSerializer):
    images = BlogImageSerializer(many=True, read_only=True)
    created_by = serializers.SerializerMethodField()
    createdBy = serializers.StringRelatedField()

    class Meta:
        model = Blog
        fields = ("id", "title", "content", "created_by", "createdBy", "createdAt", "updatedAt", "images")

    def get_created_by(self, obj) -> dict:
        user = obj.createdBy
        return {"id": user.id, "username": getattr(user, "username", None)}


class BlogUploadSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    content = serializers.CharField()
    images = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=False
    )

    def validate_images(self, images):
        for img in images:
            if img.size > MAX_IMAGE_SIZE:
                raise serializers.ValidationError(f"{img.name} exceeds the max size of {MAX_IMAGE_SIZE} bytes.")
            content_type = getattr(img, "content_type", None)
            if content_type not in ALLOWED_IMAGE_TYPES:
                raise serializers.ValidationError(f"{img.name} has invalid content type ({content_type}).")
        return images

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user

        blog = Blog.objects.create(
            title=validated_data["title"],
            content=validated_data["content"],
            createdBy=user
        )

        for img in validated_data["images"]:
            BlogImage.objects.create(blog=blog, image=img)

        return blog


class BlogUpdateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False
    )
    images_to_delete = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        write_only=True,
        help_text="IDs of images to delete"
    )

    class Meta:
        model = Blog
        fields = ("title", "content", "images", "images_to_delete")

    def update(self, instance, validated_data):
        new_images = validated_data.pop("images", None)
        images_to_delete = validated_data.pop("images_to_delete", [])

        instance.title = validated_data.get("title", instance.title)
        instance.content = validated_data.get("content", instance.content)
        instance.save()

        if images_to_delete:
            BlogImage.objects.filter(blog=instance, id__in=images_to_delete).delete()

        if new_images:
            for img in new_images:
                BlogImage.objects.create(blog=instance, image=img)

        return instance
