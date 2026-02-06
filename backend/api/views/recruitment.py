from api.models import RecruitmentSession, RecruitmentApplication, ApplicationStatus, Role
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
from openpyxl import Workbook
from django.http import HttpResponse
from rest_framework.views import APIView
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiTypes,
)
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet


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


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="session_id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Primary key of the recruitment session",
            required=False,
        ),
        OpenApiParameter(
            name="session",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Recruitment session code (e.g. FA24, SP25)",
            required=False,
        ),
        OpenApiParameter(
            name="status",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Application status (ACCEPTED, REJECTED, UNDER_REVIEW, INTERVIEWS)",
            required=False,
            enum=[status for status, _ in ApplicationStatus.choices],
        ),
        OpenApiParameter(
            name="preferred_role",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Filter by preferred role (e.g. CODEHUB, GRAPHICS, EVENTS_LOGISTICS)",
            required=False,
            enum=[r for r, _ in Role.choices],
        ),
    ],
    responses={
        200: OpenApiTypes.BINARY,
    },
    description="Export recruitment applications as an Excel file",
)
class RecruitmentApplicationsExcelView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        session_code = request.query_params.get("session")
        status_param = request.query_params.get("status")
        session_id = request.query_params.get("session_id")
        preferred_role = request.query_params.get("preferred_role")

        applications = (
            RecruitmentApplication.objects
            .select_related(
                "recruitment_session",
                "personal_info",
                "academic_info",
                "role_preferences",
            )
        )

        if session_id:
            applications = applications.filter(
                recruitment_session_id=session_id
            )
        elif session_code:
            applications = applications.filter(
                recruitment_session__uni_session=session_code
            )

        # Filter by application status
        if status_param:
            if status_param not in ApplicationStatus.values:
                return HttpResponse(
                    "Invalid status value",
                    status=400
                )
            applications = applications.filter(status=status_param)

        if preferred_role:
            if preferred_role not in Role.values:
                return HttpResponse("Invalid preferred role", status=400)

            applications = applications.filter(
                role_preferences__preferred_role=preferred_role
            )

        wb = Workbook()
        ws = wb.active
        ws.title = "Recruitment Applications"

        headers = [
            "Application ID", "Status",
            "Session", "Application Start", "Application End",
            "Interview Start", "Interview End", "Result Date",
            "First Name", "Last Name", "Email", "Phone",
            "Registration No", "Program", "Current Semester",
            "Skills", "Relevant Coursework",
            "Preferred Role", "Secondary Role",
            "Join Purpose", "Previous Experience",
            "Weekly Availability", "LinkedIn",
        ]
        ws.append(headers)

        for app in applications:
            session = app.recruitment_session
            personal = getattr(app, "personal_info", None)
            academic = getattr(app, "academic_info", None)
            role = getattr(app, "role_preferences", None)

            ws.append([
                app.id, app.status,
                session.uni_session,
                session.application_start,
                session.application_end,
                session.interview_start,
                session.interview_end,
                session.result_date,
                personal.first_name if personal else "",
                personal.last_name if personal else "",
                personal.email if personal else "",
                personal.phone_number if personal else "",
                academic.reg_no if academic else "",
                academic.program if academic else "",
                academic.current_semester if academic else "",
                ", ".join(academic.skills) if academic else "",
                ", ".join(academic.relevant_coursework) if academic else "",
                role.preferred_role if role else "",
                role.secondary_role if role else "",
                role.join_purpose if role else "",
                role.previous_experience if role else "",
                role.weekly_availability if role else "",
                role.linkedin_profile if role else "",
            ])

        response = HttpResponse(
            content_type=(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            )
        )
        response["Content-Disposition"] = (
            'attachment; filename="recruitment_applications.xlsx"'
        )

        wb.save(response)
        return response


@extend_schema(
    parameters=[
        OpenApiParameter(
            name="session_id",
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description="Primary key of the recruitment session (takes precedence)",
            required=False,
        ),
        OpenApiParameter(
            name="session",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Recruitment session code (e.g. FA24)",
            required=False,
        ),
        OpenApiParameter(
            name="status",
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description="Application status",
            enum=[s for s, _ in ApplicationStatus.choices],
            required=False,
        ),
    ],
    responses={200: OpenApiTypes.BINARY},
    description="Export recruitment applications as a PDF",
)
class RecruitmentApplicationsPDFView(APIView):
    def get(self, request):
        session_id = request.query_params.get("session_id")
        session_code = request.query_params.get("session")
        status_param = request.query_params.get("status")

        applications = RecruitmentApplication.objects.select_related(
            "recruitment_session",
            "personal_info",
            "academic_info",
            "role_preferences",
        )

        if session_id:
            applications = applications.filter(
                recruitment_session_id=session_id
            )
        elif session_code:
            applications = applications.filter(
                recruitment_session__uni_session=session_code
            )

        if status_param:
            if status_param not in ApplicationStatus.values:
                return HttpResponse("Invalid status", status=400)
            applications = applications.filter(status=status_param)

        response = HttpResponse(content_type="application/pdf")
        response["Content-Disposition"] = (
            'attachment; filename="recruitment_applications.pdf"'
        )

        doc = SimpleDocTemplate(
            response,
            pagesize=A4,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30,
        )

        styles = getSampleStyleSheet()
        elements = []

        elements.append(
            Paragraph("Recruitment Applications Report", styles["Title"])
        )

        # Table header
        data = [[
            "ID", "Status", "Session",
            "Name", "Email",
            "Reg No", "Program",
            "Preferred Role"
        ]]

        for app in applications:
            personal = getattr(app, "personal_info", None)
            academic = getattr(app, "academic_info", None)
            role = getattr(app, "role_preferences", None)

            data.append([
                app.id,
                app.status,
                app.recruitment_session.uni_session,
                f"{personal.first_name} {personal.last_name}" if personal else "",
                personal.email if personal else "",
                academic.reg_no if academic else "",
                academic.program if academic else "",
                role.preferred_role if role else "",
            ])

        table = Table(data, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONT", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ALIGN", (0, 0), (-1, -1), "LEFT"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ]))

        elements.append(table)
        doc.build(elements)

        return response
