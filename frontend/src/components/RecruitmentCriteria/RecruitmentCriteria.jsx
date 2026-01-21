import React from 'react';
import './RecruitmentCriteria.css';


import checkIconImg from '../../assets/RecruitmentCriteriaTick.png'; 

const RecruitmentCriteria = () => {
  const criteriaList = [
    "Currently enrolled student (only CS majors like AI, SE and CS)",
    "Passionate about technology and computing",
    "Strong communication and teamwork skills",
    "Commitment to attend weekly meetings",
    "Enthusiasm to learn and contribute"
  ];

  return (
    <section className="criteria-container">
      <h2 className="criteria-title">WHAT WE'RE LOOKING FOR</h2>
      <div className="criteria-card">
        <ul className="criteria-list">
          {criteriaList.map((item, index) => (
            <li key={index} className="criteria-item">
              <div className="check-icon-container">
                <img 
                  src={checkIconImg} 
                  alt="check" 
                  className="criteria-check-img" 
                />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default RecruitmentCriteria;