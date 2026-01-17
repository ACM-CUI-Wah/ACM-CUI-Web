import React from 'react';
import './RecruitmentTimeline.css';

import timelineIcon1 from '../../assets/Timeline1.png'; 
import timelineIcon2 from '../../assets/Timeline2.png';
import timelineIcon3 from '../../assets/Timeline3.png';
import timelineIcon4 from '../../assets/Timeline4.png';

const RecruitmentTimeline = () => {
  const timelineData = [
    {
      title: "Application Period",
      date: "Jan 06 - Jan 26",
      image: timelineIcon1
    },
    {
      title: "Application Deadline",
      date: "Jan 26 - Jan 30",
      image: timelineIcon2
    },
    {
      title: "Interview Period",
      date: "Jan 26 - Jan 30",
      image: timelineIcon3
    },
    {
      title: "Results Announced",
      date: "Jan 26 - Jan 30",
      image: timelineIcon4
    }
  ];

  return (
    <section className="timeline-section">
      <div className="timeline-header">
        <h2 className="timeline-main-title">RECRUITMENT TIMELINE</h2>
        <p className="timeline-subtitle">Important dates for the recruitment process</p>
      </div>

      <div className="timeline-container">
        {timelineData.map((item, index) => (
          <div key={index} className="timeline-row">
            <div className="timeline-icon-box">
              {/* Changed from span to img tag */}
              <img 
                src={item.image} 
                alt={item.title} 
                className="timeline-custom-img" 
              />
            </div>
            <div className="timeline-info">
              <h4 className="timeline-item-title">{item.title}</h4>
              <p className="timeline-item-date">{item.date}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RecruitmentTimeline;