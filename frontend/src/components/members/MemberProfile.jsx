import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../axios";
import "./MemberProfile.css";
import Navbar from "../DashboardNavbar/Navbar";

const MemberProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const [member, setMember] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    if (!member) fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMember = async () => {
    try {
      setLoading(true);
      // Fetch all public members and find by ID
      const res = await axiosInstance.get(`/students/public/`);
      const allMembers = res.data;
      const foundMember = allMembers.find(m => m.id === parseInt(id));
      
      if (foundMember) {
        setMember(foundMember);
      } else {
        console.error("Member not found");
      }
    } catch (err) {
      console.error("Failed to fetch member", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  if (!member)
    return <div style={{ padding: 40, textAlign: "center" }}>Member not found.</div>;

  return (
    <>
      <Navbar />
      <div className="mp-container">
        <div className="mp-box">
          {/* TOP IMAGE */}
          <div className="mp-image-section">
            <img 
              src={member.profile_pic || "https://via.placeholder.com/200"} 
              alt={member.full_name} 
            />
          </div>

          {/* BOTTOM CONTENT */}
          <div className="mp-content">
            <h1>
              This is {member.full_name}, The {member.title} of ACM
            </h1>

            {member.profile_desc && (
              <p>{member.profile_desc}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MemberProfile;