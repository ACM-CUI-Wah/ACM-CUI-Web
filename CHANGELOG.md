# CHANGELOG

This document tracks all changes made to the CodeHub - ACM Society Management website.

## Project Overview

**CodeHub** is a full-stack web application for managing ACM university club operations including members, events, attendance, blogs, and financial bills.

- **Frontend:** React 19 with Vite
- **Backend:** Django 5.2 REST API
- **Database:** PostgreSQL via Supabase

---

## Recent Changes (Current Branch: `fakhir`)

### Latest Commits

| Commit | Description |
|--------|-------------|
| `55db6ea` | Complete dashboard rewrite with responsive design |
| `91aa887` | Fixed dropdown |
| `b7060bd` | Fixed dropdown |
| `de699dc` | Update README with frontend setup instructions |

---

## Feature History

### Dashboard & UI
- Complete dashboard rewrite with responsive design
- Profile menu component added
- Responsive page layouts
- New animations + Members on Team page
- Theme toggle (dark mode) support

### Authentication System
- Multi-field authentication (username, email, or roll_no)
- JWT-based password reset flow
- OTP request functionality
- Login/Signup alert validations
- Password sent to registered user through email

### Member Management
- Track members page with member cards
- Edit member modal
- View member profile modal
- Phone number field added for users
- Profile picture and description fields
- Club-based member organization
- Lead can only register users of their club

### Attendance System
- Meeting and attendance management
- Mark attendance functionality
- Attendance charts and tables
- Edit attendance page
- View meeting details
- Meeting PDF report generation

### Blog System
- Blog grid and blog cards
- Article editor with rich text (React Quill)
- Inline image uploads
- Blog edit and delete with alerts
- My blogs page
- Admin blog management

### Events Management
- Events list page
- Create event page
- Event detail page with images
- Event image management
- Normal users can read events

### Bills Management
- Bills list page
- Create bill page
- Bill detail page
- Treasurer role for bill management
- Bill image proof uploads

### Backend Features
- Django REST Framework API
- Token + JWT authentication
- Role-based permissions (Student, Lead, Admin, Treasurer)
- CORS configuration
- API documentation with Swagger UI and ReDoc
- PostgreSQL database via Supabase

---

## Database Models

| Model | Description |
|-------|-------------|
| `User` | Custom user with roles (STUDENT, LEAD, ADMIN) |
| `Student` | Extended user profile with roll_no, club, title, profile_pic |
| `Blog` | Blog posts with title, content, author |
| `BlogImage` | Images associated with blogs |
| `InlineImage` | Temporary inline images for editor |
| `Meeting` | Meeting/event tracking with date, time, venue |
| `MeetingAttendance` | Attendance records (PRESENT/ABSENT/LEAVE) |
| `Event` | Organization events |
| `EventImage` | Event images |
| `Bill` | Financial records with image proof |

---

## File Structure Overview

```
codehub-website/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Auth/            # Login, Register, OTP, Reset
│   │   │   ├── LandingPage/     # Hero, Navbar, Blog, Events, etc.
│   │   │   ├── dashboard/       # Sidebar navigation
│   │   │   ├── members/         # Member cards and modals
│   │   │   ├── teams/           # Team sections
│   │   │   ├── Blogs/           # Blog components and editor
│   │   │   ├── Attendance/      # Attendance forms and tables
│   │   │   └── Footer/          # Footer component
│   │   ├── pages/               # Page components
│   │   │   ├── Landing/         # Landing page
│   │   │   ├── Auth/            # Login and Register pages
│   │   │   ├── DashboardPage/   # Dashboard
│   │   │   ├── Members/         # Members management
│   │   │   ├── Attendance/      # Attendance pages
│   │   │   ├── BlogPages/       # Blog pages
│   │   │   ├── Events/          # Events pages
│   │   │   ├── Bills/           # Bills pages
│   │   │   └── Profile/         # Profile pages
│   │   ├── store/               # Zustand state management
│   │   │   ├── authStore.js     # Authentication state
│   │   │   ├── useAttendanceStore.js
│   │   │   └── useArticleStore.js
│   │   ├── axios.js             # API client configuration
│   │   └── App.jsx              # Main routing
│   └── package.json
│
├── backend/                     # Django backend
│   ├── api/                     # Main API app
│   │   ├── models.py            # Database models
│   │   ├── views.py             # API endpoints
│   │   ├── serializers.py       # Data serialization
│   │   ├── permissions.py       # Role-based access
│   │   ├── urls.py              # API routing
│   │   └── migrations/          # Database migrations (18 files)
│   ├── backend/                 # Django settings
│   │   ├── settings.py          # Configuration (Supabase, auth, etc.)
│   │   ├── urls.py              # Main URL routing
│   │   └── auth_backends.py     # Custom authentication
│   ├── media/                   # Uploaded files
│   │   ├── profile_pics/
│   │   ├── blog_images/
│   │   ├── events/
│   │   ├── bills/
│   │   └── temp_inline/
│   ├── manage.py
│   └── requirements.txt
│
├── docs/                        # Documentation
├── design/                      # Design assets
├── CHANGELOG.md                 # This file
├── SUPABASE_SETUP.md           # Supabase configuration guide
└── README.md                    # Project documentation
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup/` | User registration |
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/otp/` | Request OTP |
| PUT | `/api/auth/password/reset` | Reset password |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students/` | List students (LEAD/ADMIN) |
| GET | `/api/students/public/` | Public student info |
| GET/PATCH/DELETE | `/api/students/<id>` | Student CRUD |

### Blogs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blogs/` | List blogs |
| POST | `/api/blogs/upload/` | Create blog |
| PUT | `/api/blogs/<id>/edit/` | Edit blog |
| DELETE | `/api/blogs/<id>/delete/` | Delete blog |

### Meetings & Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meetings/` | List meetings |
| POST | `/api/meetings/create/` | Create meeting |
| GET/PUT/PATCH/DELETE | `/api/meetings/<id>/` | Meeting CRUD |
| GET | `/api/meetings/<id>/attendance/` | List attendance |
| GET | `/api/meetings/<id>/pdf/` | Generate PDF report |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/events/` | List/create events |
| GET/PUT/PATCH/DELETE | `/api/events/<id>/` | Event CRUD |

### Bills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/bills/` | List/create bills |
| GET/PUT/PATCH/DELETE | `/api/bills/<id>/` | Bill CRUD |

### API Documentation
| Endpoint | Description |
|----------|-------------|
| `/api/schema/swagger-ui/` | Interactive API docs |
| `/api/schema/redoc/` | ReDoc documentation |

---

## Configuration Files

| File | Purpose |
|------|---------|
| `backend/backend/settings.py` | Django settings, database config |
| `frontend/src/axios.js` | API client base URL |
| `frontend/package.json` | Frontend dependencies |
| `backend/requirements.txt` | Backend dependencies |

---

## Commits History (Chronological)

1. Initial project setup
2. User authentication system
3. Blog system with images
4. Meeting and attendance management
5. Events management
6. Bills management for treasurer
7. Phone number field for users
8. Profile pictures and descriptions
9. Role-based permissions
10. CORS configuration
11. Password reset via email
12. Responsive dashboard rewrite

---

## Known Configuration

### Current Supabase Project
- **Host:** `aws-1-ap-southeast-1.pooler.supabase.com`
- **Port:** `6543`
- **Database:** `postgres`
- **Project ID:** `nicwsajhxfynxflfklti`

See `SUPABASE_SETUP.md` for complete configuration guide.

---

*Last updated: January 2026*
