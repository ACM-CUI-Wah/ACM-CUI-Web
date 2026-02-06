import React, { useState, useEffect } from "react";
import axiosInstance from "../../axios";
import "./ViewProfilePage.css"; 


const ViewProfilePage = () => {
  const loggedInUserId = parseInt(localStorage.getItem("user_id"));
  const [studentId, setStudentId] = useState(null);
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    profile_desc: "",
    profile_pic: null,
    user: { first_name: "", last_name: "", email: "", username: "" },
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false); 

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await axiosInstance.get("/students/");
        const students = Array.isArray(res.data) ? res.data : [res.data];
        const foundStudent = students.find(s => s.user && s.user.id === loggedInUserId);

        if (!foundStudent) {
          setMessage("Student record not found");
          return;
        }

        setStudentId(foundStudent.id);
        setStudent(foundStudent);

        setFormData({
          title: foundStudent.title || "",
          profile_desc: foundStudent.profile_desc || "",
          profile_pic: null,
          user: {
            first_name: foundStudent.user.first_name || "",
            last_name: foundStudent.user.last_name || "",
            email: foundStudent.user.email || "",
            username: foundStudent.user.username || "",
          },
        });

        setPreview(foundStudent.profile_pic);
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch student record");
      }
    };

    fetchStudent();
  }, [loggedInUserId]);

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

    setLoading(true);
    setMessage("");

    try {
      const data = new FormData();
      if (formData.title) data.append("title", formData.title);
      if (formData.profile_desc) data.append("profile_desc", formData.profile_desc);
      if (formData.profile_pic) data.append("profile_pic", formData.profile_pic);

      data.append("user[id]", loggedInUserId);
      data.append("user[first_name]", formData.user.first_name);
      data.append("user[last_name]", formData.user.last_name);
      data.append("user[email]", formData.user.email);
      data.append("user[username]", formData.user.username);

      await axiosInstance.patch(`/students/${studentId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Profile updated successfully!");
      alert("Profile updated successfully!");
      setStudent({ ...student, ...formData, user: { ...formData.user } });
      setEditMode(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!studentId) return <p>Loading your profile...</p>;

  return (
    <>
      {/* <Navbar /> */}
      <div className="edit-profile-container">
        <h2>
          Profile{" "}
          <span
            style={{ cursor: "pointer", fontSize: "1rem", marginLeft: "10px" }}
            title="Edit Profile"
            onClick={() => setEditMode(!editMode)}
          >
            ✏️
          </span>
        </h2>
        {message && <p className="message">{message}</p>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div>
            <label>Title</label>
            {editMode ? (
              <input type="text" name="title" value={formData.title} onChange={handleChange} />
            ) : (
              <p>{student.title || "-"}</p>
            )}
          </div>

          <div>
            <label>Profile Description</label>
            {editMode ? (
              <textarea
                name="profile_desc"
                value={formData.profile_desc}
                onChange={handleChange}
                rows="4"
              />
            ) : (
              <p>{student.profile_desc || "-"}</p>
            )}
          </div>

          <div>
            <label>Profile Picture</label>
            {editMode ? (
              <input type="file" name="profile_pic" accept="image/*" onChange={handleChange} />
            ) : null}
            {preview && <img src={preview} alt="Preview" className="profile-preview" />}
          </div>

          {["first_name", "last_name", "email", "username"].map(field => (
            <div key={field}>
              <label>{field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</label>
              {editMode ? (
                <input
                  type={field === "email" ? "email" : "text"}
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
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? "Updating..." : "Save Changes"}
            </button>
          )}
        </form>
      </div>
    </>
  );
};

export default ViewProfilePage;
