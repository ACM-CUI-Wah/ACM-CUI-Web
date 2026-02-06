import React, { useState, useEffect } from "react";
import {
  Navbar as BootstrapNavbar,
  Nav,
  Container,
  Form,
  Button
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BsSearch, BsList } from "react-icons/bs";
import "./Navbar.css";
import useAuthStore from "../../store/authStore";
import ProfileOptions from "../ProfileOptions/ProfileOptions";
import axiosInstance from "../../axios";

const Navbar = ({ onMenuClick, showMenuButton }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Show search bar ONLY on this route
  const showSearchBar = location.pathname === "/dashboard/blogs";

  const { token } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    if (!token || !studentId) return;

    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get(`/students/${studentId}`);
        const user = res.data;
        if (user && user.profile_pic) setProfilePic(user.profile_pic);
      } catch (err) {
        console.error("Failed to fetch student profile:", err);
      }
    };

    fetchProfile();
  }, [token, studentId]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const [blogsRes, eventsRes] = await Promise.all([
        axiosInstance.get(`/blogs/?search=${query}`),
        axiosInstance.get(`/events/?search=${query}`)
      ]);

      const results = [
        ...blogsRes.data.map((b) => ({ id: b.id, title: b.title, type: "blog" })),
        ...eventsRes.data.map((ev) => ({ id: ev.id, title: ev.title, type: "event" }))
      ];

      setSearchResults(results);
      setShowDropdown(true);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleResultClick = (result) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(result.type === "blog" ? `/blog/${result.id}` : `/events/${result.id}`);
  };

 const renderAuthButtons = () => {
  if (!token) {
    return (
      <Link
        to="/login"
        className="login-link px-4 py-2 ms-lg-3 fw-semibold"
        style={{ backgroundColor: "#ffffff", cursor: "pointer", textDecoration: "none" }}
      >
        Login
      </Link>
    );
  }

  return (
    <div className="profile-wrapper position-relative">
      <Button
        variant="light"
        className="login-link px-0 py-0 ms-lg-3"
        style={{ backgroundColor: "transparent", border: "none" }}
        onClick={() => setShowOptions((v) => !v)}
      >
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            className="navbar-profile-pic"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#ccc"
            }}
          />
        )}
      </Button>

      {showOptions && (
        <div className="profile-dropdown">
          <ProfileOptions navigate={navigate} />
        </div>
      )}
    </div>
  );
};


  return (
    <BootstrapNavbar expand="lg" className="custom-navbar1 shadow-sm">
      <Container fluid className="navbar-container">
        {/* Logo */}
        <BootstrapNavbar.Brand
          as={Link}
          to="/"
          className="d-none d-lg-flex align-items-center text-white fw-bold navbar-brand-custom"
        >
          <img
            src="/acm-comsats-wah-chapter.png"
            alt="ACM Logo"
            className="navbar-logo"
          />
          <span className="ms-2 navbar-brand-title">ACM CUI WAH CHAPTER</span>
        </BootstrapNavbar.Brand>

        {/* Mobile Search - visible ONLY on /dashboard/blogs */}
        {showSearchBar && (
          <div className="d-flex d-lg-none flex-grow-1 me-2 position-relative">
            <Form className="w-100 position-relative">
              <Form.Control
                type="search"
                placeholder="Search"
                className="search-input pe-4"
                size="sm"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery === "" && <BsSearch className="search-icon" />}

              {showDropdown && searchResults.length > 0 && (
                <div className="search-dropdown">
                  {searchResults.map((item, index) => (
                    <div
                      key={index}
                      className="search-item"
                      onClick={() => handleResultClick(item)}
                    >
                      {item.title} ({item.type})
                    </div>
                  ))}
                </div>
              )}
            </Form>
          </div>
        )}

        {/* Mobile Menu Toggle Button */}
        {showMenuButton && (
          <Button
            variant="light"
            className="menu-toggle-btn me-2 d-lg-none"
            onClick={onMenuClick}
            aria-label="Toggle sidebar menu"
          >
            <BsList size={22} />
          </Button>
        )}

        <BootstrapNavbar.Toggle
          aria-controls="navbar-nav"
          className="ms-2 bg-light"
        />

        <BootstrapNavbar.Collapse id="navbar-nav" className="w-100">
          {/* Navigation Links */}
          <Nav className="nav-links d-flex flex-lg-row flex-column align-items-lg-center align-items-center justify-content-lg-center mx-lg-auto mt-lg-0 mt-2">
            <Nav.Link as={Link} to="/blogs" className="text-white fw-semibold">
              Blog
            </Nav.Link>

            {/* ✅ Added Recruitment */}
            <Nav.Link as={Link} to="/recruitment" className="text-white fw-semibold">
              Recruitment
            </Nav.Link>

            <Nav.Link as={Link} to="/achievement" className="text-white fw-semibold">
              Achievement
            </Nav.Link>

            <Nav.Link as={Link} to="/events" className="text-white fw-semibold">
              Events
            </Nav.Link>

            <Nav.Link as={Link} to="/teams" className="text-white fw-semibold">
              Teams
            </Nav.Link>

            <Nav.Link as={Link} to="/mission" className="text-white fw-semibold">
              Our Mission
            </Nav.Link>

            <Nav.Link as={Link} to="/contact" className="text-white fw-semibold">
              Contact us
            </Nav.Link>
          </Nav>

          {/* DESKTOP SEARCH - visible ONLY on /dashboard/blogs */}
          {showSearchBar && (
            <div className="d-none d-lg-flex align-items-center position-relative navbar-right">
              <Form className="d-flex me-2 position-relative">
                <Form.Control
                  type="search"
                  placeholder="Search"
                  className="search-input pe-4"
                  size="sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                {searchQuery === "" && <BsSearch className="search-icon" />}

                {showDropdown && searchResults.length > 0 && (
                  <div className="search-dropdown">
                    {searchResults.map((item, index) => (
                      <div
                        key={index}
                        className="search-item"
                        onClick={() => handleResultClick(item)}
                      >
                        {item.title} ({item.type})
                      </div>
                    ))}
                  </div>
                )}
              </Form>

              {renderAuthButtons()}
            </div>
          )}

          {/* If NOT /dashboard/blogs, still show Login/Profile */}
          {!showSearchBar && (
            <div className="d-none d-lg-flex align-items-center navbar-right">
              {renderAuthButtons()}
            </div>
          )}
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
