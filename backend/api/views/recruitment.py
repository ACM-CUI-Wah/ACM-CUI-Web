from api.models import RecruitmentSession, RecruitmentApplication
from api.serializers.recruitment import (
    RecruitmentSessionSerializer,
    RecruitmentApplicationSubmissionSerializer,
    RecruitmentApplicationSerializer,
)
from django.utils.timezone import now
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet, ModelViewSet
from api.permissions import IsAdmin


# -------------
# Admin Views
# -------------

class RecruitmentSessionViewSet(ModelViewSet):
    """
    Full CRUD for recruitment sessions, admin only.
    """
    queryset = RecruitmentSession.objects.all()
    serializer_class = RecruitmentSessionSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


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
    permission_classes = [IsAuthenticated, IsAdmin]

    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ["status"]
    filterset_fields = ["status", "recruitment_session"]


class ApplicationStatusUpdateViewSet(ModelViewSet):
    """
    Allows admin to update only the status of an application.
    """
    queryset = RecruitmentApplication.objects.all()
    serializer_class = RecruitmentApplicationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

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

# -----------------------------
# Public Views
# -----------------------------

class ActiveRecruitmentSessionView(ReadOnlyModelViewSet):
    queryset = RecruitmentSession.objects.all()
    serializer_class = RecruitmentSessionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        today = now().date()
        return RecruitmentSession.objects.filter(
            application_start__lte=today,
            application_end__gte=today
        )

class ApplicationSubmitView(ModelViewSet):
    queryset = RecruitmentApplication.objects.all()
    serializer_class = RecruitmentApplicationSubmissionSerializer
    permission_classes = [AllowAny]

    http_method_names = ['post']