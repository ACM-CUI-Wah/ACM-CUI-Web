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

# -----------------------------
# Public Views
# -----------------------------

class ActiveRecruitmentSessionView(ReadOnlyModelViewSet):

    queryset = RecruitmentSession.objects.all()
    serializer_class = RecruitmentSerializer
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



