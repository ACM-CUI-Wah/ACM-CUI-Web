from datetime import datetime
from io import BytesIO
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from rest_framework import generics
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from api.models import Meeting, MeetingAttendance
from api.permissions import IsLeadOrAdmin
from api.serializers import MeetingSerializer, \
    MeetingAttendanceSerializer


class MeetingCreateView(APIView):
    serializer_class = MeetingSerializer
    permission_classes = [IsLeadOrAdmin]

    def post(self, request, *args, **kwargs):
        data = request.data
        try:
            attendance_data = data.pop('attendance')
        except KeyError:
            return Response({
                'status': 'error',
                'message': {
                    'attendance': 'This field is required.'
                },
                'data': None
            }, status.HTTP_400_BAD_REQUEST)
        meeting_serializer = self.serializer_class(data=data)
        if meeting_serializer.is_valid():
            meeting = meeting_serializer.save()
            for att in attendance_data:
                att['meeting.py'] = meeting.id
            attendance_serializer = MeetingAttendanceSerializer(many=True, data=attendance_data)
            if attendance_serializer.is_valid():
                attendance_serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Data created',
                    'data': None
                }, status.HTTP_201_CREATED)
        return Response({
            'status': 'error',
            'message': meeting_serializer.errors,
            'data': None
        }, status.HTTP_400_BAD_REQUEST)


class MeetingListView(generics.ListAPIView):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [IsLeadOrAdmin]


class MeetingRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Meeting.objects.all()
    serializer_class = MeetingSerializer
    permission_classes = [IsLeadOrAdmin]


class MeetingAttendanceListView(generics.ListAPIView):
    serializer_class = MeetingAttendanceSerializer
    permission_classes = [IsLeadOrAdmin]
    lookup_url_kwarg = 'pk'

    def get_queryset(self):
        if self.request.user.role == 'LEAD':
            club = self.request.user.student.club
            return MeetingAttendance.objects.filter(user__student__club=club)
        return MeetingAttendance.objects.all()


class MeetingAttendanceRUDView(generics.RetrieveUpdateDestroyAPIView):
    queryset = MeetingAttendance.objects.all()
    serializer_class = MeetingAttendanceSerializer
    permission_classes = [IsLeadOrAdmin]
    lookup_url_kwarg = 'att_pk'


class MeetingPDFView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsLeadOrAdmin]

    def get(self, request, pk, *args, **kwargs):
        meeting = self.get_meeting(pk)
        attendance = self.get_attendance(request.user, meeting)

        buffer = BytesIO()
        doc = self.build_document(buffer)

        elements = self.build_elements(request.user, meeting, attendance)
        doc.build(elements, onFirstPage=self.add_header)

        return self.build_response(buffer, meeting.date)

    def get_meeting(self, pk):
        try:
            return Meeting.objects.get(pk=pk)
        except Meeting.DoesNotExist:
            raise NotFound("Meeting not found")

    def get_attendance(self, user, meeting):
        qs = MeetingAttendance.objects.filter(meeting=meeting).select_related("user")

        if user.role == "LEAD" and hasattr(user, "student"):
            return qs.filter(user__student__club=user.student.club)

        if user.role == "ADMIN":
            return qs

        return MeetingAttendance.objects.none()

    def build_document(self, buffer):
        return SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=120,
            bottomMargin=18,
        )

    def build_elements(self, user, meeting, attendance):
        styles = self.get_styles()
        elements = []

        elements.append(Paragraph("Minutes of ACM Meeting", styles["title"]))
        elements.append(Spacer(1, 0.1 * inch))

        if user.role != "ADMIN":
            elements.extend(self.club_heading(user, styles))

        elements.extend(self.meeting_details(meeting, styles))
        elements.extend(self.attendance_section(attendance, styles))
        elements.extend(self.summary_section(attendance, styles))
        elements.extend(self.footer(styles))

        return elements

    def get_styles(self):
        base = getSampleStyleSheet()

        return {
            "title": ParagraphStyle(
                "Title",
                parent=base["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=16,
                alignment=1,
                spaceAfter=20,
            ),
            "heading": ParagraphStyle(
                "Heading",
                parent=base["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=12,
                spaceAfter=10,
            ),
            "body": ParagraphStyle(
                "Body",
                fontName="Helvetica",
                fontSize=10,
            ),
            "footer": ParagraphStyle(
                "Footer",
                fontName="Helvetica-Oblique",
                fontSize=8,
                alignment=1,
            ),
        }

    def club_heading(self, user, styles):
        club_name = user.student.club.replace("_", " ").title()
        style = ParagraphStyle(
            "Club",
            parent=styles["heading"],
            fontSize=14,
            alignment=1,
        )
        return [
            Paragraph(f"{club_name} Meeting Minutes", style),
            Spacer(1, 0.1 * inch),
        ]

    def meeting_details(self, meeting, styles):
        def fmt(time):
            return time.strftime("%I:%M %p") if time else "N/A"

        data = [
            ["Date:", meeting.date],
            ["Time:", f"{fmt(meeting.start_time)} - {fmt(meeting.end_time)}"],
            ["Venue:", meeting.venue],
            ["Agenda:", meeting.agenda or "Not specified"],
            ["Highlights:", meeting.highlights or "Not specified"],
        ]

        table = Table(data, colWidths=[1.5 * inch, 4 * inch])
        table.setStyle(self.base_table_style())

        return [table, Spacer(1, 0.25 * inch)]

    def attendance_section(self, attendance, styles):
        rows = [["Name", "Roll No", "Status"]]

        for record in attendance:
            student = getattr(record.user, "student", None)
            rows.append([
                record.user.get_full_name(),
                getattr(student, "roll_no", "N/A"),
                record.status,
            ])

        if len(rows) == 1:
            return [Paragraph("No attendance records found.", styles["body"])]

        table = Table(rows, colWidths=[2.5 * inch, 1.5 * inch, 1 * inch])
        table.setStyle(self.attendance_table_style())

        return [
            Paragraph("Attendance Record", styles["heading"]),
            Spacer(1, 0.1 * inch),
            table,
        ]

    def summary_section(self, attendance, styles):
        summary = (
            f"<b>Summary:</b> "
            f"Present: {attendance.filter(status='PRESENT').count()}, "
            f"Absent: {attendance.filter(status='ABSENT').count()}, "
            f"Leave: {attendance.filter(status='LEAVE').count()}, "
            f"Total: {attendance.count()}"
        )
        return [Spacer(1, 0.25 * inch), Paragraph(summary, styles["body"])]

    def footer(self, styles):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        return [
            Spacer(1, 0.5 * inch),
            Paragraph(f"Generated on: {timestamp}", styles["footer"]),
        ]

    def base_table_style(self):
        return TableStyle([
            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ])

    def attendance_table_style(self):
        return TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.black),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("GRID", (0, 0), (-1, -1), 1, colors.grey),
        ])

    def add_header(self, canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica-Bold", 16)
        canvas.drawCentredString(
            doc.pagesize[0] / 2,
            doc.pagesize[1] - 0.6 * inch,
            "ASSOCIATION FOR COMPUTING MACHINERY",
        )
        canvas.restoreState()

    def build_response(self, buffer, date):
        buffer.seek(0)
        response = HttpResponse(buffer, content_type="application/pdf")
        response["Content-Disposition"] = (
            f'attachment; filename="acm_meeting_minutes_{date}.pdf"'
        )
        return response