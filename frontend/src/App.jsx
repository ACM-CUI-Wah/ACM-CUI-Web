import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import "./styles/Layout.css";

// Pages
import LandingPage from "./pages/Landing/LandingPage.jsx";
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";
import ContactPage from "./pages/Contact/ContactPage.jsx";
import MissionPage from "./pages/MissionPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import AchievementPage from "./pages/AchievementPage.jsx";

// Blog Pages
import AdminBlogPage from "./pages/BlogPages/AdminBlogPage.jsx";
import BlogListingPage from "./pages/BlogPages/BlogListingPage.jsx";
import SinglePostPage from "./pages/BlogPages/SinglePostPage.jsx";
import ArticlePage from "./pages/BlogPages/ArticlePage.jsx";
import MyBlogPage from "./pages/BlogPages/MyBlogPage.jsx";
import EditBlogWrapper from "./components/Blogs/EditBlogWrapper.jsx";

// Auth
import LoginPage from "./pages/Auth/LoginPage.jsx";
import RegPage from "./pages/Auth/RegPage.jsx";
import ReqOTP from "./components/Auth/ReqOTP.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";

// Attendance
import MeetingList from "./pages/Attendance/MeetingList.jsx";
import MarkAttendance from "./pages/Attendance/MarkAttendance.jsx";
import ViewAttendancePage from "./pages/Attendance/ViewAttendancePage.jsx";
import EditAttendancePage from "./pages/Attendance/EditAttendancePage.jsx";

// Members
import TrackMembersPage from "./pages/Members/TrackMembersPage.jsx";
import MemberProfile from "./components/members/MemberProfile.jsx";

// Profile
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import ViewProfilePage from "./pages/Profile/ViewProfilePage.jsx";

// Events
import EventsListPage from "./pages/Events/EventsListPage.jsx";
import EventCreatePage from "./pages/Events/EventsCreatePage.jsx";
import EventDetailPage from "./pages/Events/EventDetailPage.jsx";

// Recruitment
import RecruitmentPage from "./pages/Recruitment/RecruitmentPage.jsx";
import RecruitmentForm from "./pages/Recruitment/RecruitmentForm.jsx";
import ApplicationSubmitted from "./pages/Recruitment/ApplicationSubmitted.jsx";
import RecruitmentManagement from "./pages/Recruitment/RecruitmentManagement.jsx";

// Management
import HackathonManagement from "./pages/Hackathon/HackathonManagement.jsx";

// Bills
import BillsListPage from "./pages/Bills/BillsListPage.jsx";
import CreateBillPage from "./pages/Bills/CreateBillPage.jsx";
import BillDetailPage from "./pages/Bills/BillDetailPage.jsx";

// Components
import Footer from "./components/Footer/Footer.jsx";
import TeamSection from "./components/teams/TeamSection.jsx";
import EventDashboard from "./pages/Events/EventDashboard.jsx";

// 🔁 Dashboard redirect based on role
const DashboardRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "ADMIN" || role === "LEAD") {
      navigate("/dashboard/members", { replace: true });
    } else {
      navigate("/dashboard/blogs", { replace: true });
    }
  }, [navigate]);

  return null;
};

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  return (
    <Router>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<><LoginPage /><Footer /></>} />
        <Route path="/contact" element={<><ContactPage /><Footer /></>} />
        <Route path="/mission" element={<><MissionPage /><Footer /></>} />

        {/* ✅ FIXED EVENTS ROUTES */}
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:id" element={<><EventDetailPage /><Footer /></>} />

        {/* Recruitment */}
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/recruitmentForm" element={<RecruitmentForm />} />
        <Route path="/recruitment/submitted" element={<ApplicationSubmitted />} />

        {/* Blogs */}
        <Route path="/blogs" element={<BlogListingPage />} />
        <Route path="/blog/:id" element={<><SinglePostPage /><Footer /></>} />
        <Route path="/blogs/:id/edit" element={<><EditBlogWrapper /><Footer /></>} />

        {/* Teams */}
        <Route path="/teams" element={<><TeamSection /><Footer /></>} />
        <Route path="/team/:title" element={<><TeamPage /><Footer /></>} />

        {/* Achievements */}
        <Route path="/achievement" element={<><AchievementPage /><Footer /></>} />

        {/* ================= DASHBOARD ================= */}
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<DashboardRedirect />} />

          {/* Members */}
          <Route path="members" element={<TrackMembersPage />} />
          <Route path="member/:id" element={<MemberProfile />} />

          {/* Blogs */}
          <Route path="blogs" element={<BlogListingPage />} />
          <Route path="admin-blogs" element={<AdminBlogPage />} />
          <Route path="myblog" element={<MyBlogPage />} />
          <Route path="article" element={<ArticlePage />} />

          {/* Profile */}
          <Route path="edit-profile" element={<ProfilePage />} />
          <Route path="view-profile" element={<ViewProfilePage />} />

          {/* Attendance */}
          <Route path="mark-attendance" element={<MarkAttendance />} />
          <Route path="meeting-history" element={<MeetingList />} />
          <Route path="meetings/:id" element={<ViewAttendancePage />} />
          <Route path="meetings/:id/edit" element={<EditAttendancePage />} />

          {/* Auth */}
          <Route path="signup" element={<RegPage />} />
          <Route path="otp" element={<ReqOTP />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Bills */}
          <Route path="bills" element={<BillsListPage />} />
          <Route path="bills/create" element={<CreateBillPage />} />
          <Route path="bills/:id" element={<BillDetailPage />} />

          {/* Management */}
          <Route path="recruitment" element={<RecruitmentManagement />} />
          <Route path="hackathon" element={<HackathonManagement />} />

          {/* Events inside dashboard */}
          <Route path="events" element={<EventsListPage />} />
          <Route path="events/create" element={<EventCreatePage />} />
          <Route path="events/management" element={<EventDashboard/>} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
