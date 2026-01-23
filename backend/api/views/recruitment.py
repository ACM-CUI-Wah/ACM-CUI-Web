from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from api.models import RecruitmentSession, RecruitmentApplication
from api.serializers.recruitment import (
    RecruitmentSerializer,
    RecruitmentApplicationSubmissionSerializer,
    RecruitmentApplicationSerializer,
)


class RecruitmentSessionViewSet(ModelViewSet):
    """
    Full CRUD for recruitment sessions, admin only.
    """
    queryset = RecruitmentSession.objects.all()
    serializer_class = RecruitmentSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class ApplicationReviewViewSet(ReadOnlyModelViewSet):
    """
    Admin view for reviewing applications.
    Supports filtering by status and recruitment_session.
    """
    queryset = RecruitmentApplication.objects.select_related(
        "recruitment_session"
    ).prefetch_related(
        "personal_info", "academic_info", "role_preferences"
    )
    serializer_class = RecruitmentApplicationSubmissionSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ["status"]
    filterset_fields = ["status", "recruitment_session"]


class ApplicationStatusUpdateViewSet(ModelViewSet):
    """
    Allows admin to update only the status of an application.
    """
    queryset = RecruitmentApplication.objects.all()
    serializer_class = RecruitmentApplicationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    http_method_names = ['patch', 'get']  

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get("status")
        if not new_status:
            return Response(
                {"error": "Status field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        application.status = new_status
        application.save()
        return Response({"status": "updated"})