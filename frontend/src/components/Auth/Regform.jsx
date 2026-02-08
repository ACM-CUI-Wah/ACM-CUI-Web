import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import "./Regform.css";

function Regform() {
  const [formData, setFormData] = useState({
    user: {
      first_name: "",
      last_name: "",
      email: "",
      username: "",
      password: "12345",
      role: "STUDENT",
      phone_number: "",
    },
    roll_no: "",
    club: "",
    title: "",
  });

  const [fullName, setFullName] = useState("");

  const clubOptions = [
    { value: "codehub", label: "CodeHub" },
    { value: "graphics_and_media", label: "Graphics and Media" },
    { value: "social_media_and_marketing", label: "Social Media and Marketing" },
    { value: "registration_and_decor", label: "Decor" },
    { value: "events_and_logistics", label: "Events and Logistics" },
  ];

  const executiveTitles = ["PRESIDENT", "VICE PRESIDENT", "SECRETARY", "TREASURER", "ADVISOR", "LEAD ADVISOR", "DIRECTOR OPERATIONS"];
  const isExecutiveTitle = executiveTitles.includes(formData.title);

  const [titleInputMode, setTitleInputMode] = useState(false);
  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const [regNoError, setRegNoError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const currentUserRole = localStorage.getItem("role");
  const currentUserClub = localStorage.getItem("club");

  const isAdmin = currentUserRole === "ADMIN";
  const isLead = currentUserRole === "LEAD";

  useEffect(() => {
    if (isLead && currentUserClub) {
      setFormData((prev) => ({
        ...prev,
        club: currentUserClub,
      }));
    }
  }, [currentUserClub, isLead]);

  const validateRegNo = (value) => {
    const regPattern = /^[A-Z]{2}\d{2}-[A-Z]{3}-\d{3}$/;
    if (!value) {
      setRegNoError("");
      return true;
    }
    if (!regPattern.test(value)) {
      setRegNoError("Format: AB12-ABS-000 (2 letters, 2 digits, dash, 3 letters, dash, 3 digits)");
      return false;
    }
    setRegNoError("");
    return true;
  };

  const validatePhoneNumber = (value) => {
    const phonePattern = /^\+92[0-9]{10}$/;
    if (!value) {
      setPhoneError("");
      return true;
    }
    if (!phonePattern.test(value)) {
      setPhoneError("Phone number must be in format: +923001234567");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "name") {
      setFullName(value);

      const trimmedValue = value.trim();
      const spaceIndex = trimmedValue.indexOf(" ");
      if (spaceIndex === -1) {
        setFormData((prev) => ({
          ...prev,
          user: { ...prev.user, first_name: trimmedValue, last_name: "" },
        }));
      } else {
        const firstName = trimmedValue.substring(0, spaceIndex);
        const lastName = trimmedValue.substring(spaceIndex + 1).trim();
        setFormData((prev) => ({
          ...prev,
          user: { ...prev.user, first_name: firstName, last_name: lastName },
        }));
      }
    } else if (id === "reg") {
      const upperValue = value.toUpperCase();
      const sanitized = upperValue.replace(/[^A-Z0-9-]/g, "");
      const limited = sanitized.slice(0, 12);
      setFormData((prev) => ({ ...prev, roll_no: limited }));
      validateRegNo(limited);
    } else if (id === "phone") {
      const sanitized = value.replace(/[^\d+]/g, "");
      let formatted = sanitized;
      if (sanitized.includes("+")) {
        const firstPlus = sanitized.indexOf("+");
        formatted = "+" + sanitized.slice(firstPlus + 1).replace(/\+/g, "");
      }

      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, phone_number: formatted },
      }));
      validatePhoneNumber(formatted);
    } else if (id === "email") {
      setFormData((prev) => ({ ...prev, user: { ...prev.user, email: value } }));
    } else if (id === "username") {
      setFormData((prev) => ({ ...prev, user: { ...prev.user, username: value } }));
    } else if (id === "pass") {
      setFormData((prev) => ({ ...prev, user: { ...prev.user, password: value } }));
    } else if (id === "club") {
      setFormData((prev) => ({ ...prev, club: value }));
    } else if (id === "role") {
      setFormData((prev) => ({ ...prev, user: { ...prev.user, role: value } }));
    } else if (id === "title-select") {
      if (value === "NULL") {
        setFormData((prev) => ({ ...prev, title: "" }));
        setTitleInputMode(false);
      } else if (value === "custom") {
        setTitleInputMode(true);
        setFormData((prev) => ({ ...prev, title: "" }));
      } else {
        setFormData((prev) => ({ ...prev, title: value }));
        setTitleInputMode(false);
      }
    } else if (id === "title-input") {
      setFormData((prev) => ({ ...prev, title: value.toUpperCase() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const regPattern = /^[A-Z]{2}\d{2}-[A-Z]{3}-\d{3}$/;
    if (!regPattern.test(formData.roll_no)) {
      alert("Invalid Registration Number format.\nPlease use: AB12-ABS-000");
      return;
    }

    const phonePattern = /^\+92[0-9]{10}$/;
    if (!phonePattern.test(formData.user.phone_number)) {
      alert("Invalid Phone Number format.\nPlease use: +923001234567");
      return;
    }

    const execTitles = ["PRESIDENT", "VICE PRESIDENT", "SECRETARY", "TREASURER", "ADVISOR", "LEAD ADVISOR", "DIRECTOR OPERATIONS"];
    const isExec = execTitles.includes(formData.title);
    if (!formData.club && !isExec) {
      alert("Club selection is required for non-executive members.");
      return;
    }

    const dataToSend = {
      ...formData,
      title: formData.title === "" ? "NULL" : formData.title,
    };

    const result = await signup(dataToSend);

    if (result.success) {
      alert("User registered successfully!");
      setFormData({
        user: {
          first_name: "",
          last_name: "",
          email: "",
          username: "",
          password: "12345",
          role: "STUDENT",
          phone_number: "",
        },
        roll_no: "",
        club: isLead ? currentUserClub : "",
        title: "",
      });
      setFullName("");
      setTitleInputMode(false);
      setRegNoError("");
      setPhoneError("");
      return;
    }

    let allErrors = [];

    if (result.message) {
      if (typeof result.message === "string") {
        allErrors.push(result.message);
      } else if (typeof result.message === "object") {
        const extractErrors = (obj, prefix = "") => {
          Object.entries(obj).forEach(([field, value]) => {
            const fieldPath = prefix ? `${prefix}.${field}` : field;

            if (Array.isArray(value)) {
              value.forEach((err) => allErrors.push(`${fieldPath}: ${err}`));
            } else if (typeof value === "object" && value !== null) {
              extractErrors(value, fieldPath);
            } else if (value) {
              allErrors.push(`${fieldPath}: ${value}`);
            }
          });
        };
        extractErrors(result.message);
      }
    }

    if (allErrors.length === 0) {
      if (result.error) allErrors.push(result.error);
      else if (result.data) allErrors.push(JSON.stringify(result.data));
      else allErrors.push("Registration failed. Please try again.");
    }

    alert(allErrors.join("\n"));
  };

  return (
    <div className="regform-container">
      <div className="regform-card">
        <h2 className="regform-title">Registration</h2>

        <form className="regform-form" onSubmit={handleSubmit}>
          {/* Name + Reg No */}
          <div className="regform-row">
            <div className="regform-group regform-w45">
              <label htmlFor="name">NAME</label>
              <input
                type="text"
                className="regform-control"
                id="name"
                placeholder="John Doe"
                value={fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="regform-group regform-w45">
              <label htmlFor="reg">Reg no.</label>
              <input
                type="text"
                className="regform-control"
                id="reg"
                placeholder="AB12-ABS-000"
                value={formData.roll_no}
                onChange={handleChange}
                required
                style={{ borderColor: regNoError ? "#dc3545" : "" }}
              />
              {regNoError && <small className="regform-error">{regNoError}</small>}
            </div>
          </div>

          {/* Username + Email */}
          <div className="regform-row">
            <div className="regform-group regform-w45">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                className="regform-control"
                id="username"
                value={formData.user.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="regform-group regform-w45">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="regform-control"
                id="email"
                value={formData.user.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password + Club */}
          <div className="regform-row">
            <div className="regform-group regform-w45 regform-passwordWrapper">
              <label htmlFor="pass">Password</label>

              <div className="regform-passwordField">
                <input
                  type={showPassword ? "text" : "password"}
                  className="regform-control"
                  id="pass"
                  value={formData.user.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="regform-togglePassword"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="regform-group regform-w45">
              <label htmlFor="club">
                Club{" "}
                {isExecutiveTitle && (
                  <span className="regform-muted">(Optional for Executives)</span>
                )}
              </label>

              <select
                id="club"
                className="regform-control"
                value={formData.club}
                onChange={handleChange}
                disabled={isLead}
                required={!isExecutiveTitle}
              >
                {isAdmin ? (
                  <>
                    <option value="">
                      {isExecutiveTitle ? "-- No Club (ACM Executive) --" : "-- Select Club --"}
                    </option>
                    {clubOptions.map((club) => (
                      <option key={club.value} value={club.value}>
                        {club.label}
                      </option>
                    ))}
                  </>
                ) : isLead ? (
                  <option value={currentUserClub}>
                    {clubOptions.find((c) => c.value === currentUserClub)?.label ||
                      currentUserClub ||
                      "-- No Club Assigned --"}
                  </option>
                ) : (
                  <option value="">-- No Club Assigned --</option>
                )}
              </select>
            </div>
          </div>

          {/* Role + Phone */}
          <div className="regform-row">
            <div className="regform-group regform-w45">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                className="regform-control"
                value={formData.user.role}
                onChange={handleChange}
                required
              >
                <option value="STUDENT">STUDENT</option>
                <option value="LEAD">LEAD</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="regform-group regform-w45">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                className="regform-control"
                placeholder="+923001234567"
                value={formData.user.phone_number}
                onChange={handleChange}
                required
                style={{ borderColor: phoneError ? "#dc3545" : "" }}
              />
              {phoneError && <small className="regform-error">{phoneError}</small>}
            </div>
          </div>

          {/* Title */}
          <div className="regform-row">
            <div className="regform-group regform-w100">
              <label htmlFor="title-select">Title</label>
              <select
                id="title-select"
                className="regform-control"
                value={titleInputMode ? "custom" : formData.title === "" ? "NULL" : formData.title}
                onChange={handleChange}
              >
                <option value="NULL">-- NULL (STUDENT AND LEADS) --</option>
                <option value="GENERAL MEMBER">GENERAL MEMBER</option>
                <option value="PRESIDENT">PRESIDENT</option>
                <option value="VICE PRESIDENT">VICE PRESIDENT</option>
                <option value="TREASURER">TREASURER</option>
                <option value="SECRETARY">SECRETARY</option>
                <option value="ADVISOR">ADVISOR</option>
                <option value="LEAD ADVISOR">LEAD ADVISOR</option>
                <option value="DIRECTOR OPERATIONS">DIRECTOR OPERATIONS</option>
                <option value="custom">-- ENTER CUSTOM TITLE --</option>
              </select>

              {titleInputMode && (
                <input
                  type="text"
                  id="title-input"
                  className="regform-control"
                  placeholder="Enter your custom title"
                  value={formData.title}
                  onChange={handleChange}
                  style={{ marginTop: "10px" }}
                />
              )}
            </div>
          </div>

          <div className="regform-buttonRow">
            <button
              type="submit"
              className="regform-submitBtn"
              disabled={loading || !!regNoError || !!phoneError}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Regform;
