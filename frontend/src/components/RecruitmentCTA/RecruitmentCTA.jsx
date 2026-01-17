import React from 'react';
import './RecruitmentCTA.css';

const RecruitmentCTA = () => {
  return (
    <section className="cta-container">
      <div className="cta-card">
        <h2 className="cta-heading">Ready to Start Your Journey?</h2>
        <p className="cta-description">
          Become a part of ACM CUI WAH and unlock opportunities for learning, 
          networking, and career growth in the tech industry.
        </p>
        <button className="cta-button" onClick={() => window.location.href = '#'}>
          Start Your Application <span>&rarr;</span>
        </button>
      </div>
    </section>
  );
};

export default RecruitmentCTA;