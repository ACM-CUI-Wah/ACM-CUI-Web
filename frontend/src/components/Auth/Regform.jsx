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
      birthday: "",
    },
    roll_no: "",
    club: "",
    title: "",
  });

  const [fullName, setFullName] = useState("");
  const currentUserRole = localStorage.getItem("role");
  const currentUserClub = localStorage.getItem("club");

  const isAdmin = currentUserRole === "ADMIN";
  const isLead = currentUserRole === "LEAD";

  const isSuperAdmin =
    localStorage.getItem("is_superuser") === "true";

  const clubOptions = [
    { value: "CODEHUB", label: "CodeHub" },
    { value: "GRAPHICS", label: "Graphics" },
    { value: "MEDIA", label: "Media" },
    { value: "SOCIAL_MEDIA_MARKETING", label: "Social Media and Marketing" },
    { value: "DECOR", label: "Decor" },
    { value: "EVENTS_LOGISTICS", label: "Events and Logistics" },
  ];

  const executiveTitles = [
    "PRESIDENT",
    "VICE PRESIDENT",
    "SECRETARY",
    "TREASURER",
    "COORDINATOR",
    "ADVISOR",
    "LEAD ADVISOR",
    "DIRECTOR OPERATIONS",
  ];
  const isExecutiveTitle = executiveTitles.includes(formData.title);

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
      return ![
        "PRESIDENT",
        "VICE PRESIDENT",
        "SECRETARY",
        "DIRECTOR OPERATIONS",
      ].includes(t.value);
    }
    if (isLead) {
      return ["NULL", "GENERAL MEMBER"].includes(t.value);
    }
    return false;
  });

  const [titleInputMode, setTitleInputMode] = useState(false);
  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();

  const [regNoError, setRegNoError] = useState("");
  const [phoneError, setPhoneError] = useState("");

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
      setRegNoError(
        "Format: AB12-ABS-000 (2 letters, 2 digits, dash, 3 letters, dash, 3 digits)",
      );
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
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, email: value },
      }));
    } else if (id === "username") {
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, username: value },
      }));
    } else if (id === "birthday") {
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, birthday: value },
      }));
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

    const execTitles = [
      "PRESIDENT",
      "VICE PRESIDENT",
      "SECRETARY",
      "TREASURER",
      "COORDINATOR",
      "ADVISOR",
      "LEAD ADVISOR",
      "DIRECTOR OPERATIONS",
    ];
    const isExec = execTitles.includes(formData.title);
    if (!formData.club && !isExec) {
      alert("Club selection is required for non-executive members.");
      return;
    }

    //automatically assign role based on selected title
    const adminTitles = [
      "PRESIDENT",
      "VICE PRESIDENT",
      "SECRETARY",
      "DIRECTOR OPERATIONS",
    ];
    const leadTitles = ["COORDINATOR", "CLUB LEAD"];

    const selectedTitle = formData.title === "" ? "NULL" : formData.title;
    let assignedRole = "STUDENT"; // Default role

    if (adminTitles.includes(selectedTitle)) {
      assignedRole = "ADMIN";
    } else if (leadTitles.includes(selectedTitle)) {
      assignedRole = "LEAD";
    }

    const dataToSend = {
      ...formData,
      title: selectedTitle,
      user: {
        ...formData.user,
        role: assignedRole,
      },
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
          birthday: "",
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
              {regNoError && (
                <small className="regform-error">{regNoError}</small>
              )}
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

          <div className="regform-row">
            <div className="regform-group regform-w45" style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '6px', border: '1px solid #e9ecef' }}>
              <small style={{ color: '#6c757d', margin: 0 }}>
                <strong>Note:</strong> A default password will automatically be emailed to this member upon registration.
              </small>
            </div>

            <div className="regform-group regform-w45">
              <label htmlFor="club">
                Club{" "}
                {isExecutiveTitle && (
                  <span className="regform-muted">
                    (Optional for Executives)
                  </span>
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
                      {isExecutiveTitle
                        ? "-- No Club (ACM Executive) --"
                        : "-- Select Club --"}
                    </option>
                    {clubOptions.map((club) => (
                      <option key={club.value} value={club.value}>
                        {club.label}
                      </option>
                    ))}
                  </>
                ) : isLead ? (
                  <option value={currentUserClub}>
                    {clubOptions.find((c) => c.value === currentUserClub)
                      ?.label ||
                      currentUserClub ||
                      "-- No Club Assigned --"}
                  </option>
                ) : (
                  <option value="">-- No Club Assigned --</option>
                )}
              </select>
            </div>
          </div>
          {/* Phone + Birthday  */}
          <div className="regform-row">
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
              {phoneError && (
                <small className="regform-error">{phoneError}</small>
              )}
            </div>

            <div className="regform-group regform-w45">
              <label htmlFor="birthday">Birthday</label>
              <input
                type="date"
                id="birthday"
                className="regform-control"
                value={formData.user.birthday}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Title */}
          <div className="regform-row">
            <div className="regform-group regform-w100">
              <label htmlFor="title-select">Title</label>
              <select
                id="title-select"
                className="regform-control"
                value={
                  titleInputMode
                    ? "custom"
                    : formData.title === ""
                      ? "NULL"
                      : formData.title
                }
                onChange={handleChange}
              >
                {availableTitles.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
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