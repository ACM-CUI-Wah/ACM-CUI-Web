import React from 'react';
import './RecruitmentHero.css';

const RecruitmentHero = () => {
  return (
    <section className="hero-container">
      <div className="hero-content">
    
        <div className="recruitment-badge">
          <span className="badge-icon">⚡</span>
          Spring 2026 Recruitment Now Open
        </div>

        <h1 className="hero-title">ACM CUI WAH CHAPTER</h1>
        <p className="hero-subtitle">
          Empowering students to innovate, collaborate, and excel in computing. 
          Join the largest computing society at COMSATS University.
        </p>

        <div className="stats-container">
          <div className="stat-item">
            <h3>15+</h3>
            <p>Competitions</p>
          </div>
          <div className="stat-item">
            <h3>100+</h3>
            <p>Members</p>
          </div>
          <div className="stat-item">
            <h3>25+</h3>
            <p>Events</p>
          </div>
        </div>

        <div className="hero-buttons">
          <button className="btn-primary">Join ACM &rarr;</button>
          <button className="btn-secondary">View Events</button>
        </div>
      </div>

      <div className="hero-image-container">
        
        <img 
          src="src\assets\RecruitmentTable.png" 
          alt="Interview Illustration" 
          className="hero-illustration"
        />
      </div>
    </section>
  );
};

export default RecruitmentHero;