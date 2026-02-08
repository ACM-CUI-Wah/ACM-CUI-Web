import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import './ReqOTP.css' 

const ResetPassword = () => {
  const [manualOtp, setManualOtp] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')
  
  const { resetPassword, loading, error } = useAuthStore()
  const navigate = useNavigate()

  // HELPER: Decodes the Long Token to find the OTP inside it
  const getOtpFromToken = (token) => {
    try {
      if (!token) return null;
      // Decode the JWT payload (the part between the dots)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const data = JSON.parse(jsonPayload);
      return data.otp; // This extracts "3738" from the long string
    } catch (e) {
      console.error("Could not decode token", e);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    // 1. Get the long token from storage
    const storedToken = localStorage.getItem("otpToken");

    if (!storedToken) {
      setLocalError("Session expired. Please request OTP again.");
      return;
    }

    // 2. Extract the REAL otp from inside the token
    const correctOtp = getOtpFromToken(storedToken);
    
    // Debugging logs to prove it works
    console.log("User Typed:", manualOtp);
    console.log("Hidden OTP in Token:", correctOtp);

    // 3. COMPARE: User's Input vs The OTP inside the token
    // We convert both to String just to be safe
    if (String(manualOtp).trim() !== String(correctOtp).trim()) {
      setLocalError("The OTP you entered is incorrect.");
      return; 
    }

    // 4. If they match, send the LONG TOKEN + Password to backend
    // (The backend needs the token to verify identity, it doesn't need the code anymore)
    const res = await resetPassword(storedToken, password)
    
    if (res.success) {
      alert('Password reset successful! Please login again.')
      navigate('/login')
    }
  }

  return (
    <div className="req-otp-container">
      <div className="req-otp-card">
        <h2 className="dashboard-title">Reset Password</h2>
        <p className="otp-instruction">Enter the 4-digit code sent to your email.</p>

        <form className="otp-form" onSubmit={handleSubmit}>
          
          <div className="otp-form-group">
            <label htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              className="otp-input"
              placeholder="Enter 4-digit code"
              value={manualOtp}
              onChange={(e) => setManualOtp(e.target.value)}
              required
              maxLength={4}
            />
          </div>

          <div className="otp-form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              className="otp-input"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="otp-button-row">
            <button type="submit" className="btn-design" disabled={loading}>
              {loading ? 'Processing...' : 'Reset Password'}
            </button>
          </div>
        </form>

        {localError && <p className="error-text" style={{color: 'red'}}>{localError}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}

export default ResetPassword
