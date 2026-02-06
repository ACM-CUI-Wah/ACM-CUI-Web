import React from "react";
import './footer.css';
import ACMlogo from "../../assets/ACMlogo.png";
import { Link } from "react-router-dom";



const Footer = () => {
  return (
    <footer className="footer  pt-5 text-white">
      <div className="container  px-2">
        <div className="row pb-4">

    
          <div className="col-md-3 mb-4 d-flex align-items-start gap-2">
            <img src={ACMlogo} alt="ACM Logo" style={{ height: "50px" }} />
            <p className="font mb-0 fw-light" style={{ fontSize: "2rem" }}>ACM CUI</p>

          </div>

     
          <div className="col-md-2 mb-4">
            <h5 className="fw-bold mb-5">Achievement</h5>
            <ul className="list-unstyled">
              <li><Link to="/">Overview</Link></li>
              <li>Events</li>
            </ul>
          </div>

  
          <div className="col-md-3 mb-4">
            <h5 className="fw-bold mb-5">Clubs</h5>
            <ul className="list-unstyled">
              <li><Link to="/teams">CodeHub</Link></li>
              <li><Link to="/teams">Media & Marketing</Link></li>
              <li><Link to="/teams">Graphics</Link></li>
              <li><Link to="/teams">Events & Logistics</Link></li>
              <li><Link to="/teams">Decor</Link></li>
            </ul>
          </div>

   
          <div className="col-md-2 mb-4">
            <h5 className="fw-bold mb-5">About Us</h5>
            <ul className="list-unstyled">
                <li><Link to="/mission">About Us</Link></li>
              <li>Careers</li>
               <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

   
          <div className="col-md-2 mb-4">
            <h5 className="fw-bold mb-5">Contact Us</h5>
            <p className="mb-0">Reach out via email or connect on our social platforms.</p>
          </div>
        </div>

        <hr className="border-light" />

        <div className="d-flex flex-wrap justify-content-between align-items-center py-2">
          <div className="d-flex flex-wrap gap-5 pb-3">
            <p>English</p>
            <p>Terms & Privacy</p>
            <p>Security</p> 
            <p>Status</p>
          </div>
          <div className="ms-auto d-flex align-items-center gap-3">
            <Link to="/credits" className="built-by-link">Built by CodeHub Team</Link>
            <span className="text-secondary">|</span>
            <p className="font mb-0">© 2026 ACM CUI Wah</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
