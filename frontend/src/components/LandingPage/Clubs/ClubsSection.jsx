// ClubsSection.jsx

import React from "react";
import "./ClubsSection.css";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// ICONS
import vector1 from "../../../assets/vector 1.png";
import vector2 from "../../../assets/Vector 2.png";
import vector3 from "../../../assets/Vector 3.png";
import vector4 from "../../../assets/vector 4.png";
import vector5 from "../../../assets/vector 5.png";

const hoverEffect = {
  y: -10,
  scale: 1.04,
  boxShadow: "0px 18px 35px rgba(12,65,130,0.25)",
};

const ClubsSection = () => {
  return (
    <section className="clubs-container">

      {/* 🔥 MODERN HEADING */}
      <motion.div
        className="clubs-heading"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h1 className="csl-clubs-title-text">CLUBS</h1>

        <p>
          A community of innovators, designers, and problem-solvers
          building impactful technology together.
        </p>
      </motion.div>

      {/* GRID */}
      <div className="clubs-grid">

        {/* CODE HUB */}
        <motion.div className="club-card" whileHover={hoverEffect}>
          <div className="icon-circle">
            <img src={vector1} alt="Code Hub" />
          </div>
          <h4>CODE HUB</h4>
          <p>HIntroducing the heart of innovation our Code Hub team.
            This is where curiosity meets creation. </p>
        </motion.div>

        {/* EVENTS */}
        <motion.div className="club-card" whileHover={hoverEffect}>
          <div className="icon-circle">
            <img src={vector2} alt="Events & Logistics" />
          </div>
          <h4>EVENTS & LOGISTICS</h4>
          <p>Every great experience starts with thoughtful planning and that’s exactly what our Events team does best.</p>
        </motion.div>

        {/* GRAPHICS */}
        <motion.div className="club-card" whileHover={hoverEffect}>
          <div className="icon-circle">
            <img src={vector3} alt="Graphics" />
          </div>
          <h4>GRAPHICS</h4>
          <p>Design is intelligence made visible and our Graphics team embodies that perfectly.</p>
        </motion.div>

        {/* SOCIAL MEDIA & MARKETING */}
        <motion.div className="club-card" whileHover={hoverEffect}>
          <div className="icon-circle">
            <img src={vector4} alt="Social Media & Marketing" />
          </div>
          <h4>SOCIAL MEDIA & MARKETING</h4>
          <p>Promoting ACM through engaging digital campaigns.</p>
        </motion.div>

        {/* DECOR */}
        <motion.div className="club-card" whileHover={hoverEffect}>
          <div className="icon-circle">
            <img src={vector5} alt="Decor" />
          </div>
          <h4>DECOR</h4>
          <p>Creativity, color, and craftsmanship that’s what defines our Decor team.</p>
        </motion.div>


        {/* MEDIA */}
        <motion.div className="club-card" whileHover={hoverEffect}>
          <div className="icon-circle">
            <img src={vector3} alt="Media" />
          </div>
          <h4>MEDIA</h4>
          <p>Capturing and sharing ACM's story through creative content.</p>
          <span>Explore</span>
        </motion.div>
      </div>

      <div className="clubs-btn-wrapper">
        <Link to="/teams">
          <button className="learn-more-btn">Learn more →</button>
        </Link>
      </div>

    </section>
  );
};

export default ClubsSection;

