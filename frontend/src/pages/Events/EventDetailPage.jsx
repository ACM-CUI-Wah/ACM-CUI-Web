import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer/Footer";
import axiosInstance from "../../axios";
import "@fortawesome/fontawesome-free/css/all.min.css"; 
import "./EventDetailPage.css";
import Navbar from "../../components/DashboardNavbar/Navbar";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false); // Modal State

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

  // Helper function for hosts
  const parseHosts = (hosts) => {
    if (!hosts || !Array.isArray(hosts)) return [];
    return hosts.map(host => {
      try {
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
        <Navbar />
        <div style={{ textAlign: 'center', padding: '10rem 0' }}>
          <p>Loading event details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '10rem 0' }}>
          <p style={{ color: '#e74c3c' }}>{error || "Event not found"}</p>
          <button className="register-btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={() => navigate('/events')}>
            Back to Events
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const registrationProgress = ((event.registration_count || 0) / event.total_seats) * 100;

  return (
    <div className="event-detail-page">
      <Navbar />

      {/* Hero Section */}
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
          <h2 className="event-title">{event.title}</h2>
          <p className="event-intro">{event.description || event.content?.substring(0, 150)}</p>

          <div className="event-meta-box">
            <div className="event-meta-row">
              <div className="meta-item">
                <i className="fa-solid fa-calendar-days meta-icon"></i>
                <div className="meta-text">
                  <span className="meta-label">Date</span>
                  <span className="meta-value">
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
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

          <div className="event-info-box">
            <h3>About this event</h3>
            <p>{event.content}</p>
          </div>

          {event.hosts && event.hosts.length > 0 && (() => {
            const parsedHosts = parseHosts(event.hosts);
            return parsedHosts.length > 0 && (
              <div className="speaker-box">
                <div className="speaker-meta">
                  <i className="fa-solid fa-user-tie meta-icon"></i>
                  <div className="meta-text">
                    <span className="meta-label">{parsedHosts.length > 1 ? 'Hosts' : 'Host'}</span>
                    <div className="speaker-name">
                      {parsedHosts.map((host, index) => (
                        <div key={index}>• {host}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT SIDE */}
        <aside className="event-right">
          <div className="event-register-card">
            <div className="registration-header">
              <span className="registration-label">Registration:</span>
              <span className="registration-count">{event.registration_count || 0}/{event.total_seats}</span>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${registrationProgress}%` }}></div>
            </div>

            <p className="remaining-text">
              {Math.max(0, event.total_seats - (event.registration_count || 0))} spots available!
            </p>

            {new Date(event.date) >= new Date(new Date().toDateString()) ? (
              <button className="register-btn" onClick={() => setShowModal(true)}>
                Register Now
              </button>
            ) : (
              <button className="register-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                Event Ended
              </button>
            )}

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

            <p className="org-label">Organized by:</p>
            <div className="org-row">
              <div className="org-logo-wrapper">
                <img src="/acm-comsats-wah-chapter.png" alt="ACM Logo" className="org-logo-img" />
              </div>
              <div className="org-details">
                <h4 className="org-name">ACM CUI Wah</h4>
                <p className="org-members">100+ members</p>
              </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

            <div className="event-perks">
              <div className="perk-item">
                <span className="check-mark">✔</span>
                <span>Free admission</span>
              </div>
              <div className="perk-item">
                <span className="check-mark">✔</span>
                <span>Certificate provided</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* REGISTRATION MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="registration-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowModal(false)}>&times;</button>
            <h3>Join Event</h3>
            <p>Select your registration preference</p>
            
            <div className="modal-options">
              <div 
                className="modal-option-card"
                onClick={() => navigate(`/events/individualform?eventId=${event.id}`)}
              >
                <i className="fa-solid fa-user"></i>
                <h4>Individual</h4>
                <span>Register solo</span>
              </div>

              <div 
                className="modal-option-card"
                onClick={() => navigate(`/events/teamform?eventId=${event.id}`)}
              >
                <i className="fa-solid fa-users"></i>
                <h4>Team</h4>
                <span>Register as group</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default EventDetailPage;
