// EventTeamForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarComponent from "../../components/LandingPage/Navbar/NavbarComponent";
import Footer from "../../components/Footer/Footer";
import "./EventTeamForm.css";

const blankMember = () => ({
  name: "",
  registration: "",
  semester: "",
  department: "",
  email: "",
  phone: "",
});

const MIN_MEMBERS = 1;
const MAX_MEMBERS = 10;

const ordinalLabel = (n) => {
  if (n === 1) return "First";
  if (n === 2) return "Second";
  if (n === 3) return "Third";
  return `${n}th`;
};

const EventTeamForm = () => {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const [memberCount, setMemberCount] = useState(2);
  const [memberCountInput, setMemberCountInput] = useState("2");

  // ✅ NEW: error message state
  const [memberCountError, setMemberCountError] = useState("");

  const [formData, setFormData] = useState({
    members: Array.from({ length: 2 }, blankMember),
  });

  const resizeMembers = (nextCount) => {
    setFormData((prev) => {
      const current = prev.members || [];

      if (nextCount > current.length) {
        const extra = Array.from(
          { length: nextCount - current.length },
          blankMember,
        );
        return { ...prev, members: [...current, ...extra] };
      }

      return { ...prev, members: current.slice(0, nextCount) };
    });
  };

  const handleMemberCountChange = (e) => {
    const raw = e.target.value;

    // allow empty while typing (no error)
    if (raw === "") {
      setMemberCountInput("");
      setMemberCountError("");
      return;
    }

    // digits only
    if (!/^\d+$/.test(raw)) return;

    const n = Number(raw);

    // ✅ If > max: show message and DO NOT update input (prevents typing 11/12 etc)
    if (n > MAX_MEMBERS) {
      setMemberCountError(`Max members ${MAX_MEMBERS}`);
      setMemberCountInput(String(memberCount)); // keep last valid in field
      return;
    }

    // ✅ If < min: allow typing but no resize until valid
    if (n < MIN_MEMBERS) {
      setMemberCountError(`Min members ${MIN_MEMBERS}`);
      setMemberCountInput(raw);
      return;
    }

    // valid
    setMemberCountError("");
    setMemberCountInput(raw);
    setMemberCount(n);
    resizeMembers(n);
  };

  const handleMemberCountBlur = () => {
    let raw = memberCountInput;

    // if empty/invalid => revert
    if (raw === "" || !/^\d+$/.test(raw)) {
      setMemberCountInput(String(memberCount));
      setMemberCountError("");
      return;
    }

    let n = Number(raw);

    if (n > MAX_MEMBERS) {
      setMemberCountError(`Max members ${MAX_MEMBERS}`);
      n = MAX_MEMBERS;
    } else if (n < MIN_MEMBERS) {
      setMemberCountError(`Min members ${MIN_MEMBERS}`);
      n = MIN_MEMBERS;
    } else {
      setMemberCountError("");
    }

    setMemberCount(n);
    setMemberCountInput(String(n));
    resizeMembers(n);
  };

  const handleMemberChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.members];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, members: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isConfirmed) {
      alert("Please confirm the terms and conditions before submitting");
      return;
    }

    console.log("Form submitted:", {
      memberCount,
      members: formData.members,
    });
  };

  return (
    <div className="team-form">
      <NavbarComponent />

      <div className="team-form__container">
        <div className="team-form__header">
          <h1 className="team-form__title">
            EVENT REGISTRATION <span className="team-form__badge">TEAM</span>
          </h1>
          <p className="team-form__description">
            Fill out the application form to sign up!
          </p>
        </div>

        <form className="team-form__form" onSubmit={handleSubmit}>
          <div className="team-form__card">
            <div className="team-form__section">
              <h3 className="team-form__section-title">Team Size</h3>
              <p className="team-form__subtitle">
                How many members do you want to register?
              </p>

              <div className="team-form__field">
                <label className="team-form__label">Number of Members*</label>
                <input
                  className="team-form__input"
                  type="number"
                  min={MIN_MEMBERS}
                  max={MAX_MEMBERS}
                  value={memberCountInput}
                  onChange={handleMemberCountChange}
                  onBlur={handleMemberCountBlur}
                  onWheel={(e) => e.currentTarget.blur()} // ✅ prevents scroll changing value
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown")
                      e.preventDefault(); // optional
                  }}
                  required
                />

                {/* ✅ NEW: error under input */}
                {memberCountError && (
                  <div className="team-form__error">{memberCountError}</div>
                )}
              </div>
            </div>

            {formData.members.map((member, index) => (
              <div className="team-form__section" key={index}>
                <h3 className="team-form__section-title">
                  {ordinalLabel(index + 1)} Member Information
                </h3>
                <p className="team-form__subtitle">Tell us about yourself</p>

                <div className="team-form__row">
                  <div className="team-form__field">
                    <label className="team-form__label">Name*</label>
                    <input
                      className="team-form__input"
                      type="text"
                      value={member.name}
                      placeholder="Ahmed"
                      onChange={(e) =>
                        handleMemberChange(index, "name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="team-form__field">
                    <label className="team-form__label">Registration*</label>
                    <input
                      className="team-form__input"
                      type="text"
                      value={member.registration}
                      placeholder="FA23-BAI-043"
                      onChange={(e) =>
                        handleMemberChange(
                          index,
                          "registration",
                          e.target.value,
                        )
                      }
                      required
                    />
                  </div>
                </div>

                <div className="team-form__row">
                  <div className="team-form__field">
                    <label className="team-form__label">Semester*</label>
                    <select
                      className="team-form__select"
                      value={member.semester}
                      onChange={(e) =>
                        handleMemberChange(index, "semester", e.target.value)
                      }
                      required
                    >
                      <option value="">Select your semester</option>
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                      <option value="3">3rd Semester</option>
                      <option value="4">4th Semester</option>
                      <option value="5">5th Semester</option>
                      <option value="6">6th Semester</option>
                      <option value="7">7th Semester</option>
                      <option value="8">8th Semester</option>
                    </select>
                  </div>

                  <div className="team-form__field">
                    <label className="team-form__label">Department*</label>
                    <select
                      className="team-form__select"
                      value={member.department}
                      onChange={(e) =>
                        handleMemberChange(index, "department", e.target.value)
                      }
                      required
                    >
                      <option value="">Select your semester</option>
                      <option value="CS">Computer Science</option>
                      <option value="SE">Software Engineering</option>
                      <option value="AI">Artificial Intelligence</option>
                    </select>
                  </div>
                </div>

                <div className="team-form__field">
                  <label className="team-form__label">Email Address *</label>
                  <input
                    className="team-form__input"
                    type="email"
                    value={member.email}
                    placeholder="Ahmed@example.com"
                    onChange={(e) =>
                      handleMemberChange(index, "email", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="team-form__field">
                  <label className="team-form__label">Phone Number *</label>
                  <input
                    className="team-form__input"
                    type="tel"
                    value={member.phone}
                    placeholder="+90 321 569877"
                    onChange={(e) =>
                      handleMemberChange(index, "phone", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="team-form__terms">
            <div className="team-form__terms-row">
              <input
                className="team-form__checkbox"
                type="checkbox"
                id="confirm"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                required
              />
              <label className="team-form__terms-text" htmlFor="confirm">
                By signing up for this event, I confirm that I have read,
                understood, and agree to all rules, terms, and conditions. I
                give my full consent to participate and accept any
                responsibilities associated with the event.
              </label>
            </div>
          </div>

          <div className="team-form__submit-wrap">
            <button type="submit" className="team-form__submit-btn">
              Submit Application
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default EventTeamForm;
