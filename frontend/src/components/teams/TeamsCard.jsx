import React from 'react';
import { Link } from "react-router-dom";
import './TeamCard.css';

const TeamsCard = ({ image, title,  description }) => {
  const shortDescription = description.length > 120 
    ? description.substring(0, 120) + "..." 
    : description;
  return (
    <Link 
      to={`/team/${encodeURIComponent(title)}`} 
      state={{ image, title, description }}
      className="teams-card-link"
    >
      <div className="teams-card">
        <img src={image} alt={title} className="teams-card-image" />
        <div className="teams-card-content">
          <h3 className="teams-card-title">{title}</h3>
          
          <p className="teams-card-description">{shortDescription}</p>
        </div>
      </div>
    </Link>
  );
};

export default TeamsCard;
