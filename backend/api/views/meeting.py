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
            return Response({
                "status": "error",
                "message": "Meeting not found",
                "data": None
            }, status=status.HTTP_404_NOT_FOUND)

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
            bottomMargin=30
        )

        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            spaceAfter=20,
            alignment=1,
            textColor=colors.HexColor('#2c3e50')
        )

        heading_style = ParagraphStyle(
            'HeadingStyle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            spaceAfter=10,
            textColor=colors.HexColor('#34495e')
        )

        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            textColor=colors.HexColor('#2c3e50')
        )

        footer_style = ParagraphStyle(
            'FooterStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=8,
            textColor=colors.HexColor('#7f8c8d'),
            alignment=1
        )

        elements.append(Paragraph("Minutes of ACM Meeting", title_style))
        elements.append(Spacer(1, 0.1 * inch))

        if request.user.role != 'ADMIN' and hasattr(request.user, 'student'):
            club_name = request.user.student.club.replace('_', ' ').title()
            club_style = ParagraphStyle(
                'ClubStyle',
                parent=styles['Heading2'],
                fontName='Helvetica-Bold',
                fontSize=14,
                spaceAfter=10,
                alignment=1,
                textColor=colors.HexColor('#2c3e50')
            )
            elements.append(Paragraph(f"{club_name} Meeting Minutes", club_style))
            elements.append(Spacer(1, 0.1 * inch))

        
        def convert_to_12h(time_obj):
            return time_obj.strftime('%I:%M %p') if time_obj else "N/A"

        meeting_data = [
            ["Date:", str(meeting.date)],
            ["Time:", f"{convert_to_12h(meeting.start_time)} - {convert_to_12h(meeting.end_time)}"],
            ["Venue:", meeting.venue],
            ["Agenda:", meeting.agenda or "Not specified"],
            ["Highlights:", meeting.highlights or "Not specified"]
        ]

        meeting_table = Table(meeting_data, colWidths=[1.5 * inch, 4 * inch])
        meeting_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ecf0f1')),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#2c3e50')),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ]))
        elements.append(meeting_table)
        elements.append(Spacer(1, 0.25 * inch))

        elements.append(Paragraph("Attendance Record", heading_style))
        elements.append(Spacer(1, 0.1 * inch))

        attendance_data = [["Name", "Roll No", "Status"]]
        for record in attendance:
            try:
                roll_no = record.user.student.roll_no
            except:
                roll_no = "N/A"
            attendance_data.append([
                f"{record.user.first_name} {record.user.last_name}",
                roll_no,
                record.status
            ])

        if len(attendance_data) > 1:
            attendance_table = Table(attendance_data, colWidths=[2.5*inch, 1.5*inch, 1*inch])
            attendance_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dee2e6')),
            ]))
            elements.append(attendance_table)
        else:
            elements.append(Paragraph("No attendance records found.", body_style))

        elements.append(Spacer(1, 0.25 * inch))

    
        present_count = attendance.filter(status='PRESENT').count()
        absent_count = attendance.filter(status='ABSENT').count()
        leave_count = attendance.filter(status='LEAVE').count()
        summary_text = f"<b>Summary:</b> Present: {present_count}, Absent: {absent_count}, Leave: {leave_count}, Total: {attendance.count()}"
        elements.append(Paragraph(summary_text, body_style))

        
        elements.append(Spacer(1, 0.5*inch))
        generated_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        elements.append(Paragraph(f"Generated on: {generated_date}", footer_style))

        def add_header(canvas, doc):
            canvas.saveState()
            width, height = doc.pagesize

            
            canvas.setFillColor(colors.HexColor('#ffffff'))
            canvas.rect(0, height - 1.2*inch, width, 1.2*inch, fill=1, stroke=0)

            
            logo_path = os.path.join(settings.BASE_DIR, 'assets', 'acm_logo.png')
            logo_width = 0
            logo_x = 50
            if os.path.exists(logo_path):
                try:
                    logo = ImageReader(logo_path)
                    logo_size = 1*inch
                    logo_y = height - 1.1*inch
                    canvas.drawImage(logo, logo_x, logo_y, width=logo_size, height=logo_size, preserveAspectRatio=True)
                    logo_width = logo_size
                except Exception as e:
                    print(f"Error loading logo: {e}")


            text_start_x = logo_x + logo_width + 0.2*inch
            canvas.setFillColor(colors.HexColor('#2c3e50'))
            canvas.setFont('Helvetica-Bold', 16)
            canvas.drawString(text_start_x, height - 0.6*inch, "ASSOCIATION FOR COMPUTING MACHINERY")

            canvas.setFont('Helvetica', 10)
            canvas.drawString(text_start_x + 0.2*inch, height - 0.8*inch, "COMSATS University Islamabad, Wah Chapter")

        
            canvas.setStrokeColor(colors.HexColor('#bdc3c7'))
            canvas.setLineWidth(1)
            canvas.line(0.5*inch, height - 1.2*inch, width - 0.5*inch, height - 1.2*inch)

            canvas.restoreState()

        doc.build(elements, onFirstPage=add_header)

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="acm_meeting_minutes_{meeting.date}.pdf"'
        return response