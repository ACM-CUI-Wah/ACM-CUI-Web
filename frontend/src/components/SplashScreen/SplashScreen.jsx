import React, { useEffect, useState } from "react";
import "./SplashScreen.css";
import logo from "../../assets/ACMlogo.png";

function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);
  const [showRect, setShowRect] = useState(true);
  const [isSlidingOut, setIsSlidingOut] = useState(false);

  useEffect(() => {
    const slideTimer = setTimeout(() => {
      setIsSlidingOut(true);
      setTimeout(() => {
        setShowRect(false);
      }, 1200);
    }, 1500);

    return () => clearTimeout(slideTimer);
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        if (onFinish) onFinish();
      }, 1000);
    }, 4000);
    return () => clearTimeout(fadeTimer);
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
      <div
        className="logo-stage fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <div className="logo-container reveal-wrapper">
          <div className="logo-text-row">
            <img src={logo} alt="ACM Logo" className="splash-logo" />
            <h1 className="company-name">
              ACM CUI WAH CHAPTER
            </h1>
          </div>

          {showRect && (
            <div
              className={`white-rect ${isSlidingOut ? "slide-out" : ""}`}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
