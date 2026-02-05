import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/DashboardNavbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./BackToEvent.css";

const BackToEvent = () => {
  const navigate = useNavigate();

  // Ensure page starts at the top when loaded
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="event-success-page">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="event-success-container">
        <div className="event-success-card">
          {/* Success Icon Circle */}
          <div className="success-icon">
            ✓
          </div>

          <h2>You're All Set!</h2>
          <p>
            Your spot has been reserved. Check your inbox for the event 
            details and stay tuned for more updates from our community.
          </p>

          <button
            className="explore-btn"
            onClick={() => navigate("/PublicEventListingPage")}
          >
            Explore More Events
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BackToEvent;