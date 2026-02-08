import React from "react";
import "./EventHeroSection.css";
import eventHeroImage from "../../../assets/event-hero-illustration.png";


const EventHeroSection = () => {
  return (
    <section className="event-hero">
      <div className="event-hero__content">
        <span className="event-hero__badge">
          Spring 2026 Student Week Coming Soon
        </span>

        <h1 className="event-hero__title">
          Discover Amazing Events
        </h1>

        <p className="event-hero__description">
          Explore our upcoming events, workshops, and competitions.
          Register now to secure your spot!
        </p>

        <div className="event-hero__stats">
          <div className="event-hero__stat">
            <h3>15+</h3>
            <p>Competitions</p>
          </div>
          <div className="event-hero__stat">
            <h3>100+</h3>
            <p>Members</p>
          </div>
          <div className="event-hero__stat">
            <h3>25+</h3>
            <p>Events</p>
          </div>
        </div>
      </div>

      <div className="event-hero__image">
        <img
          src={eventHeroImage}
          alt="Event Illustration"
          className="hero-illustration"
        />
      </div>
    </section>
  );
};

export default EventHeroSection;
