import React, { useState, useEffect } from "react";
import TeamsCard from "./TeamsCard.jsx";
import "./TeamSection.css";

import codeHubImage from "../../assets/codehub.jpg";
import socialImage from "../../assets/social.jpg";
import eventsImage from "../../assets/events.jpg";
import graphicsImage from "../../assets/graphics.jpg";
import decorImage from "../../assets/decor.jpg";

import Navbar from "../DashboardNavbar/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios";

const teamData = [
  {
    image: codeHubImage,
    title: "Code Hub",
    description:
      "CodeHub is a dynamic club under ACM that brings together students passionate about coding, problem-solving, and technology."
  },
  {
    image: socialImage,
    title: "Social Media & Marketing",
    description:
      "Dedicated to building creativity, communication, and digital presence through modern marketing strategies."
  },
  {
    image: eventsImage,
    title: "Events and Logistics",
    description:
      "The backbone of planning, coordinating, and executing successful ACM events with precision."
  },
  {
    image: graphicsImage,
    title: "Graphics and Media",
    description:
      "Bringing creativity and technology together through design, animation, and visual storytelling."
  },
  {
    image: decorImage,
    title: "Decor",
    description:
      "Ensuring events feel welcoming, vibrant, and well-organized with creative decoration and planning."
  }
];

const TeamSection = () => {
  const [activeIndex, setActiveIndex] = useState(Math.floor(teamData.length / 2));
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch all members from PUBLIC endpoint
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/students/public/");
        const data = res.data;

        // Filter only executive members (not leads or general members)
        const executiveTitles = [
          "PRESIDENT",
          "VICE PRESIDENT",
          "SECRETARY",
          "TREASURER",
          "ADVISOR",
          "LEAD ADVISOR",
          "DIRECTOR OPERATIONS",
          "COORDINATOR"
        ];
        const filtered = data.filter(
          m => m.title && executiveTitles.includes(m.title.toUpperCase())
        );

        setMembers(filtered);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const handleOpenCard = (team) => {
    navigate(`/team/${encodeURIComponent(team.title)}`, {
      state: {
        image: team.image,
        description: team.description
      }
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? teamData.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === teamData.length - 1 ? 0 : prev + 1));
  };

  const getTransformStyles = () => {
    let cardWidth, gap;

    // Define sizes based on your CSS breakpoints
    if (windowWidth <= 480) {
      cardWidth = 240;
      gap = 15;
    } else if (windowWidth <= 768) {
      cardWidth = 260;
      gap = 20;
    } else if (windowWidth <= 1024) {
      cardWidth = 280;
      gap = 30; // Adjusted for tablet
    } else {
      cardWidth = 300;
      gap = 40;
    }

    // Calculate the distance from the start of the track to the center of the active card
    const distanceToActiveCardCenter = (activeIndex * (cardWidth + gap)) + (cardWidth / 2);

    return {
      // We translate NEGATIVE distance. 
      // Since 'left' is 50%, this pulls the active card perfectly to the middle.
      transform: `translateX(-${distanceToActiveCardCenter}px) translateY(-50%)`,
      
      // Inline flex styles to ensure exact math sync
      display: "flex",
      gap: `${gap}px`, 
      
      // Ensure these override any potential CSS conflicts
      position: "absolute",
      left: "50%",
      top: "50%",
    };
  };

  return (
    <>
      <Navbar />
      <div className="team-section">
        <div className="team-container">
          <h1 className="team-title">Our Teams</h1>

          <div className="carousel-wrapper">
            <button className="nav-btn prev-btn" onClick={handlePrev} aria-label="Previous team">
              &#8249;
            </button>

            <div className="team-track" style={getTransformStyles()}>
              {teamData.map((team, index) => {
                const isActive = index === activeIndex;

                return (
                  <div
                    key={index}
                    className={`card-wrapper ${isActive ? "active" : "inactive"}`}
                    onClick={isActive ? () => handleOpenCard(team) : undefined}
                  >
                    <TeamsCard
                      image={team.image}
                      title={team.title}
                      description={team.description}
                    />
                  </div>
                );
              })}
            </div>

            <button className="nav-btn next-btn" onClick={handleNext} aria-label="Next team">
              &#8250;
            </button>
          </div>

          {/* SHOW ALL MEMBERS WITH NON-NULL TITLES */}
          <div className="team-members-preview-container">
            <h2 className="team-members-heading">Executive</h2>

            {loading ? (
              <p>Loading members...</p>
            ) : members.length === 0 ? (
              <p>No executive members found.</p>
            ) : (
              <div className="team-members-grid">
                {members.map((m) => (
                  <div
                    className="preview-member"
                    key={m.id}
                    onClick={() =>
                      navigate(`/member/${m.id}`, { state: m })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <img src={m.profile_pic} alt={m.full_name} />
                    <p className="name">{m.full_name}</p>
                    <p className="role">{m.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeamSection;
