import React from 'react';
import { motion } from "framer-motion";
import "./Hero.css";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.3, 
    },
  },
};

const childVariants = {
  hidden: { y: 50, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 20,
      mass: 1,
    },
  },
};

const RightCol = () => {
  return (
    <motion.div
      className="hero-box p-4"
      variants={containerVariants}
      initial="hidden"
      whileInView="show"            
      viewport={{ once: false, amount: 0.3 }}
    >
      <motion.h2
        className="fw-bold mb-3 text-uppercase"
        variants={childVariants}
      >
        ASSOCIATION OF COMPUTING MACHINERY
      </motion.h2>

      <motion.p
        className="mb-4"
        variants={childVariants}
      >
        ACM (Association for Computing Machinery) is a global organization
        dedicated to advancing computing as a science and profession. It
        provides a platform for students, educators, and professionals to
        collaborate, share ideas, and stay updated with the latest in
        technology. ACM organizes conferences, coding competitions, workshops,
        and seminars to enhance learning and innovation in computer science.
        Through its digital library and publications, members gain access to
        high-quality research and resources.
      </motion.p>
    </motion.div>
  );
};

export default RightCol;
