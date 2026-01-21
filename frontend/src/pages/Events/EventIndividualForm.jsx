import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavbarComponent from '../../components/LandingPage/Navbar/NavbarComponent';
import Footer from '../../components/Footer/Footer';
import './EventIndividualForm.css';

const EventIndividualForm = () => {
  const navigate = useNavigate();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    semester: '',
    department: '',
    email: '',
    phoneNumber: ''
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
    <div className="event-individual-page">
      <NavbarComponent />
      
      <div className="event-registration-container">
        <div className="form-header">
          <h1>
            EVENT REGISTRATION 
            <span className="badge">SINGLE</span>
          </h1>
          <p>Fill out the form below to register for this event</p>
        </div>

        <form className="registration-form" onSubmit={handleSubmit}>
          {/* Personal Information Card */}
          <div className="form-card">
            <h3>Personal Information</h3>
            <p className="subtitle">Tell us about yourself</p>

            <div className="input-row">
              <div className="input-group">
                <label>Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Ahmed"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Registration*</label>
                <input
                  type="text"
                  name="registration"
                  value={formData.registration}
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
                  name="semester"
                  value={formData.semester}
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
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select your department</option>
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

export default EventIndividualForm;