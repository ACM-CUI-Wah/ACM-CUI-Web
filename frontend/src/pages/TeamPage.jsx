import React, { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import Navbar from "../components/DashboardNavbar/Navbar";
import MemberCard from "../components/members/MemberCard";
import "../styles/TeamPage.css";
import axiosInstance from "../axios";

const TeamPage = () => {
  const { title } = useParams();
  const location = useLocation();
  const { image, role, description } = location.state || {};

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const clubMap = {
    "Code Hub": "CODEHUB",
    "Graphics": "GRAPHICS",
    "Social Media & Marketing": "SOCIAL_MEDIA_MARKETING",
    "Decor": "DECOR",
    "Events and Logistics": "EVENTS_LOGISTICS",
    "Media": "MEDIA"
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        // Fetch from PUBLIC endpoint
        const res = await axiosInstance.get("/students/public/");
        const data = res.data;

        const decodedTitle = decodeURIComponent(title);
        const backendClub = clubMap[decodedTitle];

        // Filter by club
        const filtered = data.filter(student => student.club === backendClub);

        const formatted = filtered.map(student => ({
          id: student.user_id,
          name: student.full_name,
          designation: student.title && student.title !== "NULL" ? student.title : "",
          image: student.profile_pic
        }));

        setMembers(formatted);
      } catch (err) {
        console.error("Error fetching members:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [title]);

  return (
    <div>
      <Navbar />

      <div className="team-detail">
        <div className="team-detail-card">
          {image && (
            <div className="team-detail-image-wrapper">
              <img src={image} alt={title} className="team-detail-image" />
            </div>
          )}
          <div className="team-detail-content">
            <h1 className="team-detail-title">{title}</h1>
            {role && <h3 className="team-detail-role">{role}</h3>}
            <p className="team-detail-description">{description}</p>
            <Link to="/teams" className="back-button">
              ← Back to Teams
            </Link>
          </div>
        </div>
      </div>

      <div className="members-section">
        <div className="members-container">
          <h2 className="members-title">Team Members</h2>

          {loading ? (
            <p>Loading members...</p>
          ) : members.length === 0 ? (
            <p>No members found for this team.</p>
          ) : (
            <div className="members-grid">
              {members.map((member) => (
                <MemberCard
                  key={member.id}
                  image={member.image}
                  name={member.name}
                  designation={member.designation}
                />
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default TeamPage;