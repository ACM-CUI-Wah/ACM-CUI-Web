import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../axios";
import ellipseImage from "../../../assets/ellipse1.png";
import "./EventSection.css"; 

import dateIcon from "../../../assets/Date.png";
import timeIcon from "../../../assets/Time.png";

const EventSection = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/events/");
        
        // Manual titles you want to ensure are included
        const featuredTitles = ["Web Dev", "Puzzle Fuzzle", "grsyeys"]; 
        
        const filtered = res.data.filter(event => {
          // 1. Check if the event category is WORKSHOP
          const isWorkshop = event.event_type?.type?.toUpperCase() === "WORKSHOP";
          
          // 2. Check if the title is in your manually featured list
          const isFeaturedTitle = featuredTitles.includes(event.title);

          // 3. Absolute Rule: No Hackathons (by Title or Category)
          const isNotHackathon = 
            event.title.toLowerCase() !== "hackathon" && 
            event.event_type?.type?.toLowerCase() !== "hackathon";

          // Include it if it's featured OR a workshop, provided it's NOT a hackathon
          return (isFeaturedTitle || isWorkshop) && isNotHackathon;
        });

        // Slice to 3 to keep the landing page layout clean
        setEvents(filtered.slice(0, 3));
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <section className="events-section3">
      <img src={ellipseImage} alt="Background" className="ellipse-bg" />

      <div className="container-fluid px-4 position-relative z-1">
        <h1 className="events-heading-text">EVENTS</h1>

        <div className="event-cards-scroll mt-5">
          {loading ? (
            <div className="w-100 text-center py-5">
               <div className="spinner-border text-primary" role="status"></div>
               <p className="mt-2">Loading events...</p>
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
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
                    {event.event_type?.type || 'Event'}
                  </div>
                </div>

                <div className="ev-list-body">
                  <h3 className="ev-list-title">{event.title}</h3>
                  <p className="ev-list-description">
                    {event.description || (event.content ? event.content.substring(0, 80) + "..." : "View details for this event.")}
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
          ) : (
            <div className="w-100 text-center py-5">No events found.</div>
          )}
        </div>

        <div className="ev-section-footer">
          <button 
            className="ev-more-btn-solid" 
            onClick={() => navigate('/events')}
          >
            More Events
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventSection;