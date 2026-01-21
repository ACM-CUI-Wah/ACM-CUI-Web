import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from '../../components/LandingPage/Navbar/NavbarComponent';
import Footer from '../../components/Footer/Footer';
import './EventTeamForm.css';

const EventTeamForm = () => {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    // First Member
    member1Name: '',
    member1Registration: '',
    member1Semester: '',
    member1Department: '',
    member1Email: '',
    member1Phone: '',
    // Second Member
    member2Name: '',
    member2Registration: '',
    member2Semester: '',
    member2Department: '',
    member2Email: '',
    member2Phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      alert('Please confirm the terms and conditions before submitting');
      return;
    }
    console.log('Form submitted:', formData);
    // navigate('');
  };

  return (
    <div className="event-team-page">
      <NavbarComponent />
      
      <div className="event-registration-container">
        <div className="form-header">
          <h1>
            EVENT REGISTRATION 
            <span className="badge">TEAM</span>
          </h1>
          <p>Fill out the application form to sign up!</p>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          {/* First Member Information Card */}
          <div className="form-card">
            <h3>First Member Information</h3>
            <p className="subtitle">Tell us about yourself</p>

            <div className="input-row">
              <div className="input-group">
                <label>Name*</label>
                <input
                  type="text"
                  name="member1Name"
                  value={formData.member1Name}
                  placeholder="Ahmed"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Registration*</label>
                <input
                  type="text"
                  name="member1Registration"
                  value={formData.member1Registration}
                  placeholder="FA23-BAI-043"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Semester*</label>
                <select
                  name="member1Semester"
                  value={formData.member1Semester}
                  onChange={handleChange}
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
              <div className="input-group">
                <label>Department*</label>
                <select
                  name="member1Department"
                  value={formData.member1Department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your semester</option>
                  <option value="CS">Computer Science</option>
                  <option value="SE">Software Engineering</option>
                  <option value="AI">Artificial Intelligence</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="member1Email"
                value={formData.member1Email}
                placeholder="Ahmed@example.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="member1Phone"
                value={formData.member1Phone}
                placeholder="+90 321 569877"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Second Member Information Card */}
          <div className="form-card">
            <h3>Second Member Information</h3>
            <p className="subtitle">Tell us about yourself</p>

            <div className="input-row">
              <div className="input-group">
                <label>Name*</label>
                <input
                  type="text"
                  name="member2Name"
                  value={formData.member2Name}
                  placeholder="Ahmed"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Registration*</label>
                <input
                  type="text"
                  name="member2Registration"
                  value={formData.member2Registration}
                  placeholder="FA23-BAI-043"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label>Semester*</label>
                <select
                  name="member2Semester"
                  value={formData.member2Semester}
                  onChange={handleChange}
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
              <div className="input-group">
                <label>Department*</label>
                <select
                  name="member2Department"
                  value={formData.member2Department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your semester</option>
                  <option value="CS">Computer Science</option>
                  <option value="SE">Software Engineering</option>
                  <option value="AI">Artificial Intelligence</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="member2Email"
                value={formData.member2Email}
                placeholder="Ahmed@example.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="member2Phone"
                value={formData.member2Phone}
                placeholder="+90 321 569877"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-card">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="confirm"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                required
              />
              <label htmlFor="confirm">
                By signing up for this event, I confirm that I have read, understood, and agree to all rules, terms, and conditions. I give my full consent to participate and accept any responsibilities associated with the event.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="submit-container">
            <button type="submit" className="submit-btn">
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