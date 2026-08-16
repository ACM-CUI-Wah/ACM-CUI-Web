import React, { useState, useEffect } from "react";
import axiosInstance from "../../axios";
import { FiEdit } from "react-icons/fi"; 
import "./ProfilePage.css"; 

const ProfilePage = () => {
  const loggedInUserId = parseInt(localStorage.getItem("user_id"));
  const [studentId, setStudentId] = useState(null);
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    profile_desc: "",
    profile_pic_url: null,
    user: { first_name: "", last_name: "", email: "", username: "" },
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentIdFromLS = localStorage.getItem("student_id");

        if (!studentIdFromLS) {
          setMessage("student_id missing in localStorage. Please login again.");
          return;
        }

        const res = await axiosInstance.get(`/students/${studentIdFromLS}`);
        const foundStudent = res.data;

        setStudentId(foundStudent.id);
        setStudent(foundStudent);

        setFormData({
          profile_desc: foundStudent.profile_desc || "",
          profile_pic_url: null,
          user: {
            first_name: foundStudent.user?.first_name || "",
            last_name: foundStudent.user?.last_name || "",
            email: foundStudent.user?.email || "",
            username: foundStudent.user?.username || "",
          },
        });

        setPreview(foundStudent.profile_pic_url);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch student record");
      }
    };

    fetchStudent();
  }, []);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else if (["first_name", "last_name", "email", "username"].includes(name)) {
      setFormData(prev => ({ ...prev, user: { ...prev.user, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!studentId) return;

    if (formData.profile_desc && formData.profile_desc.length > 200) {
      alert("Profile description cannot exceed 200 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const jsonPayload = {
        profile_desc: formData.profile_desc,
        user: {
          first_name: formData.user.first_name,
          last_name: formData.user.last_name,
          username: formData.user.username,
        }
      };

      await axiosInstance.patch(`/students/${studentId}`, jsonPayload);

      if (formData.profile_pic) {
        const imageFormData = new FormData();
        imageFormData.append("profile_pic", formData.profile_pic);

        await axiosInstance.patch(`/students/${studentId}`, imageFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setMessage("Profile updated successfully!");
      alert("Profile updated successfully!");
      setStudent({ ...student, ...formData, user: { ...formData.user } });
      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      
      if (err.response?.data?.user?.username) {
        alert("That username is already taken. Please try another one.");
      } else {
        setMessage("Failed to update profile.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      profile_desc: student.profile_desc || "",
      profile_pic_url: null,
      user: {
        first_name: student.user.first_name || "",
        last_name: student.user.last_name || "",
        email: student.user.email || "",
        username: student.user.username || "",
      },
    });
    setPreview(student.profile_pic_url);
    setEditMode(false);
    setMessage("");
  };

  if (!studentId) return <p>Loading your profile...</p>;

  return (
    <div className="profile-container">
      <h2>
        Profile{" "}
        <span
          className="edit-icon"
          title="Edit Profile"
          onClick={() => setEditMode(!editMode)}
          style={{ cursor: "pointer" }}
        >
          <FiEdit size={20} />
        </span>
      </h2>
      {message && <p className="message">{message}</p>}

      <form onSubmit={handleSubmit} className="profile-form">
        <div>
          <label>Profile Description</label>
          {editMode ? (
            <textarea
              name="profile_desc"
              value={formData.profile_desc}
              placeholder="Profile Description should not exceed 200 characters"
              onChange={handleChange}
              rows="4"
            />
          ) : (
            <p>{student.profile_desc || "-"}</p>
          )}
        </div>

        <div>
          <label>Profile Picture</label>
          {editMode && (
            <input
              type="file"
              name="profile_pic"
              accept="image/*"
              onChange={handleChange}
            />
          )}
          {preview && (
            <img src={preview} alt="Preview" className="profile-preview" />
          )}
        </div>

        {["first_name", "last_name", "email", "username"].map(field => (
          <div key={field}>
            <label>{field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</label>
            {field === "email" ? (
              <>
                <p>{student.user.email}</p>
                <small style={{ color: "#888", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  You can not change your own email
                </small>
              </>
            ) : editMode ? (
              <input
                type="text"
                name={field}
                value={formData.user[field]}
                onChange={handleChange}
              />
            ) : (
              <p>{student.user[field]}</p>
            )}
          </div>
        ))}

        {editMode && (
          <div className="button-group">
            <button type="submit" disabled={loading} className="ep-submit-btn">
              {loading ? "Updating..." : "Save Changes"}
            </button>
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfilePage;