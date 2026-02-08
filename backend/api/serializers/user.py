from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from api.models import User, Student
from django.contrib.auth import authenticate
from api.utils import upload_file, delete_from_bucket, get_bucket_public_url


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username', 'password', 'role', 'phone_number']


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    profile_pic = serializers.ImageField(write_only=True, required=False)  # incoming file
    profile_pic_url = serializers.SerializerMethodField()  # public URL for read

    roll_no = serializers.RegexField(
        regex='^(?:FA|SP)[0-9]{2}-B(?:CS|AI|SE)-[0-9]{3}$',
        max_length=20,
        allow_blank=False
    )
    club = serializers.ChoiceField(
        choices=[
            'CODEHUB',
            'GRAPHICS',
            'SOCIAL_MEDIA_MARKETING',
            'MEDIA',
            'DECOR',
            'EVENTS_LOGISTICS',
            ''
        ],
        allow_blank=True,
        required=False
    )
    title = serializers.CharField(required=False, allow_blank=True)
    content = serializers.CharField(required=False)

    EXECUTIVE_TITLES = ['PRESIDENT', 'VICE PRESIDENT', 'SECRETARY', 'TREASURER']

    class Meta:
        model = Student
        fields = '__all__'  # will include profile_pic_url
        read_only_fields = ['profile_pic_url']

    def get_profile_pic_url(self, obj):
        if not obj.profile_pic:
            return None
        return get_bucket_public_url(obj.profile_pic)

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        uploaded_file = validated_data.pop('profile_pic', None)

        # Create user
        user_data['password'] = make_password(user_data['password'])
        user = User.objects.create(**user_data)

        # Create student
        student = Student.objects.create(user=user, **validated_data)

        # Upload profile pic
        if uploaded_file:
            student.profile_pic = upload_file(uploaded_file, "profiles")
            student.save(update_fields=["profile_pic"])

        return student

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        uploaded_file = validated_data.pop('profile_pic', None)

        # Update Student fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Update user
        if user_data:
            for attr, value in user_data.items():
                if attr == 'password':
                    instance.user.set_password(value)
                else:
                    setattr(instance.user, attr, value)
            instance.user.save()

        # Handle profile pic replacement
        if uploaded_file:
            if instance.profile_pic:
                delete_from_bucket("media", instance.profile_pic)

            instance.profile_pic = upload_file(uploaded_file, "profiles")

        instance.save()
        return instance



# NOTE: This serializer is for the students list view
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'username', 'phone_number']


class StudentListSerializer(serializers.ModelSerializer):
    user = UserListSerializer()
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = '__all__'

    def get_profile_pic_url(self, obj):
        if not obj.profile_pic:
            return None
        return get_bucket_public_url(obj.profile_pic)

class PublicStudentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    profile_pic_url = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = ['full_name', 'title', 'profile_pic_url', 'user_id', 'club']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_profile_pic_url(self, obj):
        if not obj.profile_pic:
            return None
        return get_bucket_public_url(obj.profile_pic)


class ProfileUserSerializer(serializers.ModelSerializer):
    """Serializer for updating user info in profile updates"""
    # Override email and username to remove default unique validators
    # since we handle uniqueness validation manually below
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'username']
        read_only_fields = ['id']
        # Disable default unique validators - we handle them manually
        extra_kwargs = {
            'email': {'validators': []},
            'username': {'validators': []},
        }

    def validate_email(self, value):
        """Check email uniqueness excluding current user"""
        instance = self.instance
        if instance:
            # Exclude current user when checking uniqueness
            if User.objects.filter(email=value).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError("user with this email already exists.")
        return value

    def validate_username(self, value):
        """Check username uniqueness excluding current user"""
        instance = self.instance
        if instance:
            # Exclude current user when checking uniqueness
            if User.objects.filter(username=value).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError("user with this username already exists.")
        return value


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer specifically for profile updates - doesn't require roll_no validation"""
    user = ProfileUserSerializer(required=False)
    profile_pic = serializers.ImageField(required=False, allow_null=True)
    profile_desc = serializers.CharField(required=False, allow_blank=True, max_length=200)

    class Meta:
        model = Student
        fields = ['id', 'user', 'profile_pic', 'profile_desc']
        read_only_fields = ['id']

    def validate_user(self, value):
        """Validate user data with the actual user instance for uniqueness checks"""
        if self.instance and value:
            user_instance = self.instance.user
            # Create a serializer with the user instance to properly validate uniqueness
            user_serializer = ProfileUserSerializer(
                instance=user_instance,
                data=value,
                partial=True
            )
            if not user_serializer.is_valid():
                raise serializers.ValidationError(user_serializer.errors)
            return user_serializer.validated_data
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)

        # Update student fields
        if 'profile_pic' in validated_data:
            instance.profile_pic = validated_data['profile_pic']
        if 'profile_desc' in validated_data:
            instance.profile_desc = validated_data['profile_desc']

        # Update user fields if provided
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                if attr != 'id':  # Don't update ID
                    setattr(user, attr, value)
            user.save()

        instance.save()
        return instance



class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError("User account is disabled.")
                data['user'] = user
                return data
            else:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'username' and 'password'.")


class OTPSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise ValidationError({"email": "User with this email does not exist."})
        return value


class PasswordChangeSerializer(serializers.Serializer):
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True)