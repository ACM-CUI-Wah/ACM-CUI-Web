import React from 'react';
import './MemberCard.css';

const MemberCard = ({ image, name, designation }) => {
  // Truncate designation to 50 characters
  const shortDesc =
    designation && designation.length > 50
      ? designation.slice(0, 50) + "..."
      : designation;

  return (
    <div className="member-card">
      <div className="member-img-wrapper">
        <img src={image} alt={name} className="member-img" />
      </div>
      <div className="member-content">
        <h3 className="member-name">{name}</h3>
        <p className="member-designation">{shortDesc}</p>
      </div>
    </div>
  );
};

export default MemberCard;
