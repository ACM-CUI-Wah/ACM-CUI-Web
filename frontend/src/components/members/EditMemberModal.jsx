import React, { useState, useEffect } from "react";
import axiosInstance from "../../axios";
import "./Modal.css";

const inputStyle = {
  width: "100%",
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const EditMemberModal = ({ isOpen, onClose, member, onSave }) => {
  const [formData, setFormData] = useState({
    roll_no: "",
    club: "",
    title: "",
    user: {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      role: "STUDENT",
      phone_number: "",
      birthday: "",
    },
  });

  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const currentUserRole = localStorage.getItem("role");
  const isSuperAdmin = localStorage.getItem("is_superuser") === "true";
  const isAdmin = currentUserRole === "ADMIN";
  const isLead = currentUserRole === "LEAD";
  const loggedInUserId = String(localStorage.getItem("user_id"));

  const targetMemberRole = member?.user?.role;
  const targetUserId = String(member?.user?.id);
  const isSelf = loggedInUserId === targetUserId;

  const canEditTitle =
    isSuperAdmin || (isAdmin && targetMemberRole !== "ADMIN");

  let canEditEmail = false;
  let emailHelperText = "";

  if (isSuperAdmin) {
    canEditEmail = true;
  } else if (isAdmin) {
    if (isSelf || targetMemberRole === "ADMIN") {
      canEditEmail = false;
      emailHelperText = "Ask a Superadmin to change this email.";
    } else {
      canEditEmail = true;
    }
  } else if (isLead) {
    if (isSelf || targetMemberRole === "ADMIN" || targetMemberRole === "LEAD") {
      canEditEmail = false;
      emailHelperText = "Ask an Admin to change this email.";
    } else {
      canEditEmail = true;
    }
  }

  // Title Options List
  const allTitles = [
    { value: "NULL", label: "-- NULL --" },
    { value: "GENERAL MEMBER", label: "GENERAL MEMBER" },
    { value: "CLUB LEAD", label: "CLUB LEAD" },
    { value: "COORDINATOR", label: "COORDINATOR" },
    { value: "PRESIDENT", label: "PRESIDENT" },
    { value: "VICE PRESIDENT", label: "VICE PRESIDENT" },
    { value: "TREASURER", label: "TREASURER" },
    { value: "SECRETARY", label: "SECRETARY" },
    { value: "ADVISOR", label: "ADVISOR" },
    { value: "LEAD ADVISOR", label: "LEAD ADVISOR" },
    { value: "DIRECTOR OPERATIONS", label: "DIRECTOR OPERATIONS" },
  ];

  const availableTitles = allTitles.filter((t) => {
    if (isSuperAdmin) return true;
    if (isAdmin) {
      return !["PRESIDENT", "VICE PRESIDENT", "SECRETARY", "DIRECTOR OPERATIONS"].includes(t.value);
    }
    return false;
  });

  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id,
        roll_no: member.roll_no || "",
        club: member.club || "",
        title: member.title || "",
        user: {
          id: member.user.id,
          first_name: member.user?.first_name || "",
          last_name: member.user?.last_name || "",
          email: member.user?.email || "",
          username: member.user?.username || "",
          role: member.user?.role || "STUDENT",
          phone_number: member.user?.phone_number || "",
          birthday: member.user?.birthday || "",
        },
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setFormData((prev) => ({ ...prev, title: value.toUpperCase() }));
      return;
    }

    if (["roll_no", "club"].includes(name)) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          [name]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const adminTitles = ["PRESIDENT", "VICE PRESIDENT", "SECRETARY", "DIRECTOR OPERATIONS"];
      const leadTitles = ["COORDINATOR", "CLUB LEAD"];

      const selectedTitle = formData.title === "" ? "NULL" : formData.title;
      let assignedRole = "STUDENT";

      if (adminTitles.includes(selectedTitle)) {
        assignedRole = "ADMIN";
      } else if (leadTitles.includes(selectedTitle)) {
        assignedRole = "LEAD";
      }

      const dataToSend = {};

      if (formData.roll_no !== member.roll_no) {
        dataToSend.roll_no = formData.roll_no;
      }
      if (formData.club !== member.club) {
        dataToSend.club = formData.club;
      }
      if (formData.title !== member.title) {
        dataToSend.title = selectedTitle;
      }

      const userData = {};
      const userFields = [
        "first_name",
        "last_name",
        "email",
        "username",
        "phone_number",
        "birthday",
      ];

      userFields.forEach((key) => {
        if (formData.user[key] !== member.user[key]) {
          userData[key] = formData.user[key];
        }
      });

      if (assignedRole !== member.user.role) {
        userData.role = assignedRole;
      }

      if (Object.keys(userData).length > 0) {
        userData.id = member.user.id;
        dataToSend.user = userData;
      }

      await axiosInstance.patch(`/students/${member.id}`, dataToSend);

      alert("Member updated successfully!");
      onSave();
      onClose();
    } catch (err) {
      console.error("Update failed:", err.response?.data || err.message);
      if (err.response?.data?.user?.email) {
        setError("Email already exists or is invalid.");
      } else {
        setError(
          JSON.stringify(err.response?.data) || "Failed to update member."
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className=" edit-member-modal modal-overlay" onClick={onClose}>
      <div
        className="edit-member-modal-content modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <p className="error-message">{error}</p>}
            <div className="modal-header">
              <h2>Edit Member: {member.user.username}</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
              >
                &times;
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="roll_no">Roll No.</label>
              <input
                type="text"
                id="roll_no"
                name="roll_no"
                value={formData.roll_no}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label htmlFor="club">Club</label>
              <select
                id="club"
                name="club"
                value={formData.club}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                <option value="">-- Select a Club --</option>
                <option value="CODEHUB">CodeHub</option>
                <option value="GRAPHICS">Graphics</option>
                <option value="MEDIA">Media</option>
                <option value="SOCIAL_MEDIA_MARKETING">
                  Social Media & Marketing
                </option>
                <option value="DECOR">Decor</option>
                <option value="EVENTS_LOGISTICS">Events & Logistics</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="first_name">First Name</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.user.first_name}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">Last Name</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.user.last_name}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.user.email}
                onChange={handleChange}
                disabled={!canEditEmail}
                style={inputStyle}
              />
              {!canEditEmail && (
                <small style={{ color: "#888", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {emailHelperText}
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.user.username}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone_number">Phone Number</label>
              <input
                type="text"
                id="phone_number"
                name="phone_number"
                value={formData.user.phone_number}
                onChange={handleChange}
                placeholder="+92XXXXXXXXXX"
                style={inputStyle}
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthday">Birthday</label>
              <input
                type="date"
                id="birthday"
                name="birthday"
                value={formData.user.birthday}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

           
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <select
                id="title"
                name="title"
                value={formData.title === "" ? "NULL" : formData.title}
                onChange={handleChange}
                disabled={!canEditTitle}
                style={inputStyle}
              >
                {availableTitles.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {!canEditTitle && (
                <small style={{ color: "#888", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  You do not have permission to change this member's title.
                </small>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className=" btn-design" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-design"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMemberModal;