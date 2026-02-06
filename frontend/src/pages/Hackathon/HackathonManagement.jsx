import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import axiosInstance from "../../axios"; 
import "./HackathonManagement.css";

// Assets
import calendarIcon from "../../assets/whyjoin4.png";
import timeIcon from "../../assets/Time.png";

const HackathonManagement = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Initialize navigation

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/events/");
        
        const filtered = res.data.filter(event => 
          event.event_type?.type?.toUpperCase() === "HACKATHON" || 
          event.title.toLowerCase().includes("hackathon")
        );

        setHackathons(filtered.slice(0, 3));
      } catch (error) {
        console.error("Error fetching hackathons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  return (
    <section className="hackathon-section">
      <div className="hackathon-header">
        <h1 className='title'>HACKATHONS</h1>
        <p>Push boundaries, break limits, and innovate with the best minds in tech</p>
      </div>

      <div className="hackathon-grid">
        {!loading && hackathons.map((item) => (
          <div key={item.id} className="hackathon-card">
            <div className="hackathon-icon-badge">
              <img 
                src={item.image || '/placeholder-event.jpg'} 
                alt={item.title} 
                className="card-logo-img" 
                onError={(e) => { e.target.src = '/placeholder-event.jpg'; }}
              />
            </div>

            <div className="card-content">
              <h3>{item.title}</h3>
              <p className="description">
                {item.description || (item.content ? item.content.substring(0, 85) + "..." : "Join the challenge.")}
              </p>

              <div className="meta-info">
                <div className="meta-item">
                  <img src={calendarIcon} alt="calendar" className="small-meta-icon" />
                  <span>{item.date}</span>
                </div>
                <div className="meta-item">
                  <img src={timeIcon} alt="time" className="small-meta-icon" />
                  <span>{item.time_from}</span>
                </div>
              </div>

              <div className="card-action">
                <Link to={`/events/${item.id}`} className="learn-more-link">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NEW: More Hackathons Button */}
      <div className="ev-section-footer" style={{ marginTop: '40px', textAlign: 'right' }}>
        <button 
          className="ev-more-btn-solid" 
          onClick={() => navigate('/events?category=Hackathon')}
        >
          More Hackathons
        </button>
      </div>
    </section>
  );
};

export default HackathonManagement;