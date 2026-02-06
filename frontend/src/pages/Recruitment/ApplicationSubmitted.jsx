import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/DashboardNavbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./ApplicationSubmitted.css";

const ApplicationSubmitted = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="application-page">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="application-container">
        <div className="application-card">
          <div className="success-icon">
            ✓
          </div>

          <h2>Application Submitted!</h2>
          <p>
            Thank you for applying to our recruitment program. We’ll review your
            application and get back to you within <strong>5–7 business days</strong>.
          </p>

          <button
            className="back-btn"
            onClick={() => navigate("/recruitment")}
          >
            Back to Recruitment
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ApplicationSubmitted;
