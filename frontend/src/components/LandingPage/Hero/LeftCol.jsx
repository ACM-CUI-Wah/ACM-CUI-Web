import React, { useEffect, useState } from "react";
import "./Hero.css";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const LeftCol = () => {
  const fullText = "ACM CUI WAH";
  const [visibleText, setVisibleText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [competitions, setCompetitions] = useState(0);
  const [members, setMembers] = useState(0);
  const [events, setEvents] = useState(0);

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.4 }); 
  
  useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const frameRate = 30;
    const totalFrames = Math.round(duration / (1000 / frameRate));

    const animateNumber = (target, setter) => {
      let frame = 0;
      const interval = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        setter(Math.round(target * progress));
        if (frame >= totalFrames) clearInterval(interval);
      }, 1000 / frameRate);
    };

    animateNumber(30, setCompetitions);
    animateNumber(100, setMembers);
    animateNumber(60, setEvents);
  }, [isInView]);

 
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex < fullText.length) {
          setVisibleText(fullText.slice(0, prevIndex + 1));
          return prevIndex + 1;
        } else {
          clearInterval(interval);
          return prevIndex;
        }
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div ref={ref} className="text-center">
      <img
        src="/acm-comsats-wah-chapter.png"
        alt="ACM Logo"
        className="img-fluid hero-logo"
      />
      <h1 className="display-5 fw-bold text-white left-heading blinking-cursor">
        {visibleText}
      </h1>

      <div className="text-center hero-stats">
        <div>
          <h3 className="mb-0 fw-bold text-white">{competitions}+</h3>
          <p className="mb-0 text-white">Competitions</p>
        </div>
        <div>
          <h3 className="mb-0 fw-bold text-white">{members}+</h3>
          <p className="mb-0 text-white">Members</p>
        </div>
        <div>
          <h3 className="mb-0 fw-bold text-white">{events}+</h3>
          <p className="mb-0 text-white">Events</p>
        </div>
      </div>
    </div>
  );
};

export default LeftCol;
