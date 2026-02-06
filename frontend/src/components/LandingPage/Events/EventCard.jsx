
import './EventSection.css';
import React from 'react';
import PropTypes from 'prop-types';

const EventCard = ({ image, title, description }) => {
  return (
    <div className="card shadow-sm rounded-4 h-100"   style={{ minHeight: '420px' }}>
      <img src={image} className="card-img-top rounded-top-4" alt="Event" />
      <div className="card-body">
        <h6 className="card-title fw-semibold">{title}</h6>
        <p className="card-text small text-muted">{description}</p>
        <a href="#" className="text-primary small fw-semibold text-decoration-none">
          Read More →
        </a>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};

export default EventCard;
