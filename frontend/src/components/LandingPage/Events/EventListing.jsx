import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "../../../axios";
import "./EventListing.css";

import dateIcon from "../../../assets/Date.png";
import timeIcon from "../../../assets/Time.png";

const EventListing = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Manually defined categories for the filter buttons
  const categories = ["All Events", "Hackathon", "Seminar", "Workshop", "Networking"];

  // Get category from URL query param, default to "All Events"
  const categoryFromUrl = searchParams.get("category");
  const initialCategory = categoryFromUrl
    ? categories.find(c => c.toLowerCase() === categoryFromUrl.toLowerCase()) || "All Events"
    : "All Events";

  const [activeCategory, setActiveCategory] = useState(initialCategory);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Update active category when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      const matchedCategory = categories.find(c => c.toLowerCase() === categoryFromUrl.toLowerCase());
      if (matchedCategory) {
        setActiveCategory(matchedCategory);
      }
    }
  }, [categoryFromUrl]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/events/");
      setEvents(res.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter logic for category only
  const filteredEvents = events.filter((event) => {
    const eventTypeLabel = event.event_type?.type || event.event_type?.name || "";

    const matchesCategory =
      activeCategory === "All Events" ||
      eventTypeLabel.toLowerCase() === activeCategory.toLowerCase();

    return matchesCategory;
  });

  return (
    <section className="ev-list-wrapper">
      <div className="ev-list-header">
        {/* Filter Controls Section */}
        <div className="ev-list-filters">
          <div className="ev-list-categories">
            {categories.map((cat) => (
              <button
                key={cat}
                // Applies active class strictly when selected
                className={`ev-list-pill ${activeCategory === cat ? "ev-list-pill--active" : ""
                  }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="ev-list-results-count">
            {filteredEvents.length} events found
          </p>
        </div>
      </div>

      {/* Event Grid Section */}
      <div className="ev-list-grid">
        {loading ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
            <p>Loading events...</p>
          </div>
        ) : error ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#e74c3c" }}>
            <p>{error}</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
            <p>No events found for "{activeCategory}".</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              className="ev-list-card"
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
            >
              <div className="ev-list-img-box">
                <img
                  src={event.image || '/placeholder-event.jpg'}
                  alt={event.title}
                  onError={(e) => { e.target.src = '/placeholder-event.jpg'; }}
                />
                <div className="ev-list-tag">
                  {event.event_type?.type || event.event_type?.name || 'Event'}
                </div>
              </div>

              <div className="ev-list-body">
                <h3 className="ev-list-title">{event.title}</h3>
                <p className="ev-list-description">
                  {event.description || (event.content ? event.content.substring(0, 120) + "..." : "")}
                </p>

                <div className="ev-list-meta">
                  <div className="ev-list-meta-item">
                    <img src={dateIcon} alt="Date" className="ev-list-icon" />
                    <span>{event.date}</span>
                  </div>
                  <div className="ev-list-meta-item">
                    <img src={timeIcon} alt="Time" className="ev-list-icon" />
                    <span>{event.time_from}</span>
                  </div>
                </div>

                <button className="ev-list-btn">
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