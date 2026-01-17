import React, { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";
import axiosInstance from "../../axios";
import "./Sidebar.css";

const Sidebar = ({ onNavigate }) => {
  const { role } = useAuthStore();
  const location = useLocation();
  const loggedInUserId = parseInt(localStorage.getItem("user_id"));
  const [student, setStudent] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axiosInstance.get("/students/");
        const students = Array.isArray(res.data) ? res.data : [res.data];
        const foundStudent = students.find(
          (s) => s.user && s.user.id === loggedInUserId
        );
        if (foundStudent) setStudent(foundStudent);
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      }
    };

    fetchStudent();
  }, [loggedInUserId]);

  const toggleDropdown = useCallback((name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  }, []);

  const handleLinkClick = useCallback(() => {
    if (onNavigate) {
      onNavigate();
    }
  }, [onNavigate]);

  // Check if path is active
  const isActive = useCallback((path) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Check if any child path is active
  const isGroupActive = useCallback((paths) => {
    return paths.some((path) => location.pathname.startsWith(path));
  }, [location.pathname]);

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

  // Reusable nav link component
  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`btn btn-primary ${className} ${isActive(to) ? "active" : ""}`}
      onClick={handleLinkClick}
    >
      {children}
    </Link>
  );

  // Dropdown component
  const DropdownGroup = ({ name, label, children, paths = [] }) => (
    <div className="sidebar-group">
      <button
        className={`btn btn-primary dropdown-toggle-btn ${isGroupActive(paths) ? "active" : ""}`}
        onClick={() => toggleDropdown(name)}
        aria-expanded={activeDropdown === name}
      >
        <span>{label}</span>
        <span className={`arrow ${activeDropdown === name ? "open" : ""}`}>▼</span>
      </button>

      {activeDropdown === name && (
        <div className="dropdown-content">
          {children}
        </div>
      )}
    </div>
  );

  // Sub link component for dropdowns
  const SubLink = ({ to, children }) => (
    <Link
      to={to}
      className={`btn btn-secondary sub-link ${isActive(to) ? "active" : ""}`}
      onClick={handleLinkClick}
    >
      {children}
    </Link>
  );

  const renderAdminNav = () => (
    <>
      <NavLink to="/dashboard/recruitment">Recruitment</NavLink>
      <NavLink to="/dashboard/hackathon">Hackathon</NavLink>
      <NavLink to="/dashboard/student-week">Student Week</NavLink>
      <NavLink to="/dashboard/members">Member Management</NavLink>
      <NavLink to="/dashboard/blogs">Handle Blogs</NavLink>
      <NavLink to="/dashboard/events">Events</NavLink>
      <NavLink to="/dashboard/events/create">Create Event</NavLink>
      <NavLink to="/dashboard/signup">Signup New Members</NavLink>
      <NavLink to="/dashboard/otp">Reset Password</NavLink>
    </>
  );

  const renderLeadNav = () => {
    const isTreasurer = student?.title?.toUpperCase() === "TREASURER";

    return (
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
          paths={["/dashboard/events"]}
        >
          <SubLink to="/dashboard/events">All Events</SubLink>
          <SubLink to="/dashboard/events/create">Create Event</SubLink>
        </DropdownGroup>

        {/* Blogs Group */}
        <DropdownGroup
          name="blogs"
          label="Blogs"
          paths={["/dashboard/myblog", "/dashboard/article", "/dashboard/blogs"]}
        >
          <SubLink to="/dashboard/myblog">My BlogPosts</SubLink>
          <SubLink to="/dashboard/article">Post BlogPost</SubLink>
          <SubLink to="/dashboard/blogs">All BlogPosts</SubLink>
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

        {/* Finance Group - Treasurer Only */}
        {isTreasurer && (
          <DropdownGroup
            name="finance"
            label="Finance"
            paths={["/dashboard/bills"]}
          >
            <SubLink to="/dashboard/bills">View Bills</SubLink>
            <SubLink to="/dashboard/bills/create">Add Bill</SubLink>
          </DropdownGroup>
        )}
      </>
    );
  };

  const renderStudentNav = () => (
    <>
      <NavLink to="/dashboard/article">Post Blog</NavLink>
      <NavLink to="/dashboard/myblog">My BlogPosts</NavLink>
      <NavLink to="/dashboard/blogs">All Blogs</NavLink>
      <NavLink to="/dashboard/events">Upcoming Events</NavLink>
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
        return (
          <>
            <NavLink to="/dashboard/recruitment">Recruitment</NavLink>
            <NavLink to="/dashboard/hackathon">Hackathon</NavLink>
            <NavLink to="/dashboard/student-week">Student Week</NavLink>
          </>
        );
    }
  };

  return (
    <nav className="sidebar" role="navigation" aria-label="Dashboard navigation">
      <h3 className="sidebar-title">{getDashboardTitle()}</h3>
      <div className="sidebar-actions">
        {renderNavigation()}
      </div>
    </nav>
  );
};

export default Sidebar;
