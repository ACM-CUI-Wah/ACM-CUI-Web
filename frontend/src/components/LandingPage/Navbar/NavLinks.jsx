import React from 'react';
import { Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

const NavLinks = () => {
  return (
    <>
      <Nav.Link
        as={Link}
        to="/blogs"
        className="fw-semibold mx-2 text-white custom-nav-link"
      >
        Blog
      </Nav.Link>

      <Nav.Link
        as={Link}
        to="/achievement"
        className="fw-semibold mx-2 text-white custom-nav-link"
      >
        Achievement
      </Nav.Link>

      
      <Nav.Link
        as={Link}
        to="/events"
        className="fw-semibold mx-2 text-white custom-nav-link"
      >
        Events
      </Nav.Link>

      <Nav.Link
        as={Link}
        to="/teams"
        className="fw-semibold mx-2 text-white custom-nav-link"
      >
        Teams
      </Nav.Link>


      <Nav.Link
        as={Link}
        to="/mission"
        className="fw-semibold mx-2 text-white custom-nav-link"
      >
        Our Mission
      </Nav.Link>

      <Nav.Link
        as={Link}
        to="/contact"
        className="fw-semibold mx-2 text-white custom-nav-link"
      >
        Contact Us
      </Nav.Link>
    </>
  )
}

export default NavLinks;
