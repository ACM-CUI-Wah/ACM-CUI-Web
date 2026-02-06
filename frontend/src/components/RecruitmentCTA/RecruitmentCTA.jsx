import React from 'react';
import './RecruitmentCTA.css';
import { Link } from 'react-router-dom';

const RecruitmentCTA = () => {
  return (
    <section className="cta-container">
      <div className="cta-card">
        <h2 className="cta-heading">Ready to Start Your Journey?</h2>
        <p className="cta-description">
          Become a part of ACM CUI WAH and unlock opportunities for learning, 
          networking, and career growth in the tech industry.
        </p>
        <Link to="/recruitmentForm" className="cta-button" >
          Start Your Application <span>&rarr;</span>
        </Link>
      </div>
    </section>
  );
};

export default RecruitmentCTA;