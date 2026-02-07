import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./styles/Layout.css";

import RequireAuth from "./route/RequireAuth.jsx";

// Pages
import LandingPage from "./pages/Landing/LandingPage.jsx";
import DashboardPage from "./pages/DashboardPage/DashboardPage.jsx";
import ContactPage from "./pages/Contact/ContactPage.jsx";
import CreditsPage from "./pages/Credits/CreditsPage.jsx";
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
import PublicEventListingPage from "./pages/Events/PublicEventListingPage.jsx";
import EventCreatePage from "./pages/Events/EventsCreatePage.jsx";
import EventDetailPage from "./pages/Events/EventDetailPage.jsx";
import EventIndividualForm from "./pages/Events/EventIndividualForm.jsx";
import EventTeamForm from "./pages/Events/EventTeamForm.jsx";

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
import DashboardHome from "./components/dashboard/DashboardHome.jsx";

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
        <Route
          path="/login"
          element={
            <>
              <LoginPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/contact"
          element={
            <>
              <ContactPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/credits"
          element={
            <>
              <CreditsPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/mission"
          element={
            <>
              <MissionPage />
              <Footer />
            </>
          }
        />

        {/* Public Events */}
        <Route path="/events" element={<PublicEventListingPage />} />
        <Route
          path="/events/:id"
          element={
            <>
              <EventDetailPage />
            </>
          }
        />

        {/* Recruitment (public) */}
        <Route path="/recruitment" element={<><RecruitmentPage /><Footer /></>} />
        <Route
          path="/recruitmentForm"
          element={
            <>
              <RecruitmentForm />
              <Footer />
            </>
          }
        />
        <Route path="/recruitment/submitted" element={<ApplicationSubmitted />} />

        {/* Public member profile */}
        <Route path="/member/:id" element={<MemberProfile />} />

        {/* Public Blogs */}
        <Route
          path="/blogs"
          element={
            <>
              <BlogListingPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/blog/:id"
          element={
            <>
              <SinglePostPage />
              <Footer />
            </>
          }
        />
        <Route
          path="/blogs/:id/edit"
          element={
            <>
              <EditBlogWrapper />
              <Footer />
            </>
          }
        />

        {/* Teams */}
        <Route
          path="/teams"
          element={
            <>
              <TeamSection />
              <Footer />
            </>
          }
        />
        <Route
          path="/team/:title"
          element={
            <>
              <TeamPage />
              <Footer />
            </>
          }
        />

        {/* Achievements */}
        <Route
          path="/achievement"
          element={
            <>
              <AchievementPage />
              <Footer />
            </>
          }
        />

        {/* Public event forms (you had these without a leading slash) */}
        <Route path="/events/individualform" element={<EventIndividualForm />} />
        <Route path="/events/teamform" element={<EventTeamForm />} />

        {/* ================= PROTECTED ROUTES ================= */}
        {/* ✅ Everything inside here requires login */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />}>
            <Route index element={<DashboardHome />} />

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

            {/* Auth inside dashboard */}
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
            <Route path="events-list" element={<EventsListPage />} />
            <Route path="events/create" element={<EventCreatePage />} />
            <Route path="events/management" element={<EventDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
