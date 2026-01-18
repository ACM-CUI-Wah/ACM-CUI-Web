import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import NavbarComponent from "../../components/LandingPage/Navbar/NavbarComponent";
import Footer from "../../components/Footer/Footer";
import './RecruitmentForm.css';

const RecruitmentForm = () => {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    regNumber: '',
    semester: '',
    program: '',
    skills: '',
    coursework: '',
    preferredRole: '',
    secondaryRole: '',
    whyJoin: '',
    experience: '',
    availability: '',
    linkedin: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const requiredFields = [
      'firstName', 'lastName', 'email', 'phoneNumber',
      'regNumber', 'semester', 'program', 'skills',
      'preferredRole', 'whyJoin', 'availability'
    ];
    
    const filledFields = requiredFields.filter(field => formData[field].trim() !== '').length;
    const percentage = (filledFields / requiredFields.length) * 100;
    setProgress(percentage);
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      alert('Please confirm the information before submitting');
      return;
    }
    console.log('Form submitted:', formData);
    navigate('/recruitment/submitted');
  };

  return (
    <div className="recruitment-page">
      <NavbarComponent />
      <div className="box-header">
        <div className="form-header">
        <h1>RECRUITMENT APPLICATION</h1>
        <p>Fill out the application form to join the ACM team</p>
      </div>
      </div>
      

      {/* Progress Tabs */}
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
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <form className="recruitment-form-container" onSubmit={handleSubmit}>
        {/* SECTION 1: Personal Information */}
        <div className="form-card">
          <h3>Personal Information</h3>
          <p className="subtitle">Tell us about yourself</p>

          <div className="input-row">
            <div className="input-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                placeholder="Ahmed"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                placeholder="Ali"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              placeholder="Ahmed@example.com"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              placeholder="+90 321 569877"
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* SECTION 2: Academic Information */}
        <div className="form-card">
          <h3>Academic Information</h3>
          <p className="subtitle">Your academic background</p>

          <div className="input-row">
            <div className="input-group">
              <label>Registration Number *</label>
              <input
                type="text"
                name="regNumber"
                value={formData.regNumber}
                placeholder="SP25-BSE-001"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Current Semester *</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
              >
                <option value="">Select your semester</option>
                <option value="1">1st</option>
                <option value="2">2nd</option>
                <option value="3">3rd</option>
                <option value="4">4th</option>
                <option value="5">5th</option>
                <option value="6">6th</option>
                <option value="7">7th</option>
                <option value="8">8th</option>
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
              <option value="BSE">Bachelor of Software Engineering</option>
              <option value="BCS">Bachelor of Computer Science</option>
              <option value="BAI">Bachelor of Artificial Intelligence</option>
            </select>
          </div>

          <div className="input-group">
            <label>Skills *</label>
            <textarea
              name="skills"
              value={formData.skills}
              placeholder="List your technical and soft skills (e.g., Python, JavaScript, Project Management, Communication...)"
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="input-group">
            <label>Relevant Coursework (Optional)</label>
            <textarea
              name="coursework"
              value={formData.coursework}
              placeholder="List the key courses relevant to your career goals..."
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>

        {/* SECTION 3: Role Preferences */}
        <div className="form-card">
          <h3>Role Preferences</h3>
          <p className="subtitle">Help us match you with the right opportunities</p>

          <div className="input-row">
            <div className="input-group">
              <label>Preferred Role *</label>
              <select
                name="preferredRole"
                value={formData.preferredRole}
                onChange={handleChange}
                required
              >
                <option value="">Select your preferred role</option>
                <option value="web-dev">Web Development</option>
                <option value="mobile-dev">Mobile Development</option>
                <option value="ai-ml">AI/ML</option>
                <option value="design">UI/UX Design</option>
                <option value="content">Content Writing</option>
                <option value="marketing">Marketing</option>
                <option value="management">Project Management</option>
              </select>
            </div>
            <div className="input-group">
              <label>Secondary Role (Optional)</label>
              <select
                name="secondaryRole"
                value={formData.secondaryRole}
                onChange={handleChange}
              >
                <option value="">Select your secondary role</option>
                <option value="web-dev">Web Development</option>
                <option value="mobile-dev">Mobile Development</option>
                <option value="ai-ml">AI/ML</option>
                <option value="design">UI/UX Design</option>
                <option value="content">Content Writing</option>
                <option value="marketing">Marketing</option>
                <option value="management">Project Management</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Why do you want to join ACM? *</label>
            <textarea
              name="whyJoin"
              value={formData.whyJoin}
              placeholder="Tell us what motivates you to join ACM and what do hope to contribute"
              onChange={handleChange}
              rows="4"
              required
            />
          </div>

          <div className="input-group">
            <label>Previous Experience</label>
            <textarea
              name="experience"
              value={formData.experience}
              placeholder="Describe your previous internships, jobs, or significant projects..."
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="input-group">
            <label>Weekly Availability *</label>
            <textarea
              name="availability"
              value={formData.availability}
              placeholder="Describe your availability for meetings and events ( at any time )"
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          <div className="input-group">
            <label>LinkedIn Profile</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              placeholder="linkedin.com/in/ahmendali"
              onChange={handleChange}
            />
          </div>

          <div className="checkbox-group">
            <input
              type="checkbox"
              id="confirm"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
              required
            />
            <label htmlFor="confirm">
              I confirm that all information provided is accurate and I understand that joining ACM requires a commitment to attend weekly meetings and actively participate in team activities
            </label>
          </div>

         
        </div>
         <button type="submit" className="submitApp-btn">
            Submit Application
          </button>
      </form>
    </div>
  );
};

export default RecruitmentForm;