import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileOptions.css";
import useAuthStore from "../../store/authStore";
import axiosInstance from "../../axios";

const ProfileOptions = ({ closeDropdown }) => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [profilePic, setProfilePic] = useState(null);

  const studentId = localStorage.getItem("student_id");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!studentId) return;

        // ✅ single student request
        const res = await axiosInstance.get(`/students/${studentId}`);
        const user = res.data;

        if (user?.profile_pic_url) {
          setProfilePic(user.profile_pic_url);
        }
      } catch (err) {
        console.error("Failed to fetch profile picture:", err?.response?.data || err.message);
      }
    };

    fetchProfile();
  }, [studentId]);

  const handleLogout = () => {
    logout();

    // optional: clear storage
    localStorage.removeItem("student_id");
    localStorage.removeItem("user_id");
    localStorage.removeItem("token");

    window.location.href = "/login";
  };

  return (
    <div className="profile-options-box">
      <div className="profile-icon">
        {profilePic ? (
          <img
            src={profilePic}
            alt="Profile"
            style={{
              width: "74px",
              height: "74px",
              borderRadius: "50%",
              objectFit: "cover"
            }}
          />
        ) : (
          <div
            style={{
              width: "74px",
              height: "74px",
              borderRadius: "50%",
              backgroundColor: "#ccc"
            }}
          />
        )}
      </div>

      <button
  className="option-btn"
  onClick={() => {
    closeDropdown();
    navigate("/dashboard/edit-profile");
  }}
>
  Profile
</button>

<button
  className="option-btn"
  onClick={() => {
    closeDropdown();
    navigate("/dashboard/otp");
  }}
>
  Reset Password
</button>

      <button
  className="option-btn"
  onClick={() => {
    closeDropdown();
    handleLogout();
  }}
>
  Logout
</button>
    </div>
  );
};

export default ProfileOptions;
