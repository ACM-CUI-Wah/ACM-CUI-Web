import React, { useState, useEffect } from "react";
import EventsSection from "../../components/LandingPage/Events/EventSection.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Achievements from "../../components/LandingPage/Achievements/Achievements.jsx"; 
import Blog from "../../components/LandingPage/Blog/Blog.jsx";
import NavbarComponent from "../../components/LandingPage/Navbar/NavbarComponent.jsx";
import Hero from "../../components/LandingPage/Hero/Hero.jsx";
import ClubsSection from "../../components/LandingPage/Clubs/ClubsSection.jsx";
import MissionSection from "../../components/LandingPage/Mission/MissionSection.jsx";
import SplashScreen from "../../components/SplashScreen/SplashScreen.jsx";
import HackathonManagement from "../Hackathon/HackathonManagement.jsx";
import "./LandingPage.css";

const LandingPage = () => {
  // Check if splash was already shown in this session
  const splashAlreadyShown = sessionStorage.getItem("splashShown") === "true";
  const [showSplash, setShowSplash] = useState(!splashAlreadyShown);
  const [contentReady, setContentReady] = useState(splashAlreadyShown);

  useEffect(() => {
    if (!showSplash) return;

    const timer = setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("splashShown", "true");
    }, 5000);
    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    if (!showSplash) {
      const delay = setTimeout(() => {
        window.scrollTo(0, 0);
        setContentReady(true);
      }, 50);
      return () => clearTimeout(delay);
    }
  }, [showSplash]);

  if (showSplash) {
    return (
      <div style={{ overflow: "hidden", height: "100vh" }}>
        <SplashScreen onFinish={() => {
          setShowSplash(false);
          sessionStorage.setItem("splashShown", "true");
        }} />
      </div>
    );
  }

  if (!contentReady) return null;

  return (
    <div className="landing-page" style={{ animation: "fadeIn 0.8s ease" }}>
      <NavbarComponent />
      <main className="overflow-hidden">
        <div id="hero"><Hero /></div>
        <div id="achievement"><Achievements /></div>
        <div id="clubs"><ClubsSection /></div>
        <div id="blogs"><Blog /></div>
        <div id="events"><EventsSection /></div>
        <div id="hackathon"><HackathonManagement/></div>
        <div id="mission"><MissionSection /></div>
      </main>
      <Footer/>
    </div>
  );
};

export default LandingPage;
