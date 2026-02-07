import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";
import axiosInstance from "../../axios";
import "./Sidebar.css";

const Sidebar = ({ onNavigate }) => {
  const { role } = useAuthStore();
  const location = useLocation();

  const loggedInUserId = Number(localStorage.getItem("user_id"));
  const studentIdFromLS = localStorage.getItem("student_id");

  const [student, setStudent] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // -----------------------------
  // Fetch student (FIXES student null)
  // -----------------------------
useEffect(() => {
  let mounted = true;

  const fetchStudent = async () => {
    try {
      const studentId = localStorage.getItem("student_id");

      if (!studentId) {
        console.error("student_id missing in localStorage");
        if (mounted) setStudent(null);
        return;
      }

      const res = await axiosInstance.get(`/students/${studentId}`);
      if (mounted) setStudent(res.data);
    } catch (err) {
      console.error("Failed to fetch student:", err?.response?.data || err.message);
      if (mounted) setStudent(null);
    }
  };

  fetchStudent();
  return () => {
    mounted = false;
  };
}, []);

  // -----------------------------
  // Treasurer check (safe)
  // -----------------------------
  const isTreasurer = useMemo(() => {
    return String(student?.title || "").trim().toUpperCase() === "TREASURER";
  }, [student]);

  // -----------------------------
  // UI helpers
  // -----------------------------
  const toggleDropdown = useCallback((name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  }, []);

  const handleLinkClick = useCallback(() => {
    if (onNavigate) onNavigate();
  }, [onNavigate]);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const isGroupActive = useCallback(
    (paths) => paths.some((path) => location.pathname.startsWith(path)),
    [location.pathname]
  );

  const getDashboardTitle = () => {
    switch (role) {
      case "ADMIN":
        return "Admin Dashboard";
      case "LEAD":
        return "Lead Dashboard";
      case "STUDENT":
        return "Student Dashboard";
      default:
        return "Dashboard";
    }
  };

  // Reusable nav link
  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`btn btn-primary ${className} ${isActive(to) ? "active" : ""}`}
      onClick={handleLinkClick}
    >
      {children}
    </Link>
  );

  // Dropdown group
  const DropdownGroup = ({ name, label, children, paths = [] }) => (
    <div className="sidebar-group">
      <button
        className={`btn btn-primary dropdown-toggle-btn ${
          isGroupActive(paths) ? "active" : ""
        }`}
        onClick={() => toggleDropdown(name)}
        aria-expanded={activeDropdown === name}
        type="button"
      >
        <span>{label}</span>
        <span className={`arrow ${activeDropdown === name ? "open" : ""}`}>
          ▼
        </span>
      </button>

      {activeDropdown === name && (
        <div className="dropdown-content">{children}</div>
      )}
    </div>
  );

  // Sub link
  const SubLink = ({ to, children }) => (
    <Link
      to={to}
      className={`btn btn-secondary sub-link ${isActive(to) ? "active" : ""}`}
      onClick={handleLinkClick}
    >
      {children}
    </Link>
  );

  // ✅ Reusable Finance Group
  const FinanceGroup = () => (
    <DropdownGroup name="finance" label="Finance" paths={["/dashboard/bills"]}>
      <SubLink to="/dashboard/bills">View Bills</SubLink>
      <SubLink to="/dashboard/bills/create">Add Bill</SubLink>
    </DropdownGroup>
  );

  // -----------------------------
  // NAVS
  // -----------------------------
  const renderAdminNav = () => (
    <>
      <NavLink to="/dashboard/recruitment">Recruitment</NavLink>
      <NavLink to="/dashboard/events/management">Event Registrations</NavLink>
      <NavLink to="/dashboard/members">Member Management</NavLink>
      <NavLink to="/dashboard/events-list">Events</NavLink>
      <NavLink to="/dashboard/events/create">Create Event</NavLink>
      <NavLink to="/dashboard/signup">Signup New Members</NavLink>
      <NavLink to="/dashboard/otp">Reset Password</NavLink>
    </>
  );

  const renderLeadNav = () => (
    <>
      {/* Attendance Group */}
      <DropdownGroup
        name="attendance"
        label="Attendance"
        paths={["/dashboard/mark-attendance", "/dashboard/meeting-history"]}
      >
        <SubLink to="/dashboard/mark-attendance">Mark Attendance</SubLink>
        <SubLink to="/dashboard/meeting-history">View Attendance</SubLink>
      </DropdownGroup>

      {/* Events Group */}
      <DropdownGroup
        name="events"
        label="Events"
        paths={["/dashboard/events-list", "/dashboard/events/create"]}
      >
        <SubLink to="/dashboard/events-list">All Events</SubLink>
        <SubLink to="/dashboard/events/create">Create Event</SubLink>
        <SubLink to="/dashboard/events/management">Event Registration</SubLink>
      </DropdownGroup>

      {/* Blogs Group */}
      <DropdownGroup
        name="blogs"
        label="Blogs"
        paths={["/dashboard/myblog", "/dashboard/article", "/dashboard/blogs"]}
      >
        <SubLink to="/dashboard/myblog">My BlogPosts</SubLink>
        <SubLink to="/dashboard/article">Post BlogPost</SubLink>
      </DropdownGroup>

      {/* Members Group */}
      <DropdownGroup
        name="members"
        label="Members"
        paths={["/dashboard/members", "/dashboard/signup"]}
      >
        <SubLink to="/dashboard/members">View Members</SubLink>
        <SubLink to="/dashboard/signup">Signup New Member</SubLink>
      </DropdownGroup>

      {/* ✅ Finance should show if LEAD + Treasurer */}
      {isTreasurer && <FinanceGroup />}
    </>
  );

  const renderStudentNav = () => (
    <>
      <NavLink to="/dashboard/article">Post Blog</NavLink>
      <NavLink to="/dashboard/myblog">My BlogPosts</NavLink>
      <NavLink to="/dashboard/events-list">Upcoming Events</NavLink>

   
      {isTreasurer && <FinanceGroup />}
    </>
  );

  const renderNavigation = () => {
    switch (role) {
      case "ADMIN":
        return renderAdminNav();
      case "LEAD":
        return renderLeadNav();
      case "STUDENT":
        return renderStudentNav();
      default:
        return null;
    }
  };

  return (
    <nav className="sidebar" role="navigation" aria-label="Dashboard navigation">
      <h3 className="sidebar-title">{getDashboardTitle()}</h3>

   

      <div className="sidebar-actions">{renderNavigation()}</div>
    </nav>
  );
};

export default Sidebar;
