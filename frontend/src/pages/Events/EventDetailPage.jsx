import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavbarComponent from "../../components/LandingPage/Navbar/NavbarComponent";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../axios";
import "@fortawesome/fontawesome-free/css/all.min.css"; // Font Awesome
import "./EventDetailPage.css";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/events/${id}/`);
      setEvent(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setError("Failed to load event details. The event may not exist.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse hosts (handles double-encoded JSON)
  const parseHosts = (hosts) => {
    if (!hosts || !Array.isArray(hosts)) return [];

    return hosts.map(host => {
      try {
        // If host is a JSON string, parse it
        if (typeof host === 'string' && host.startsWith('[')) {
          const parsed = JSON.parse(host);
          return Array.isArray(parsed) ? parsed[0] : parsed;
        }
        return host;
      } catch (e) {
        return host;
      }
    }).filter(host => host && host.trim());
  };

  if (loading) {
    return (
      <div className="event-detail-page">
        <NavbarComponent />
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <p>Loading event details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <NavbarComponent />
        <div style={{ textAlign: 'center', padding: '5rem' }}>
          <p style={{ color: '#e74c3c' }}>{error || "Event not found"}</p>
          <button
            onClick={() => navigate('/events')}
            style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
          >
            Back to Events
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <NavbarComponent />

      {/* Hero Section with fade */}
      <section className="event-hero">
        <img
          src={event.image || '/placeholder-event.jpg'}
          alt={event.title}
          className="event-hero-img"
          onError={(e) => { e.target.src = '/placeholder-event.jpg'; }}
        />
        <div className="event-hero-fade" />
      </section>

      <main className="event-content">
        {/* LEFT SIDE */}

        <div className="event-left">
          {/* Title + Intro */}
          <h2 className="event-title">{event.title}</h2>

          <p className="event-intro">
            {event.description || event.content}
          </p>

          {/* Date / Time / Venue */}
          <div className="event-meta-box">
            <div className="event-meta-row">
              <div className="meta-item">
                <i className="fa-solid fa-calendar-days meta-icon"></i>
                <div className="meta-text">
                  <span className="meta-label">Date</span>
                  <span className="meta-value">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="meta-item">
                <i className="fa-solid fa-clock meta-icon"></i>
                <div className="meta-text">
                  <span className="meta-label">Time</span>
                  <span className="meta-value">{event.time_from} – {event.time_to}</span>
                </div>
              </div>
            </div>
            <div className="meta-item full">
              <i className="fa-solid fa-location-dot meta-icon"></i>
              <div className="meta-text">
                <span className="meta-label">Venue</span>
                <span className="meta-value">{event.location || 'TBA'}</span>
              </div>
            </div>
          </div>

          {/* Main Info Box */}
          <div className="event-info-box">
            <h3>About this event</h3>
            <p>{event.content}</p>
          </div>

          {/* Speaker/Hosts */}
          {event.hosts && event.hosts.length > 0 && (() => {
            const parsedHosts = parseHosts(event.hosts);
            return parsedHosts.length > 0 && (
              <div className="speaker-box">
                <div className="meta-item speaker-meta">
                  <i className="fa-solid fa-user-tie meta-icon"></i>
                  <div className="meta-text">
                    <span className="meta-label">{parsedHosts.length > 1 ? 'Hosts' : 'Host'}</span>
                    <div className="meta-value speaker-name">
                      {parsedHosts.map((host, index) => (
                        <div key={index} style={{ marginBottom: index < parsedHosts.length - 1 ? '0.5rem' : '0' }}>
                          • {host}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>

        {/* Right Side */}
        <aside className="event-right">
          <div className="event-register-card">
            {/* Header Section */}
            <div className="registration-header">
              <span className="registration-label">Registration:</span>
              <span className="registration-count">{event.registration_count || 0}/{event.total_seats} registered</span>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${((event.registration_count || 0) / event.total_seats) * 100}%` }}
              ></div>
            </div>

            <p className="remaining-text">{event.total_seats - (event.registration_count || 0)} spots available!</p>

            {/* CTA Button */}
            <button
              className="register-btn"
              onClick={() => navigate(`/events/individualform?eventId=${event.id}`)}
            >
              Register Now
            </button>

            <hr />

            {/* Organization Section */}
            <p className="org-label">Organized by:</p>
            <div className="org-row">
              <div className="org-logo-wrapper">
                <img src="/acm-comsats-wah-chapter.png" alt="ACM Logo" className="org-logo-img" />
              </div>
              <div className="org-details">
                <h4 className="org-name">ACM CUI Wah Chapter</h4>
                <p className="org-members">100+ members</p>
              </div>
            </div>

            <hr />

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
