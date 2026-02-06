import React from "react"; 
import Navbar from "../../components/DashboardNavbar/Navbar";
import "./ContactPage.css";
import { FaInstagram, FaLinkedin } from "react-icons/fa";

const ContactPage = () => {
  return (
    <div>
      <Navbar />
      <div className="contact-page">
        <div className="contact-container">
          <div className="contact-info">
            <h1 className="contact-title">Get in Touch</h1>
            <p className="contact-subtitle">
              Reach out to us directly through the following channels:
            </p>

            <div className="contact-details">
              <p><strong>ACM Official Email:</strong> acmcuiwah@gmail.com</p>
              <p><strong>President Email:</strong> kanwartaha0@gmai.com</p>
              <p><strong>Faculty Head Email:</strong> mtalha@ciitwah.edu.pk</p>

              <div className="social-icons1">
                <a href="https://www.linkedin.com/company/acmcuiwah/" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin size={28} color="#0077B5" style={{ marginRight: "15px" }} />
                </a>
                <a href="https://www.instagram.com/acmcuiwah?igsh=bjhjczlmNWZ5c3E3" target="_blank" rel="noopener noreferrer">
                  <FaInstagram size={28} color="#E1306C" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
