from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import (
    SignupView, OTPView, LoginView, PasswordChangeView, LogoutView,
    BlogUploadView, BlogListAPIView, BlogEditView, BlogDeleteView,
    MeetingRUDView, MeetingCreateView, MeetingListView, MeetingAttendanceListView,
    MeetingAttendanceRUDView, StudentsListView, StudentRUView, MeetingPDFView,
    api_root, AdminRUDView,
    PublicStudentsListView, BillListCreateView, BillRUDView, InlineImageUploadView,

    # Recruitment Views
    ActiveRecruitmentSessionView,
    ApplicationSubmitView,
    RecruitmentSessionViewSet,
    ApplicationReviewViewSet,
    ApplicationStatusUpdateViewSet,
    RecruitmentApplicationsExcelView,

    # Event Views
    EventDetailView,
    EventTypeListCreateView,
    EventListCreateView,
    EventRegistrationListCreateView,
    RegistrationStatusUpdateView,
    EventRegistrationDeleteView,
    EventRegistrationDetailView,
)

# NOTE: 'RUD' stands for Read, Update, Delete ops

# -------------------
# Recruitment Router 
# -------------------
recruitment_router = DefaultRouter()
recruitment_router.register(r'recruitment-sessions', RecruitmentSessionViewSet, basename='recruitment-sessions')
recruitment_router.register(r'application-review', ApplicationReviewViewSet, basename='application-review')
recruitment_router.register(r'application-status', ApplicationStatusUpdateViewSet, basename='application-status')

urlpatterns = [
    # Root
    path('', api_root, name='home'),

    # Authentication
    path('auth/signup/', SignupView.as_view(), name='signup'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout', LogoutView.as_view(), name='logout'),
    path('auth/otp/', OTPView.as_view(), name='otp'),
    path('auth/password/reset', PasswordChangeView.as_view(), name='reset-password'),

    # Students (except creation)
    path('students/', StudentsListView.as_view(), name='students-list'),
    path("students/public/", PublicStudentsListView.as_view(), name="public-students"),
    path('students/<int:pk>', StudentRUView.as_view(), name='student-RU'),

    # Admins
    path('admin/<int:pk>', AdminRUDView.as_view(), name='admin-RUD'),

    # Blogs
    path('blogs/', BlogListAPIView.as_view(), name='blog-list'),
    path('blogs/upload/', BlogUploadView.as_view(), name='blog-upload'),
    path('blogs/<int:pk>/edit/', BlogEditView.as_view(), name='blog-edit'),
    path('blogs/<int:pk>/delete/', BlogDeleteView.as_view(), name='blog-delete'),
    path('blogs/upload-inline-image/', InlineImageUploadView.as_view(), name='inline-image-upload'),

    # Meetings
    path('meetings/', MeetingListView.as_view(), name='meeting.py-list'),
    path('meetings/create/', MeetingCreateView.as_view(), name='meeting.py-create'),
    path('meetings/<int:pk>/', MeetingRUDView.as_view(), name='meeting.py-RUD'),
    path('meetings/<int:pk>/attendance/', MeetingAttendanceListView.as_view(), name='attendance-list'),
    path('meetings/<int:pk>/attendance/<int:att_pk>', MeetingAttendanceRUDView.as_view(), name='attendance-RUD'),
    path("meetings/<int:pk>/pdf/", MeetingPDFView.as_view(), name="meeting.py-pdf"),

    # Bills
    path('bills/', BillListCreateView.as_view(), name='bill-list-create'),
    path('bills/<int:pk>/', BillRUDView.as_view(), name='bill-RUD'),

    # -----------------------------
    # Recruitment URLs
    # -----------------------------
    # Public Recruitment Views
    path('recruitment/active-session/', ActiveRecruitmentSessionView.as_view({'get': 'list'}), name='active-session'),
    path('recruitment/submit-application/', ApplicationSubmitView.as_view({'post': 'create'}),
         name='submit-application'),

    # Admin Recruitment Views (via router)
    path('recruitment/', include(recruitment_router.urls)),
    path("recruitment/export/excel/", RecruitmentApplicationsExcelView.as_view(), name='export-recruitment-excel'),

    # Events
    path('events/', EventListCreateView.as_view(), name='events-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='events-RUD'),
    path('events/types/', EventTypeListCreateView.as_view()),
    path('events/registrations/', EventRegistrationListCreateView.as_view(), name='registration-create'),
    path('events/registrations/<int:pk>/', EventRegistrationDetailView.as_view(), name='registration-detail'),
    path('events/registrations/<int:pk>/delete/', EventRegistrationDeleteView.as_view(), name='registration-delete'),
    path('events/registrations/<int:pk>/status/', RegistrationStatusUpdateView.as_view(),
         name='registration-status-update'),
]
