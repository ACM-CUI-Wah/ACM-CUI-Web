"""
Recruitment API Serializers
Author: Junaid Irfan

These serializers handle the Recruitment API data conversion and validation.
Based on the ER diagram structure from Django Recruitment API Task Assignment.

Models needed (from Member 1 - Aleesha):
- RecruitmentSession
- RecruitmentApplication
- PersonalInfo
- AcademicInfo
- RolePreferences
"""

from rest_framework import serializers
from api.models import (
    RecruitmentSession,
    RecruitmentApplication,
    PersonalInfo,
    AcademicInfo,
    RolePreferences
)


class RecruitmentSessionSerializer(serializers.ModelSerializer):
    """
    Serializer for RecruitmentSession model.
    
    Fields:
    - id: Primary Key
    - start_date: Date when applications open
    - end_date: Date when applications close
    - interview_date: Date for interviews
    - result_date: Date when results are announced
    - uni_session: String with "FA" or "SP" prefix (e.g., "FA24", "SP25")
    """
    class Meta:
        model = RecruitmentSession
        fields = '__all__'
    
    def validate_uni_session(self, value):
        """Ensure uni_session starts with FA or SP"""
        if not value.startswith(('FA', 'SP')):
            raise serializers.ValidationError(
                "University session must start with 'FA' (Fall) or 'SP' (Spring)"
            )
        return value
    
    def validate(self, data):
        """Validate date ordering: start < end < interview < result"""
        start = data.get('start_date')
        end = data.get('end_date')
        interview = data.get('interview_date')
        result = data.get('result_date')
        
        if end and start and end < start:
            raise serializers.ValidationError({
                'end_date': 'End date must be after start date'
            })
        if interview and end and interview < end:
            raise serializers.ValidationError({
                'interview_date': 'Interview date must be after application end date'
            })
        if result and interview and result < interview:
            raise serializers.ValidationError({
                'result_date': 'Result date must be after interview date'
            })
        return data


class PersonalInfoSerializer(serializers.ModelSerializer):
    """
    Serializer for PersonalInfo model (1-to-1 with RecruitmentApplication).
    
    Fields:
    - full_name
    - email (with validation)
    - phone_number
    - cnic (optional)
    """
    class Meta:
        model = PersonalInfo
        fields = ['id', 'full_name', 'email', 'phone_number', 'cnic']
        extra_kwargs = {
            'cnic': {'required': False, 'allow_blank': True}
        }


class AcademicInfoSerializer(serializers.ModelSerializer):
    """
    Serializer for AcademicInfo model (1-to-1 with RecruitmentApplication).
    
    Fields:
    - program: ENUM (BSCS, BSSE, BSAI)
    - semester: Current semester
    - cgpa: Current CGPA
    - skills: List/Text field
    - relevant_coursework: List/Text field
    """
    class Meta:
        model = AcademicInfo
        fields = ['id', 'program', 'semester', 'cgpa', 'skills', 'relevant_coursework']
        extra_kwargs = {
            'skills': {'required': False, 'allow_blank': True},
            'relevant_coursework': {'required': False, 'allow_blank': True}
        }


class RolePreferencesSerializer(serializers.ModelSerializer):
    """
    Serializer for RolePreferences model (1-to-1 with RecruitmentApplication).
    
    Fields:
    - preferred_role: Primary role choice
    - secondary_role: Backup role choice
    - why_join: Motivation statement
    """
    class Meta:
        model = RolePreferences
        fields = ['id', 'preferred_role', 'secondary_role', 'why_join']
        extra_kwargs = {
            'secondary_role': {'required': False},
            'why_join': {'required': False, 'allow_blank': True}
        }
    
    def validate(self, data):
        """Ensure preferred and secondary roles are different"""
        preferred = data.get('preferred_role')
        secondary = data.get('secondary_role')
        if secondary and preferred == secondary:
            raise serializers.ValidationError({
                'secondary_role': 'Secondary role must be different from preferred role'
            })
        return data


class RecruitmentApplicationSerializer(serializers.ModelSerializer):
    """
    Basic serializer for RecruitmentApplication model.
    
    Fields:
    - id: Primary Key
    - recruitment_session: FK to RecruitmentSession
    - status: ENUM (Under Review, Accepted, Rejected, Interviews)
    - created_at: Timestamp
    """
    class Meta:
        model = RecruitmentApplication
        fields = ['id', 'recruitment_session', 'status', 'created_at']
        read_only_fields = ['created_at']


class RecruitmentApplicationDetailSerializer(serializers.ModelSerializer):
    """
    Read-only serializer for viewing full application details (admin review).
    Includes all nested 1-to-1 data.
    """
    personal_info = PersonalInfoSerializer(read_only=True)
    academic_info = AcademicInfoSerializer(read_only=True)
    role_preferences = RolePreferencesSerializer(read_only=True)
    recruitment_session = RecruitmentSessionSerializer(read_only=True)
    
    class Meta:
        model = RecruitmentApplication
        fields = [
            'id', 'recruitment_session', 'status', 'created_at',
            'personal_info', 'academic_info', 'role_preferences'
        ]


class RecruitmentApplicationSubmissionSerializer(serializers.ModelSerializer):
    """
    Master Nested Serializer for application form submission.
    
    This is the main serializer used by the public submission endpoint.
    It accepts a single nested JSON payload containing:
    - recruitment_session: ID of the active session
    - personal_info: Nested PersonalInfo data
    - academic_info: Nested AcademicInfo data
    - role_preferences: Nested RolePreferences data
    
    The create() method handles creating all 4 models in the correct order.
    """
    # Nested serializers for write operations
    personal_info = PersonalInfoSerializer()
    academic_info = AcademicInfoSerializer()
    role_preferences = RolePreferencesSerializer()
    
    class Meta:
        model = RecruitmentApplication
        fields = [
            'id', 'recruitment_session', 'status', 'created_at',
            'personal_info', 'academic_info', 'role_preferences'
        ]
        read_only_fields = ['id', 'status', 'created_at']
    
    def create(self, validated_data):
        """
        Create a RecruitmentApplication with all related 1-to-1 records.
        
        Logic:
        1. Extract nested data for personal, academic, and preferences
        2. Create the parent RecruitmentApplication instance first
        3. Use the parent's ID to create the three related 1-to-1 records
        """
        # Extract nested data
        personal_data = validated_data.pop('personal_info')
        academic_data = validated_data.pop('academic_info')
        preferences_data = validated_data.pop('role_preferences')
        
        # Create parent application with default status
        application = RecruitmentApplication.objects.create(
            recruitment_session=validated_data['recruitment_session'],
            status='Under Review'
        )
        
        # Create related 1-to-1 records linked to the application
        PersonalInfo.objects.create(application=application, **personal_data)
        AcademicInfo.objects.create(application=application, **academic_data)
        RolePreferences.objects.create(application=application, **preferences_data)
        
        return application

    def to_representation(self, instance):
        """
        Customize the output representation to include nested data.
        """
        return {
            'id': instance.id,
            'recruitment_session': instance.recruitment_session.id,
            'status': instance.status,
            'created_at': instance.created_at,
            'personal_info': PersonalInfoSerializer(instance.personal_info).data,
            'academic_info': AcademicInfoSerializer(instance.academic_info).data,
            'role_preferences': RolePreferencesSerializer(instance.role_preferences).data,
        }


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating only the status field of an application.
    Used by admins to move applications through the review process.
    """
    class Meta:
        model = RecruitmentApplication
        fields = ['status']
