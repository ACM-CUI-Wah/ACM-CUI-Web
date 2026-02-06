import React from "react";
import "./Achievements.css";
import { IoMdArrowForward } from "react-icons/io";
import { motion } from "framer-motion";

const AchievementCard = ({ number = 1, title, description, bgColor = "#0C4182" }) => {
  return (
    <div className="boxcard mt-4" style={{ backgroundColor: bgColor }}>
      <div className="rounded-circle d-flex justify-content-center align-items-center mx-auto">
        {number}
      </div>

      <motion.h4
        className="achievement-title"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.25, 0.8, 0.25, 1] }}
        viewport={{ once: false, amount: 0.3 }}
      >
        {title ? (
          title
        ) : (
          <>
            <span className="big-o">O</span>rganized <br />
            National Level <br />
            Coding <br />
            Competition:
          </>
        )}
      </motion.h4>

      <motion.p
        className="acheivement-text"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.25, 0.8, 0.25, 1], delay: 0.2 }}
        viewport={{ once: false, amount: 0.3 }}
      >
        {description ||
          "Our ACM chapter successfully hosted a nationwide coding contest, attracting participants from top universities and encouraging competitive programming skills among students."}
      </motion.p>

      <motion.p
        className="arrow"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.25, 0.8, 0.25, 1], delay: 0.4 }}
        viewport={{ once: false, amount: 0.3 }}
      >
        <IoMdArrowForward />
      </motion.p>
    </div>
  );
};

export default AchievementCard;
