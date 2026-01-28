import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./HackathonManagement.css";

// Assets
import debugLogo from "../../assets/debug-icon.png";
import codingLogo from "../../assets/coding-icon.png";
import aiLogo from "../../assets/ai-icon.png";
import calendarIcon from "../../assets/whyjoin4.png";
import timeIcon from "../../assets/Time.png";

const HackathonManagement = () => {
  const hackathons = [
    {
      id: 1,
      title: "Debugging Competition",
      description: "Build confidence and express ideas through powerful speaking and show your talent.",
      date: "Feb 25, 2026",
      time: "12:00 AM - 3:00 PM",
      icon: debugLogo
    },
    {
      id: 2,
      title: "Speed Coding Competition",
      description: "Build confidence and express ideas through powerful speaking and show your talent.",
      date: "May 25, 2026",
      time: "12:00 AM - 3:00 PM",
      icon: codingLogo
    },
    {
      id: 3,
      title: "AI/ML Challenge",
      description: "Build confidence and express ideas through powerful speaking and show your talent.",
      date: "Mar 25, 2026",
      time: "12:00 AM - 3:00 PM",
      icon: aiLogo
    }
  ];

  return (
    <section className="hackathon-section">
      <div className="hackathon-header">
        <h1 className='title'>HACKATHONS</h1>
        <p>Push boundaries, break limits, and innovate with the best minds in tech</p>
      </div>

      <div className="hackathon-grid">
        {hackathons.map((item) => (
          <div key={item.id} className="hackathon-card">
            <div className="hackathon-icon-badge">
              <span className="icon-placeholder">
                <img src={item.icon} alt={item.title} className="card-logo-img" />
              </span>
            </div>
            <div className="card-content">
              <h3>{item.title}</h3>
              <p className="description">{item.description}</p>
              
              <div className="meta-info">
                <div className="meta-item">
                   <img src={calendarIcon} alt="calendar" className="small-meta-icon" />
                   <span>{item.date}</span>
                </div>
                <div className="meta-item">
                   <img src={timeIcon} alt="time" className="small-meta-icon" />
                   <span>{item.time}</span>
                </div>
              </div>
              {/* Individual Register button removed from here */}
            </div>
          </div>
        ))}
      </div>
      
      {/* New Centered Learn More Button */}
      <div className="learn-more-container">
        <Link to="/events" className="learn-more-btn">
          Learn More
        </Link>
      </div>

     
    </section>
  );
};

export default HackathonManagement;