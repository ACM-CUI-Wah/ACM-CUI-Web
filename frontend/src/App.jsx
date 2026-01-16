import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

import "./styles/Layout.css";

import LandingPage from "./pages/Landing/LandingPage.jsx";
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";

import AdminBlogPage from "./pages/BlogPages/AdminBlogPage.jsx";
import BlogListingPage from "./pages/BlogPages/BlogListingPage.jsx";
import SinglePostPage from "./pages/BlogPages/SinglePostPage.jsx";
import ArticlePage from "./pages/BlogPages/ArticlePage.jsx";
import MyBlogPage from "./pages/BlogPages/MyBlogPage.jsx";

import RegPage from "./pages/Auth/RegPage.jsx";
import LoginPage from "./pages/Auth/LoginPage.jsx";
import ReqOTP from "./components/Auth/ReqOTP.jsx";
import ResetPassword from "./components/Auth/ResetPassword.jsx";

import EditBlogWrapper from "./components/Blogs/EditBlogWrapper.jsx";

import MeetingList from "./pages/Attendance/MeetingList.jsx";
import MarkAttendance from "./pages/Attendance/MarkAttendance.jsx";
import ViewAttendancePage from "./pages/Attendance/ViewAttendancePage.jsx";
import EditAttendancePage from "./pages/Attendance/EditAttendancePage.jsx";

import TrackMembersPage from "./pages/Members/TrackMembersPage.jsx";
import TeamPage from "./pages/TeamPage.jsx";
import MissionPage from "./pages/MissionPage.jsx";
import TeamSection from "./components/teams/TeamSection.jsx";
import ContactPage from "./pages/Contact/ContactPage.jsx";

import ViewProfilePage from "./pages/Profile/ViewProfilePage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";

import EventsListPage from "./pages/Events/EventsListPage.jsx";
import EventCreatePage from "./pages/Events/EventsCreatePage.jsx";
import EventDetailPage from "./pages/Events/EventDetailPage.jsx";

import Footer from "./components/Footer/Footer.jsx";
import AchievementPage from "./pages/AchievementPage.jsx";
import BillsListPage from "./pages/Bills/BillsListPage.jsx";
import CreateBillPage from "./pages/Bills/CreateBillPage.jsx";
import BillDetailPage from "./pages/Bills/BillDetailPage.jsx";
import MemberProfile from "./components/members/MemberProfile.jsx";
import ApplicationSubmitted from "./pages/Recruitment/ApplicationSubmitted.jsx";
import RecruitmentManagement from "./pages/Recruitment/RecruitmentManagement.jsx";
import HackathonManagement from "./pages/Hackathon/HackathonManagement.jsx";
import StudentWeekManagement from "./pages/StudentWeek/StudentWeekManagement.jsx";

// Redirect component for dashboard based on role
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
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  const handleLogin = (role) => {
    setRole(role);
  };

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
  };

  return (
    <Router>
      <Routes>

        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={<><LoginPage /><Footer /></>} />

        <Route path="/contact" element={<><ContactPage /><Footer /></>} />
        <Route path="/mission" element={<><MissionPage /><Footer /></>} />
        <Route path="/recruitment/submitted" element={<ApplicationSubmitted />} />
        <Route path="/member/:id" element={<MemberProfile />} />
        <Route path="/blogs" element={<BlogListingPage />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />}>
          <Route index element={<DashboardRedirect />} />
          <Route path="bills" element={<BillsListPage />} />
          <Route path="bills/create" element={<CreateBillPage />} />
          <Route path="bills/:id" element={<BillDetailPage />} />
          <Route path="mark-attendance" element={<MarkAttendance />} />
          <Route path="meeting-history" element={<MeetingList />} />
          <Route path="meetings/:id" element={<ViewAttendancePage />} />
          <Route path="meetings/:id/edit" element={<EditAttendancePage />} />

          <Route path="otp" element={<ReqOTP />} />
          <Route path="reset-password" element={<ResetPassword />} />

          <Route path="members" element={<TrackMembersPage />} />
          <Route path="signup" element={<RegPage />} />
          <Route path="recruitment" element={<RecruitmentManagement />} />
          <Route path="hackathon" element={<HackathonManagement />} />
          <Route path="student-week" element={<StudentWeekManagement />} />

          {/* Blogs */}
          <Route path="blogs" element={<BlogListingPage />} />
          <Route path="admin-blogs" element={<AdminBlogPage />} />
          <Route path="myblog" element={<MyBlogPage />} />
          <Route path="article" element={<ArticlePage />} />

          {/* Profile */}
          <Route path="edit-profile" element={<ProfilePage />} />
          <Route path="view-profile" element={<ViewProfilePage />} />

          {/* Events */}
          <Route path="events" element={<EventsListPage />} />
          <Route path="events/create" element={<EventCreatePage />} />
        </Route>

        {/* Public Routes */}
        <Route path="/teams" element={<><TeamSection /><Footer /></>} />
        <Route path="/blog/:id" element={<><SinglePostPage /><Footer /></>} />
        <Route path="/blogs/:id/edit" element={<><EditBlogWrapper /><Footer /></>} />
        <Route path="/events/:id" element={<><EventDetailPage /><Footer /></>} />
        <Route path="/team/:title" element={<><TeamPage /><Footer /></>} />
        <Route path="/achievement" element={<><AchievementPage /><Footer /></>} />

      </Routes>
    </Router>

  );

}

export default App;