import React, { useEffect, useState } from "react";
import { BsSun, BsMoon } from "react-icons/bs"; 
import "./DashboardNavbar/Navbar.css"; 

const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`toggle-switch me-2 ${isDarkMode ? "dark" : ""}`} onClick={toggleTheme}>
      <div className="toggle-circle">
        {isDarkMode ? <BsMoon size={14} /> : <BsSun size={14} />}
      </div>
    </div>
  );
};

export default ThemeToggle;
