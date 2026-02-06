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
import os
from django.conf import settings
from reportlab.lib.utils import ImageReader


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
                att['meeting'] = meeting.id
            attendance_serializer = MeetingAttendanceSerializer(many=True, data=attendance_data)
            if attendance_serializer.is_valid():
                attendance_serializer.save()
                return Response({
                    'status': 'success',
                    'message': 'Data created',
                    'data': None
                }, status.HTTP_201_CREATED)
            else:
                return Response({
                'status': 'error',
                'message': attendance_serializer.errors,  
                'data': None
            }, status.HTTP_400_BAD_REQUEST)
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
        try:
            meeting = Meeting.objects.get(pk=pk)
        except Meeting.DoesNotExist:
            return Response(
                {"status": "error", "message": "Meeting not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        if request.user.role == 'LEAD' and hasattr(request.user, 'student'):
            club = request.user.student.club
            attendance = MeetingAttendance.objects.filter(
                meeting=meeting,
                user__student__club=club
            ).select_related('user')
        else:
            attendance = MeetingAttendance.objects.filter(
                meeting=meeting
            ).select_related('user')

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=120,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()
        elements = []

        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            alignment=1,
            textColor=colors.HexColor('#2c3e50'),
            spaceAfter=20
        )

        heading_style = ParagraphStyle(
            'Heading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            textColor=colors.HexColor('#34495e'),
            spaceAfter=10
        )

        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#2c3e50')
        )

        cell_style = ParagraphStyle(
            'Cell',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            wordWrap='CJK',  
            textColor=colors.HexColor('#2c3e50')
        )

        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            alignment=1,
            textColor=colors.HexColor('#7f8c8d')
        )

        elements.append(Paragraph("Minutes of ACM Meeting", title_style))

        if request.user.role != 'ADMIN' and hasattr(request.user, 'student'):
            club_name = request.user.student.club.replace('_', ' ').title()
            elements.append(Paragraph(f"{club_name} Meeting Minutes", heading_style))

        elements.append(Spacer(1, 0.2 * inch))

        def to_12h(t):
            return t.strftime('%I:%M %p') if t else "N/A"
        def format_multiline_text(text):
            if not text:
                return "Not specified"

            lines = text.splitlines()
            formatted_lines = []

            for line in lines:
                line = line.strip()
                if line.startswith(('-', '*')):
                    formatted_lines.append(f"• {line[1:].strip()}")
                elif line.startswith('•'):
                    formatted_lines.append(line)
                else:
                    formatted_lines.append(line)

            return "<br/>".join(formatted_lines)
        def t12(time_obj):
            return time_obj.strftime('%I:%M %p') if time_obj else "N/A"

        meeting_data = [
        ["Date:", Paragraph(str(meeting.date), cell_style)],
        ["Time:", Paragraph(f"{t12(meeting.start_time)} - {t12(meeting.end_time)}", cell_style)],
        ["Venue:", Paragraph(meeting.venue or "N/A", cell_style)],
        ["Agenda:", Paragraph(format_multiline_text(meeting.agenda), cell_style)],
        ["Highlights:", Paragraph(format_multiline_text(meeting.highlights), cell_style)],
    ]


        meeting_table = Table(
            meeting_data,
            colWidths=[1.4 * inch, doc.width - 1.4 * inch]
        )

        meeting_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dcdcdc')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f1f3f5')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(meeting_table)
        elements.append(Spacer(1, 0.3 * inch))

        elements.append(Paragraph("Attendance Record", heading_style))

        attendance_data = [["Name", "Roll No", "Status"]]
        for record in attendance:
            roll = getattr(record.user.student, 'roll_no', "N/A") if hasattr(record.user, 'student') else "N/A"
            attendance_data.append([
                record.user.get_full_name(),
                roll,
                record.status
            ])

        attendance_table = Table(
            attendance_data,
            colWidths=[2.8 * inch, 1.5 * inch, 1.2 * inch]
        )

        attendance_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dee2e6')),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
        ]))

        elements.append(attendance_table)
        elements.append(Spacer(1, 0.3 * inch))

        summary = (
            f"<b>Summary:</b> "
            f"Present: {attendance.filter(status='PRESENT').count()}, "
            f"Absent: {attendance.filter(status='ABSENT').count()}, "
            f"Leave: {attendance.filter(status='LEAVE').count()}, "
            f"Total: {attendance.count()}"
        )

        elements.append(Paragraph(summary, body_style))
        elements.append(Spacer(1, 0.4 * inch))

        elements.append(Paragraph(
            f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            footer_style
        ))

        def add_header(canvas, doc):
            canvas.saveState()
            width, height = doc.pagesize

            canvas.setFillColor(colors.white)
            canvas.rect(0, height - 1.2 * inch, width, 1.2 * inch, fill=1, stroke=0)

            logo_path = os.path.join(
                settings.BASE_DIR,
                'assets',
                'acm_logo.png'
            )

            logo_x = 50
            logo_width = 0

            if os.path.isfile(logo_path):
                logo = ImageReader(logo_path)
                logo_size = 1 * inch
                canvas.drawImage(
                    logo,
                    logo_x,
                    height - 1.1 * inch,
                    width=logo_size,
                    height=logo_size,
                    preserveAspectRatio=True,
                    mask='auto'
                )
                logo_width = logo_size

            text_x = logo_x + logo_width + 15

            canvas.setFont('Helvetica-Bold', 16)
            canvas.setFillColor(colors.HexColor('#2c3e50'))
            canvas.drawString(text_x, height - 0.6 * inch, "ASSOCIATION FOR COMPUTING MACHINERY")

            canvas.setFont('Helvetica', 10)
            canvas.drawString(text_x, height - 0.8 * inch, "COMSATS University Islamabad, Wah Chapter")

            canvas.setStrokeColor(colors.HexColor('#dcdcdc'))
            canvas.line(0.5 * inch, height - 1.2 * inch, width - 0.5 * inch, height - 1.2 * inch)

            canvas.restoreState()

        doc.build(elements, onFirstPage=add_header)

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="acm_meeting_minutes_{meeting.date}.pdf"'
        return response