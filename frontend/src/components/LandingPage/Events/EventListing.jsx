import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import axiosInstance from "../../../axios";
import "./EventListing.css";

import dateIcon from "../../../assets/Date.png";
import timeIcon from "../../../assets/Time.png";

const EventListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Events");
  const [events, setEvents] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
    fetchEventTypes();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/events/");
      setEvents(res.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const res = await axiosInstance.get("/event-types/");
      setEventTypes(res.data);
    } catch (error) {
      console.error("Error fetching event types:", error);
    }
  };

  const categories = ["All Events", ...eventTypes.map(type => type.type)];

  const filteredEvents = events.filter((event) => {
    const matchesCategory = activeCategory === "All Events" || event.event_type?.type === activeCategory;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="event-listing-container">

      <div className="search-header">
        <div className="search-bar-wrapper">
          <FiSearch className="inner-search-icon" />
          <input
            type="text"
            placeholder="Search for upcoming ACM events, workshops, or seminars..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="premium-search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="category-list">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-pill ${activeCategory === cat ? "active-pill" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="results-text">{filteredEvents.length} events found</p>
        </div>
      </div>


      {/* Event Grid */}
      <div className="event-grid">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#e74c3c' }}>
            <p>{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p>No events found matching your criteria.</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div className="event-card" key={event.id}>
              <div className="event-image-wrapper">
                <img
                  src={event.image || '/placeholder-event.jpg'}
                  alt={event.title}
                  onError={(e) => { e.target.src = '/placeholder-event.jpg'; }}
                />
                <div className="card-category-tag">{event.event_type?.type || 'Event'}</div>
              </div>

              <div className="event-details">
                <h3 className="event-name">{event.title}</h3>
                <p className="event-desc">{event.description || event.content}</p>

                <div className="info-row">
                  <div className="info-item">
                    <img src={dateIcon} alt="Date" className="meta-icon" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="info-item">
                    <img src={timeIcon} alt="Time" className="meta-icon" />
                    <span>{event.time_from} – {event.time_to}</span>
                  </div>
                </div>

                <button
                  className="register-btn"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default EventListing;