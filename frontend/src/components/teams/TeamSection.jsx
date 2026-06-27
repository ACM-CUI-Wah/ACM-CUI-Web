import React, { useState, useEffect } from "react";
import TeamsCard from "./TeamsCard.jsx";
import "./TeamSection.css";

import codeHubImage from "../../assets/codehub_club01.png";
import socialImage from "../../assets/marketing_club01.png";
import mediaImage from "../../assets/media_club01.png";
import eventsImage from "../../assets/events_club01.png";
import graphicsImage from "../../assets/graphics_club01.png";
import decorImage from "../../assets/decor_club01.png";

import Navbar from "../DashboardNavbar/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios";

const teamData = [
  {
    image: codeHubImage,
    title: "Code Hub",
    description:
      "Introducing the heart of innovation our Code Hub team. This is where curiosity meets creation. From exploring new technologies to developing efficient solutions, the Code Hub empowers members to learn, collaborate, and grow as developers. Their mission? To turn ideas into impactful code and shape the next generation of tech leaders"
  },
  {
    image: socialImage,
    title: "Social Media & Marketing",
    description:
      "At ACM, our Social Media & Marketing team is the creative force behind our digital presence. From crafting strategic campaigns to designing engaging content, this team ensures that every post reflects our vision and connects with our audience. They bring ideas to life, build our community online, and make sure ACM’s story is heard across every platform."
  },
  {
    image: mediaImage,
    title: "Media",
    description:
      "Our Media team captures the essence of ACM one frame at a time. From event coverage to storytelling through visuals, they ensure that every moment is documented with creativity and precision. Their lens brings ACM’s spirit to life, preserving memories and showcasing the passion behind every project."
  },
  {
    image: eventsImage,
    title: "Events and Logistics",
    description:
      "Every great experience starts with thoughtful planning and that’s exactly what our Events team does best. From concept to execution, they organize engaging sessions, workshops, and celebrations that bring our community together. Their creativity and coordination ensure that every ACM event leaves a lasting impact."
  },
  {
    image: graphicsImage,
    title: "Graphics",
    description:
      "Design is intelligence made visible and our Graphics team embodies that perfectly. They transform ideas into visuals that communicate, inspire, and engage. From digital posters to event branding, their work adds aesthetic value and strengthens ACM’s identity across all platforms."
  },
  {
    image: decorImage,
    title: "Decor",
    description:
      "Creativity, color, and craftsmanship that’s what defines our Decor team. They transform simple spaces into inspiring experiences, giving every ACM event a unique and memorable identity. with attention to every detail, they ensure that the environment reflects the energy and vision of our society."
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

