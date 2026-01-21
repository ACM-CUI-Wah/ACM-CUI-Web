import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import "./EventListing.css";


import speakShine from "../../../assets/Speakandshine.png";
import escapeRoom from "../../../assets/EscapeRoom.png";
import hackathon from "../../../assets/Hackathon.png";
import squidGame from "../../../assets/SquidGame.png";
import puzzleFuzzle from "../../../assets/PuzzelFuzzel.png";
import webDeveloper from "../../../assets/webdeveloper.jpg";


import dateIcon from "../../../assets/Date.png";
import timeIcon from "../../../assets/Time.png";

const events = [
  { id: 1, title: "Speak and Shine", category: "Seminar", description: "Build confidence and express ideas through powerful speaking.", date: "Jan 18, 2026", time: "12:00 AM - 3:00 PM", image: speakShine },
  { id: 2, title: "Escape Room", category: "Workshop", description: "Play the game, solve clues, beat the clock, and escape as a team.", date: "Jan 18, 2026", time: "12:00 AM - 3:00 PM", image: escapeRoom },
  { id: 3, title: "Hackathon", category: "Hackathons", description: "Code, collaborate, and create innovative solutions.", date: "Jan 18, 2026", time: "12:00 AM - 3:00 PM", image: hackathon },
  { id: 4, title: "Squid Game", category: "Student Week", description: "Compete in fun, high-energy challenge rounds with exciting tasks.", date: "Jan 18, 2026", time: "12:00 AM - 3:00 PM", image: squidGame },
  { id: 5, title: "Puzzle Fuzzle", category: "Workshop", description: "Test your brain with tricky puzzles and riddles in a fun environment.", date: "Jan 18, 2026", time: "12:00 AM - 3:00 PM", image: puzzleFuzzle },
  { id: 6, title: "Web Developer", category: "Workshop", description: "Learn and build modern web experiences with hands-on practice.", date: "Jan 18, 2026", time: "12:00 AM - 3:00 PM", image: webDeveloper },
];

const EventListing = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Events");

  const categories = ["All Events", "Workshop", "Seminar", "Hackathons", "Student Week"];

  const filteredEvents = events.filter((event) => {
    const matchesCategory = activeCategory === "All Events" || event.category === activeCategory;
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

  
      <div className="event-grid">
        {filteredEvents.map((event) => (
          <div className="event-card" key={event.id}>
            <div className="event-image-wrapper">
              <img src={event.image} alt={event.title} />
              <div className="card-category-tag">{event.category}</div>
            </div>

            <div className="event-details">
              <h3 className="event-name">{event.title}</h3>
              <p className="event-desc">{event.description}</p>

              <div className="info-row">
                <div className="info-item">
                  <img src={dateIcon} alt="Date" className="meta-icon" />
                  <span>{event.date}</span>
                </div>
                <div className="info-item">
                  <img src={timeIcon} alt="Time" className="meta-icon" />
                  <span>{event.time}</span>
                </div>
              </div>

              <button className="register-btn">Register Now</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EventListing;