import React from 'react';
import './WhyJoinACM.css';

 import networkingIcon1 from '../../assets/whyjoin1.png';
 import networkingIcon2 from '../../assets/whyjoin2.png';
 import networkingIcon3 from '../../assets/whyjoin3.png';
 import networkingIcon4 from '../../assets/whyjoin4.png';


const WhyJoinACM = () => {
  const benefits = [
    {
      title: "Networking Opportunities",
      description: "Connect with like-minded students and industry professionals",
      image: networkingIcon1 
    },
    {
      title: "Skill Development",
      description: "Participate in workshops, hackathons, and technical projects",
      image: networkingIcon2
    },
    {
      title: "Leadership Experience",
      description: "Take on leadership roles and organize impactful events",
      image: networkingIcon3
    },
    {
      title: "Exclusive Events",
      description: "Access to member-only workshops, speakers, and career fairs",
      image: networkingIcon4
    }
  ];

  return (
    <section className="benefits-section">
      <div className="benefits-header">
        <h2 className="benefits-main-title">WHY JOIN ACM?</h2>
        <p className="benefits-subtitle">Discover the benefits of being an ACM member</p>
      </div>

      <div className="benefits-grid">
        {benefits.map((benefit, index) => (
          <div key={index} className="benefit-card">
            <div className="icon-circle">
              
              <img 
                src={benefit.image} 
                alt={benefit.title} 
                className="benefit-custom-img" 
              />
            </div>
            <h3 className="benefit-card-title">{benefit.title}</h3>
            <p className="benefit-card-desc">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyJoinACM;