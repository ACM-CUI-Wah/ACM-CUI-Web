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
      phone_number: ""
    },
    roll_no: "",
    club: "",
    title: ""
  });

  // Separate state for the full name input field
  const [fullName, setFullName] = useState("");

  // Define all available clubs
  const clubOptions = [
    { value: 'codehub', label: 'CodeHub' },
    { value: 'graphics_and_media', label: 'Graphics and Media' },
    { value: 'social_media_and_marketing', label: 'Social Media and Marketing' },
    { value: 'registration_and_decor', label: 'Registration and Decor' },
    { value: 'events_and_logistics', label: 'Events and Logistics' }
  ];

  // Executive titles that don't require a club (ACM-wide positions)
  const executiveTitles = ['PRESIDENT', 'VICE PRESIDENT', 'SECRETARY', 'TREASURER'];

  // Check if current title is an executive title
  const isExecutiveTitle = executiveTitles.includes(formData.title);

  const [titleInputMode, setTitleInputMode] = useState(false);
  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Validation error states
  const [regNoError, setRegNoError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Get user data from localStorage (stored as separate keys)
  const currentUserRole = localStorage.getItem('role');
  const currentUserClub = localStorage.getItem('club');

  // Check if current logged-in user is ADMIN or LEAD
  const isAdmin = currentUserRole === "ADMIN";
  const isLead = currentUserRole === "LEAD";

  // Debug logs - remove after fixing
  console.log("Current User Role:", currentUserRole);
  console.log("Is Admin:", isAdmin);
  console.log("Is Lead:", isLead);
  console.log("Current User Club:", currentUserClub);

  // Set the user's club by default when component mounts
  useEffect(() => {
    if (isLead && currentUserClub) {
      // LEADs can only assign their own club
      setFormData((prev) => ({
        ...prev,
        club: currentUserClub
      }));
    }
    // ADMINs don't need any default club - they select from dropdown
  }, [currentUserClub, isAdmin, isLead]);

  // Validation functions
  const validateRegNo = (value) => {
    // Pattern: AB12-ABS-000 (2 letters, 2 digits, dash, 3 letters, dash, 3 digits)
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
  // Strict +92XXXXXXXXXX format
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
      // Store the raw name value to preserve spaces while typing
      setFullName(value);

      // Parse first and last name for form submission
      const trimmedValue = value.trim();
      const spaceIndex = trimmedValue.indexOf(" ");
      if (spaceIndex === -1) {
        setFormData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            first_name: trimmedValue,
            last_name: ""
          }
        }));
      } else {
        const firstName = trimmedValue.substring(0, spaceIndex);
        const lastName = trimmedValue.substring(spaceIndex + 1).trim();
        setFormData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            first_name: firstName,
            last_name: lastName
          }
        }));
      }
    } else if (id === "reg") {
      // Convert to uppercase and validate format
      const upperValue = value.toUpperCase();
      
      // Only allow valid characters: letters, numbers, and dash
      const sanitized = upperValue.replace(/[^A-Z0-9-]/g, '');
      
      // Limit length to match pattern AB12-ABS-000 (12 characters)
      const limited = sanitized.slice(0, 12);
      
      setFormData((prev) => ({ ...prev, roll_no: limited }));
      validateRegNo(limited);
    } else if (id === "phone") {
      // Only allow numbers, plus sign at start
      const sanitized = value.replace(/[^\d+]/g, '');
      
      // Ensure + is only at the start
      let formatted = sanitized;
      if (sanitized.includes('+')) {
        const firstPlus = sanitized.indexOf('+');
        formatted = '+' + sanitized.slice(firstPlus + 1).replace(/\+/g, '');
      }
      
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, phone_number: formatted }
      }));
      validatePhoneNumber(formatted);
    } else if (id === "email") {
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, email: value }
      }));
    } else if (id === "username") {
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, username: value }
      }));
    } else if (id === "pass") {
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, password: value }
      }));
    } else if (id === "club") {
      setFormData((prev) => ({ ...prev, club: value }));
    } else if (id === "role") {
      setFormData((prev) => ({
        ...prev,
        user: { ...prev.user, role: value }
      }));
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
      setFormData((prev) => ({
        ...prev,
        title: value.toUpperCase()
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Registration Number
    const regPattern = /^[A-Z]{2}\d{2}-[A-Z]{3}-\d{3}$/;
    if (!regPattern.test(formData.roll_no)) {
      alert("Invalid Registration Number format.\nPlease use: AB12-ABS-000\n(2 letters, 2 digits, dash, 3 letters, dash, 3 digits)");
      return;
    }

    // Validate Phone Number
    const phonePattern = /^\+92[0-9]{10}$/;
if (!phonePattern.test(formData.user.phone_number)) {
  alert("Invalid Phone Number format.\nPlease use: +923001234567");
  return;
}


    // Club is required only for non-executive titles
    const execTitles = ['PRESIDENT', 'VICE PRESIDENT', 'SECRETARY', 'TREASURER'];
    const isExec = execTitles.includes(formData.title);
    if (!formData.club && !isExec) {
      alert("Club selection is required for non-executive members.");
      return;
    }

    const dataToSend = {
      ...formData,
      title: formData.title === "" ? "NULL" : formData.title
    };

    const result = await signup(dataToSend);
    console.log("=== SIGNUP RESULT ===");
    console.log("result:", result);
    console.log("result.message:", result.message);
    console.log("=== END RESULT ===");

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
          phone_number: ""
        },
        roll_no: "",
        club: isLead ? currentUserClub : "",
        title: ""
      });
      setFullName("");
      setTitleInputMode(false);
      setRegNoError("");
      setPhoneError("");
      return;
    }

    let allErrors = [];

    if (result.message) {
      console.log("Extracting from result.message:", result.message);

      if (typeof result.message === "string") {
        allErrors.push(result.message);
      } else if (typeof result.message === "object") {
        const extractErrors = (obj, prefix = "") => {
          Object.entries(obj).forEach(([field, value]) => {
            const fieldPath = prefix ? `${prefix}.${field}` : field;

            if (Array.isArray(value)) {
              value.forEach(err => {
                allErrors.push(`${fieldPath}: ${err}`);
              });
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
      if (result.error) {
        allErrors.push(result.error);
      } else if (result.data) {
        allErrors.push(JSON.stringify(result.data));
      } else {
        allErrors.push("Registration failed. Please try again.");
      }
    }

    console.log("Final allErrors:", allErrors);
    alert(allErrors.join("\n"));
  };

  return (
    <>
      <div className="regform-container">
        <div className="form-oval">
          <h2 className="dashboard-title">Registration</h2>
          <form className="form" onSubmit={handleSubmit}>
            {/* Name + Reg No */}
            <div className="form-row">
              <div className="form-group2 w-45">
                <label htmlFor="name">NAME</label>
                <input
                  type="text"
                  className="form-control2"
                  id="name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group2 w-45">
                <label htmlFor="reg">Reg no.</label>
                <input
                  type="text"
                  className="form-control2"
                  id="reg"
                  placeholder="AB12-ABS-000"
                  value={formData.roll_no}
                  onChange={handleChange}
                  required
                  style={{ borderColor: regNoError ? '#dc3545' : '' }}
                />
                {regNoError && (
                  <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                    {regNoError}
                  </small>
                )}
              </div>
            </div>

            {/* Username + Email */}
            <div className="form-row">
              <div className="form-group2 w-45">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  className="form-control2"
                  id="username"
                  value={formData.user.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group2 w-45">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  className="form-control2"
                  id="email"
                  value={formData.user.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password + Club */}
            <div className="form-row">
              <div className="form-group2 w-45 password-wrapper">
                <label htmlFor="pass">Password</label>
                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control2"
                    id="pass"
                    value={formData.user.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group2 w-45">
                <label htmlFor="club">Club {isExecutiveTitle && <span style={{ fontSize: '12px', color: '#666' }}>(Optional for Executives)</span>}</label>
                <select
                  id="club"
                  className="form-control2"
                  value={formData.club}
                  onChange={handleChange}
                  disabled={isLead}
                  required={!isExecutiveTitle}
                >
                  {isAdmin ? (
                    <>
                      <option value="">{isExecutiveTitle ? "-- No Club (ACM Executive) --" : "-- Select Club --"}</option>
                      {clubOptions.map(club => (
                        <option key={club.value} value={club.value}>
                          {club.label}
                        </option>
                      ))}
                    </>
                  ) : isLead ? (
                    <option value={currentUserClub}>
                      {clubOptions.find(c => c.value === currentUserClub)?.label || currentUserClub || "-- No Club Assigned --"}
                    </option>
                  ) : (
                    <option value="">-- No Club Assigned --</option>
                  )}
                </select>
              </div>
            </div>

            {/* Role + Phone */}
            <div className="form-row">
              <div className="form-group2 w-45">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  className="form-control2"
                  value={formData.user.role}
                  onChange={handleChange}
                  required
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="LEAD">LEAD</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="form-group2 w-45">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="text"
                  id="phone"
                  className="form-control2"
                  placeholder="+923001234567"
                  value={formData.user.phone_number}
                  onChange={handleChange}
                  required
                  style={{ borderColor: phoneError ? '#dc3545' : '' }}
                />
                {phoneError && (
                  <small style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>
                    {phoneError}
                  </small>
                )}
              </div>
            </div>

            {/* Title - Dropdown with custom input option */}
            <div className="form-row">
              <div className="form-group2 w-100">
                <label htmlFor="title-select">Title </label>
                <select
                  id="title-select"
                  className="form-control2"
                  value={
                    titleInputMode ? "custom" : 
                    (formData.title === "" ? "NULL" : formData.title)
                  }
                  onChange={handleChange}
                >
                  <option value="NULL">-- NULL (STUDENT AND LEADS) --</option>
                  <option value="GENERAL MEMBER">GENERAL MEMBER</option>
                  <option value="PRESIDENT">PRESIDENT</option>
                  <option value="VICE PRESIDENT">VICE PRESIDENT</option>
                  <option value="TREASURER">TREASURER</option>
                  <option value="SECRETARY">SECRETARY</option>
                  
                  <option value="custom">-- ENTER CUSTOM TITLE --</option>
                </select>

                {titleInputMode && (
                  <input
                    type="text"
                    id="title-input"
                    className="form-control2"
                    placeholder="Enter your custom title"
                    value={formData.title}
                    onChange={handleChange}
                    style={{ marginTop: "10px" }}
                  />
                )}
              </div>
            </div>

            <div className="button-row">
              <button
                type="submit"
                className="btn-design btn"
                style={{ padding: 13 }}
                disabled={loading || regNoError || phoneError}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Regform;