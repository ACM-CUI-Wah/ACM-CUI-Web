import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./MissionsSection.css";
import { motion } from "framer-motion";

import Brush from "../../../assets/brush.png";
import Waves from "../../../assets/waves.png";


const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 70, damping: 20, duration: 0.8 },
  },
};

const MissionSection = () => {
  return (
    <div className="mission-container">
      <div className="scaled-wrapper">
        <img src={Waves} alt="Waves" className="waves-image" />
        <div className="container-fluid d-flex justify-content-center p-5">
          <div className="content-container">
            <img src={Brush} alt="Brush" className="brush-image" />

           
            <motion.h1
              className="heading"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: false, amount: 0.3 }}
            >
              Our Mission
            </motion.h1>

     
            <motion.p
              className="mission-text"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              transition={{ delay: 0.2, type: "spring", stiffness: 70 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              Our mission is to empower students through technology, innovation,
              and collaboration. We aim to create a dynamic learning environment
              where students can enhance their skills, share ideas, and grow as
              future leaders in tech. Through workshops, competitions, and
              community events, we strive to inspire and uplift the next
              generation of computing professionals.
            </motion.p>

            <motion.div
              className="text-center"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              transition={{ delay: 0.4 }}
              viewport={{ once: false, amount: 0.3 }}
            >
              <button
                type="button"
                className="btn missions-learn-more-btn"
              >
                Learn more →
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSection;
