import React, { useEffect } from "react";
import NavbarComponent from "../../components/LandingPage/Navbar/NavbarComponent";
import Footer from "../../components/Footer/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Font Awesome
import "./EventDetailPage.css";

const EventDetailPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="event-detail-page">
      <NavbarComponent />

      {/* Hero Section with fade */}
      <section className="event-hero">
        <img
          src="/public/web-development-workshop.jpg"
          alt="Event Banner"
          className="event-hero-img"
        />
        <div className="event-hero-fade" />
      </section>

      <main className="event-content">
        {/* LEFT SIDE */}

        <div className="event-left">
          {/* Title + Intro */}
          <h2 className="event-title">Web Development Workshop</h2>

          <p className="event-intro">
            A hands-on workshop hosted by ACM CUI Wah on web development. Learn
            practical skills, tools, and modern techniques used in real-world
            projects. Build, experiment, and level up your web development
            journey with us.
          </p>

          {/* Date / Time / Venue */}
          <div className="event-meta-box">
            <div className="event-meta-row">
              <div className="meta-item">
                <i className="fa-solid fa-calendar-days meta-icon"></i>
                <div className="meta-text">
                  <span className="meta-label">Date</span>
                  <span className="meta-value">Jan 16, 2025</span>
                </div>
              </div>
              <div className="meta-item">
                <i className="fa-solid fa-clock meta-icon"></i>
                <div className="meta-text">
                  <span className="meta-label">Time</span>
                  <span className="meta-value">2:00 PM – 5:00 PM</span>
                </div>
              </div>
            </div>
            <div className="meta-item full">
              <i className="fa-solid fa-location-dot meta-icon"></i>
              <div className="meta-text">
                <span className="meta-label">Venue</span>
                <span className="meta-value">Auditorium</span>
              </div>
            </div>
          </div>

          {/* Main Info Box */}
          <div className="event-info-box">
            <h3>About this event/workshop</h3>
            <p>
              Learn how modern websites are designed, built, and deployed from
              scratch. Get hands-on experience with HTML, CSS, and JavaScript.
              Understand real-world web development workflows and best
              practices. Build confidence to start your own web projects or
              portfolio.
            </p>

            <h3>What You’ll Learn</h3>
            <ul>
              <li>Basics of web development and how the web works</li>
              <li>Introduction to HTML, CSS, and JavaScript</li>
              <li>Creating responsive and user-friendly web pages</li>
              <li>Hands-on practice with real examples</li>
              <li>Tips for starting your web development journey</li>
            </ul>

            <h3>Pre-requisites</h3>
            <p>
              No prior experience required. Basic computer knowledge is enough.
              Just bring your curiosity and willingness to learn.
            </p>

            <h3>What to bring</h3>
            <ul>
              <li>Laptop (recommended)</li>
              <li>Any code editor (VS Code preferred, optional)</li>
              <li>Notebook and pen for notes</li>
              <li>Enthusiasm to build and learn</li>
            </ul>
          </div>

          {/* Speaker */}
          <div className="speaker-box">
            <div className="meta-item speaker-meta">
              <i className="fa-solid fa-user-tie meta-icon"></i>
              <div className="meta-text">
                <span className="meta-label">Speaker</span>
                <span className="meta-value speaker-name">Miss Ayesha</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Side */}
        <aside className="event-right">
          <div className="event-register-card">
            {/* Header Section */}
            <div className="registration-header">
              <span className="registration-label">Registration:</span>
              <span className="registration-count">27/35 registered</span>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${(27 / 35) * 100}%` }}
              ></div>
            </div>

            <p className="remaining-text">8 spots remaining!</p>

            {/* CTA Button */}
            <button className="register-btn">Register Now</button>

            <hr/>

            {/* Organization Section */}
            <p className="org-label">Organized by:</p>
            <div className="org-row">
              <div className="org-logo-wrapper">
                <img src="/public/acm-comsats-wah-chapter.png" alt="ACM Logo" className="org-logo-img" />
              </div>
              <div className="org-details">
                <h4 className="org-name">ACM CUI Wah Chapter</h4>
                <p className="org-members">100+ members</p>
              </div>
            </div>

            <hr/>

            {/* Perks Section */}
            <div className="event-perks">
              <div className="perk-item">
                <span className="check-mark">✔</span>
                <span>Free admission</span>
              </div>
              <div className="perk-item">
                <span className="check-mark">✔</span>
                <span>Certificate provided</span>
              </div>
              <div className="perk-item">
                <span className="check-mark">✔</span>
                <span>Refreshments included</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetailPage;
