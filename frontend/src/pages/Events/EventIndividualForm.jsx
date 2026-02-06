import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import axiosInstance from '../../axios';
import './EventIndividualForm.css';
import Navbar from '../../components/DashboardNavbar/Navbar';

const EventIndividualForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    semester: '',
    department: '',
    email: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (!eventId) {
      alert('No event selected. Redirecting to events page.');
      navigate('/events');
    }
  }, [eventId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConfirmed) {
      alert('Please confirm the terms and conditions before submitting');
      return;
    }

    setLoading(true);

    try {
      // Prepare registration data according to backend API format
      const registrationData = {
        event: parseInt(eventId),
        registration_type: 'SINGLE',
        team_name: '', // Empty for individual registration
        participants: [
          {
            name: formData.name,
            email: formData.email,
            reg_no: formData.registration,
            current_semester: parseInt(formData.semester),
            department: formData.department,
            phone_no: formData.phoneNumber
          }
        ]
      };

      await axiosInstance.post('/events/registrations/', registrationData);

      alert('Registration successful! You have been registered for this event.');
      navigate('/events');
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);

      if (error.response?.data) {
        const errorMsg = typeof error.response.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response.data);
        alert(`Registration failed: ${errorMsg}`);
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-individual-page">
      <Navbar/>

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
            <button type="submit" className="submit-btn1" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default EventIndividualForm;