import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/DashboardNavbar/Navbar";
import "./RecruitmentForm.css";
import axiosInstance from "../../axios";

const RecruitmentForm = () => {
  const navigate = useNavigate();
  const alertRef = useRef(null);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);

  const [sessionId, setSessionId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [apiAlert, setApiAlert] = useState(null);

  const [regError, setRegError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [skillsError, setSkillsError] = useState("");
  const [courseworkError, setCourseworkError] = useState("");
  const [availabilityError, setAvailabilityError] = useState("");

  // -------------------------
  // Backend limits (mirror model)
  // -------------------------
  const LIMITS = {
    firstName: 50,
    lastName: 50,
    email: 254, // safe default for EmailField
    phoneNumber: 13, // +92 + 10 digits
    regNumber: 20,
    availability: 100, // weekly_availability CharField(max_length=100)
    // ArrayField items max 50 each
    skillItem: 50,
    courseworkItem: 50,
    // URLField safe cap
    linkedin: 2000,
    // TextField - no model max, but set UI caps to avoid huge payloads
    whyJoin: 1000,
    experience: 1000,
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    regNumber: "",
    semester: "",
    program: "",
    skills: "",
    coursework: "",
    preferredRole: "",
    secondaryRole: "",
    whyJoin: "",
    experience: "",
    availability: "",
    linkedin: "",
  });

  // -------------------------
  // Regex validations
  // -------------------------
  const regNoRegex = /^(SP|FA)\d{2}-[A-Z]{2,5}-\d{3}$/;
  const pkPhoneRegex = /^\+92\d{10}$/;

  // -------------------------
  // Helpers
  // -------------------------
  const setAlertAndScroll = (msg) => {
    setApiAlert(msg);
    setTimeout(() => {
      alertRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const flattenErrors = (errObj, prefix = "") => {
    const lines = [];
    if (!errObj) return lines;

    if (typeof errObj === "string") {
      lines.push(prefix ? `${prefix}: ${errObj}` : errObj);
      return lines;
    }

    if (Array.isArray(errObj)) {
      errObj.forEach((item) => {
        if (typeof item === "string")
          lines.push(prefix ? `${prefix}: ${item}` : item);
        else lines.push(...flattenErrors(item, prefix));
      });
      return lines;
    }

    if (typeof errObj === "object") {
      Object.entries(errObj).forEach(([key, value]) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        lines.push(...flattenErrors(value, newPrefix));
      });
      return lines;
    }

    lines.push(prefix ? `${prefix}: ${String(errObj)}` : String(errObj));
    return lines;
  };

  const formatKey = (path) => {
    const last = path.split(".").pop() || path;
    const map = {
      first_name: "First Name",
      last_name: "Last Name",
      email: "Email",
      phone_number: "Phone Number",
      reg_no: "Registration Number",
      current_semester: "Current Semester",
      program: "Program",
      preferred_role: "Preferred Role",
      secondary_role: "Secondary Role",
      join_purpose: "Why Join",
      weekly_availability: "Weekly Availability",
      relevant_coursework: "Coursework",
      skills: "Skills",
      linkedin_profile: "LinkedIn",
      previous_experience: "Experience",
    };
    return map[last] || last.replaceAll("_", " ");
  };

  const normalizeFlattenedErrors = (lines) => {
    return lines.map((line) => {
      const parts = line.split(":");
      if (parts.length < 2) return line;
      const key = parts.shift().trim();
      const msg = parts.join(":").trim();
      return `${formatKey(key)}: ${msg}`;
    });
  };

  const parseCommaList = (text) =>
    text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const validateCommaItems = (items, itemMax, label) => {
    // return error string or ""
    const tooLong = items.find((x) => x.length > itemMax);
    if (tooLong) {
      return `${label} item too long (max ${itemMax} chars): "${tooLong.slice(0, 30)}..."`;
    }
    return "";
  };

  // -------------------------
  // Fetch active session
  // -------------------------
  useEffect(() => {
    const fetchActiveSession = async () => {
      setSessionLoading(true);
      setApiAlert(null);

      try {
        const res = await axiosInstance.get("/recruitment/active-session/");
        const active = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!active?.id) {
          setSessionId(null);
          setAlertAndScroll("No active recruitment session found.");
        } else {
          setSessionId(active.id);
        }
      } catch (err) {
        const data = err.response?.data;
        const message =
          data?.detail ||
          data?.message ||
          (typeof data === "string" ? data : null) ||
          "Failed to load active recruitment session.";
        setSessionId(null);
        setAlertAndScroll(message);
      } finally {
        setSessionLoading(false);
      }
    };

    fetchActiveSession();
  }, []);

  // -------------------------
  // Handle changes (with constraints)
  // -------------------------
  const handleChange = (e) => {
    if (apiAlert) setApiAlert(null);

    const { name, value } = e.target;

    // First name / Last name: trim left spaces, cap length, optional allow letters only if you want
    if (name === "firstName" || name === "lastName") {
      const capped = value.slice(0, LIMITS[name]);
      setFormData((prev) => ({ ...prev, [name]: capped }));
      return;
    }

    // Email cap
    if (name === "email") {
      setFormData((prev) => ({ ...prev, email: value.slice(0, LIMITS.email) }));
      return;
    }

    // Registration validation + auto uppercase + cap max_length=20
    if (name === "regNumber") {
      const cleaned = value
        .toUpperCase()
        .replace(/\s+/g, "")
        .slice(0, LIMITS.regNumber);
      setFormData((prev) => ({ ...prev, regNumber: cleaned }));

      if (cleaned && !regNoRegex.test(cleaned))
        setRegError("Format must be like SP23-BSE-090");
      else setRegError("");

      return;
    }

    // Phone validation + cap 13
    if (name === "phoneNumber") {
      const cleaned = value.replace(/\s+/g, "").slice(0, LIMITS.phoneNumber);
      setFormData((prev) => ({ ...prev, phoneNumber: cleaned }));

      if (cleaned && !pkPhoneRegex.test(cleaned)) {
        setPhoneError("Phone must be like +92XXXXXXXXXX (10 digits after +92)");
      } else setPhoneError("");

      return;
    }

    // Skills textarea: cap total length (UI) + validate each item max 50
    if (name === "skills") {
      const capped = value.slice(0, 1000); // UI cap so payload isn't huge
      setFormData((prev) => ({ ...prev, skills: capped }));

      const items = parseCommaList(capped);
      const errMsg = validateCommaItems(items, LIMITS.skillItem, "Skills");
      setSkillsError(errMsg);

      return;
    }

    // Coursework textarea: validate each item max 50
    if (name === "coursework") {
      const capped = value.slice(0, 1000);
      setFormData((prev) => ({ ...prev, coursework: capped }));

      const items = parseCommaList(capped);
      const errMsg = validateCommaItems(
        items,
        LIMITS.courseworkItem,
        "Coursework",
      );
      setCourseworkError(errMsg);

      return;
    }

    // Weekly availability is CharField(max_length=100) in backend
    if (name === "availability") {
      const capped = value.slice(0, LIMITS.availability);
      setFormData((prev) => ({ ...prev, availability: capped }));

      if (capped && capped.length > LIMITS.availability) {
        setAvailabilityError(`Max ${LIMITS.availability} characters allowed.`);
      } else {
        setAvailabilityError("");
      }
      return;
    }

    // WhyJoin + Experience are TextFields => backend accepts long, but cap for UX
    if (name === "whyJoin") {
      setFormData((prev) => ({
        ...prev,
        whyJoin: value.slice(0, LIMITS.whyJoin),
      }));
      return;
    }

    if (name === "experience") {
      setFormData((prev) => ({
        ...prev,
        experience: value.slice(0, LIMITS.experience),
      }));
      return;
    }

    // LinkedIn URL cap
    if (name === "linkedin") {
      setFormData((prev) => ({
        ...prev,
        linkedin: value.slice(0, LIMITS.linkedin),
      }));
      return;
    }

    // Note on program change: if user changes to a non-CS/SE/AI program, and they had CodeHub selected as preferred or secondary, we reset those fields since CodeHub is only for CS/SE/AI students. We also allow them to select CodeHub if they switch to a CS/SE/AI program.
    if (name === "program") {
      const isCS = ["BSSE", "BSCS", "BSAI"].includes(value);

      setFormData((prev) => ({
        ...prev,
        program: value,
        // If new program is NOT CS/SE/AI, and they had CodeHub selected, reset role
        preferredRole:
          !isCS && prev.preferredRole === "CODEHUB" ? "" : prev.preferredRole,
        secondaryRole:
          !isCS && prev.secondaryRole === "CODEHUB" ? "" : prev.secondaryRole,
      }));
      return;
    }

    // Prevent same preferred & secondary role
    if (name === "preferredRole" && value === formData.secondaryRole) {
      setFormData((prev) => ({
        ...prev,
        preferredRole: value,
        secondaryRole: "",
      }));
      return;
    }

    if (name === "secondaryRole" && value === formData.preferredRole) {
      setAlertAndScroll("Secondary role must be different from preferred role");
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------
  // Progress calculation (match backend-required)
  // -------------------------
  useEffect(() => {
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phoneNumber",
      "regNumber",
      "semester",
      "program",
      "skills",
      "preferredRole",
      "secondaryRole",
      "whyJoin",
    ];

    const filledFields = requiredFields.filter(
      (field) => String(formData[field]).trim() !== "",
    ).length;

    setProgress((filledFields / requiredFields.length) * 100);
  }, [formData]);

  // -------------------------
  // Submit
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfirmed) {
      setAlertAndScroll("Please confirm the information before submitting.");
      return;
    }

    if (!sessionId) {
      setAlertAndScroll(
        "No active recruitment session found. Please try again later.",
      );
      return;
    }

    // frontend validations
    if (!regNoRegex.test(formData.regNumber)) {
      setRegError("Format must be like SP23-BSE-090");
      setAlertAndScroll(
        "Please fix Registration Number format before submitting.",
      );
      return;
    }

    if (!pkPhoneRegex.test(formData.phoneNumber)) {
      setPhoneError("Phone must be like +92XXXXXXXXXX (10 digits after +92)");
      setAlertAndScroll("Please fix Phone Number format before submitting.");
      return;
    }

    if (!formData.secondaryRole) {
      setAlertAndScroll("Secondary club is required.");
      return;
    }

    if (formData.secondaryRole === formData.preferredRole) {
      setAlertAndScroll("Secondary club must be different from preferred club");
      return;
    }

    // ArrayField item validations
    const skillsArray = parseCommaList(formData.skills);
    const courseworkArray = parseCommaList(formData.coursework);

    const skillsItemErr = validateCommaItems(
      skillsArray,
      LIMITS.skillItem,
      "Skills",
    );
    if (skillsItemErr) {
      setSkillsError(skillsItemErr);
      setAlertAndScroll(skillsItemErr);
      return;
    }

    const courseItemErr = validateCommaItems(
      courseworkArray,
      LIMITS.courseworkItem,
      "Coursework",
    );
    if (courseItemErr) {
      setCourseworkError(courseItemErr);
      setAlertAndScroll(courseItemErr);
      return;
    }

    if (formData.availability.trim().length > LIMITS.availability) {
      setAvailabilityError(`Max ${LIMITS.availability} characters allowed.`);
      setAlertAndScroll(
        `Weekly Availability max length is ${LIMITS.availability}.`,
      );
      return;
    }

    setSubmitting(true);
    setApiAlert(null);

    const payload = {
      recruitment_session: sessionId,
      personal_info: {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        email: formData.email.trim(),
        phone_number: formData.phoneNumber.trim(),
      },
      academic_info: {
        program: formData.program,
        current_semester: Number(formData.semester),
        skills: skillsArray, // each item max 50 validated
        relevant_coursework: courseworkArray, // each item max 50 validated
        reg_no: formData.regNumber.trim(),
      },
      role_preferences: {
        preferred_role: formData.preferredRole,
        secondary_role: formData.secondaryRole,
        join_purpose: formData.whyJoin.trim(),
        weekly_availability: formData.availability?.trim() || "",
        previous_experience: formData.experience?.trim() || "",
        linkedin_profile: formData.linkedin?.trim() || null,
      },
    };

    try {
      await axiosInstance.post("/recruitment/submit-application/", payload);
      navigate("/recruitment/submitted");
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const flat = flattenErrors(data);
        const pretty = normalizeFlattenedErrors(flat);
        setAlertAndScroll(pretty.length ? pretty : "Submission failed");
      } else {
        setAlertAndScroll(err.message || "Submission failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const disableSubmit =
    submitting ||
    sessionLoading ||
    !sessionId ||
    !!regError ||
    !!phoneError ||
    !!skillsError ||
    !!courseworkError ||
    !!availabilityError;

  return (
    <div className="recruitment-page">
      <Navbar />

      <div className="box-header">
        <div className="form-header">
          <h1>RECRUITMENT APPLICATION</h1>
          <p>Fill out the application form to join the ACM team</p>
          {sessionLoading && (
            <p style={{ marginTop: 8, fontSize: 14 }}>
              Loading active session...
            </p>
          )}
        </div>
      </div>

      {/* Alert Box */}
      <div ref={alertRef}>
        {apiAlert && (
          <div
            style={{
              margin: "14px auto 0",
              maxWidth: 900,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(220, 38, 38, 0.35)",
              background: "rgba(220, 38, 38, 0.10)",
              color: "#b91c1c",
            }}
          >
            {Array.isArray(apiAlert) ? (
              <>
                <b style={{ display: "block", marginBottom: 6 }}>
                  Please fix these errors:
                </b>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {apiAlert.map((m, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      {m}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <b>{apiAlert}</b>
            )}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="progress-container">
        <div className="progress-tabs">
          <div className="tab">
            <span>Personal Info</span>
          </div>
          <div className="tab">
            <span>Education</span>
          </div>
          <div className="tab">
            <span>Preferences</span>
          </div>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form className="recruitment-form-container" onSubmit={handleSubmit}>
        {/* SECTION 1 */}
        <div className="form-card">
          <h3>Personal Information</h3>

          <div className="input-row">
            <div className="input-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                maxLength={LIMITS.firstName}
              />
              <small style={{ opacity: 0.6 }}>
                {formData.firstName.length}/{LIMITS.firstName}
              </small>
            </div>

            <div className="input-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                maxLength={LIMITS.lastName}
              />
              <small style={{ opacity: 0.6 }}>
                {formData.lastName.length}/{LIMITS.lastName}
              </small>
            </div>
          </div>

          <div className="input-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={LIMITS.email}
            />
          </div>

          <div className="input-group">
            <label>Phone Number * (Pakistan)</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+92XXXXXXXXXX"
              required
              maxLength={LIMITS.phoneNumber}
              style={{ borderColor: phoneError ? "crimson" : undefined }}
            />
            {phoneError && (
              <small
                style={{ color: "crimson", marginTop: 6, display: "block" }}
              >
                {phoneError}
              </small>
            )}
          </div>
        </div>

        {/* SECTION 2 */}
        <div className="form-card">
          <h3>Academic Information</h3>

          <div className="input-row">
            <div className="input-group">
              <label>Registration Number *</label>
              <input
                type="text"
                name="regNumber"
                value={formData.regNumber}
                onChange={handleChange}
                placeholder="SP23-BSE-090"
                required
                maxLength={LIMITS.regNumber}
                style={{ borderColor: regError ? "crimson" : undefined }}
              />
              {regError && (
                <small
                  style={{ color: "crimson", marginTop: 6, display: "block" }}
                >
                  {regError}
                </small>
              )}
            </div>

            <div className="input-group">
              <label>Current Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Program *</label>
            <select
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
            >
              <option value="">Select your program</option>
              <option value="BSSE">Bachelor of Software Engineering</option>
              <option value="BSCS">Bachelor of Computer Science</option>
              <option value="BSAI">Bachelor of Artificial Intelligence</option>
              <option value="BSEE">Bachelor of Electrical Engineering</option>
              <option value="BSCE">Bachelor of Computer Engineering</option>
              <option value="BSME">Bachelor of Mechanical Engineering</option>
              <option value="BSCVE">Bachelor of Civil Engineering</option>
              <option value="BBA">Business Administration</option>
              <option value="HUM">Humanities Department</option>
              <option value="BS_MATH">Mathematics Department</option>
            </select>
          </div>

          <div className="input-group">
            <label>Skills * (comma separated)</label>
            <textarea
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              rows="4"
              required
              maxLength={1000}
              placeholder="e.g. Decorations, Event management, Coding, Graphic Designing or Media"
              style={{ borderColor: skillsError ? "crimson" : undefined }}
            />
            {skillsError && (
              <small
                style={{ color: "crimson", marginTop: 6, display: "block" }}
              >
                {skillsError}
              </small>
            )}
            <small style={{ opacity: 0.6 }}>
              Each item max {LIMITS.skillItem} chars
            </small>
          </div>

          <div className="input-group">
            <label>Relevant Coursework (comma separated)</label>
            <textarea
              name="coursework"
              value={formData.coursework}
              onChange={handleChange}
              rows="4"
              maxLength={1000}
              placeholder="e.g. DSA, OOP, DBMS"
              style={{ borderColor: courseworkError ? "crimson" : undefined }}
            />
            {courseworkError && (
              <small
                style={{ color: "crimson", marginTop: 6, display: "block" }}
              >
                {courseworkError}
              </small>
            )}
            <small style={{ opacity: 0.6 }}>
              Each item max {LIMITS.courseworkItem} chars
            </small>
          </div>
        </div>

        {/* SECTION 3 */}
        <div className="form-card">
          <h3>Club Preferences</h3>

          <div className="input-row">
            <div className="input-group">
              <label>Preferred Club *</label>
              <select
                name="preferredRole"
                value={formData.preferredRole}
                onChange={handleChange}
                required
              >
                <option value="">Select Club</option>
                <option
                  value="CODEHUB"
                  disabled={
                    !["BSSE", "BSCS", "BSAI"].includes(formData.program)
                  }
                  style={
                    !["BSSE", "BSCS", "BSAI"].includes(formData.program)
                      ? { color: "#999" }
                      : {}
                  }
                >
                  CodeHub (Development){" "}
                  {!["BSSE", "BSCS", "BSAI"].includes(formData.program)
                    ? "(CS/SE/AI Only)"
                    : ""}
                </option>{" "}
                <option value="GRAPHICS">Graphics / UI Design</option>
                <option value="SOCIAL_MEDIA_MARKETING">
                  Social Media Marketing
                </option>
                <option value="MEDIA">Media & Coverage</option>
                <option value="DECOR">Decor Team</option>
                <option value="EVENTS_LOGISTICS">Events & Logistics</option>
              </select>
            </div>

            <div className="input-group">
              <label>Secondary Club *</label>
              <select
                name="secondaryRole"
                value={formData.secondaryRole}
                onChange={handleChange}
                required
              >
                <option value="">Select Club</option>
                <option
                  value="CODEHUB"
                  disabled={
                    !["BSSE", "BSCS", "BSAI"].includes(formData.program)
                  }
                  style={
                    !["BSSE", "BSCS", "BSAI"].includes(formData.program)
                      ? { color: "#999" }
                      : {}
                  }
                >
                  CodeHub (Development){" "}
                  {!["BSSE", "BSCS", "BSAI"].includes(formData.program)
                    ? "(CS/SE/AI Only)"
                    : ""}
                </option>{" "}
                <option value="GRAPHICS">Graphics / UI Design</option>
                <option value="SOCIAL_MEDIA_MARKETING">
                  Social Media Marketing
                </option>
                <option value="MEDIA">Media & Coverage</option>
                <option value="DECOR">Decor Team</option>
                <option value="EVENTS_LOGISTICS">Events & Logistics</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Why do you want to join ACM? *</label>
            <textarea
              name="whyJoin"
              value={formData.whyJoin}
              onChange={handleChange}
              rows="4"
              required
              maxLength={LIMITS.whyJoin}
            />
            <small style={{ opacity: 0.6 }}>
              {formData.whyJoin.length}/{LIMITS.whyJoin}
            </small>
          </div>

          <div className="input-group">
            <label>Previous Experience</label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              rows="4"
              maxLength={LIMITS.experience}
            />
            <small style={{ opacity: 0.6 }}>
              {formData.experience.length}/{LIMITS.experience}
            </small>
          </div>

          <div className="input-group">
            <label>Weekly Availability (max 100 chars)</label>
            <textarea
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              rows="3"
              maxLength={LIMITS.availability}
              style={{ borderColor: availabilityError ? "crimson" : undefined }}
            />
            <small style={{ opacity: 0.6 }}>
              {formData.availability.length}/{LIMITS.availability}
            </small>
            {availabilityError && (
              <small
                style={{ color: "crimson", marginTop: 6, display: "block" }}
              >
                {availabilityError}
              </small>
            )}
          </div>

          <div className="input-group">
            <label>LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              maxLength={LIMITS.linkedin}
              placeholder="https://linkedin.com/in/..."
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="confirm"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            <label htmlFor="confirm">
              I confirm that all information provided is accurate
            </label>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={disableSubmit}>
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
};

export default RecruitmentForm;
