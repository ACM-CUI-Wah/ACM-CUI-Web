import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
// Import the same CSS file used for the OTP form
import './ReqOTP.css' 

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const { resetPassword, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await resetPassword(password)
    if (res.success) {
      alert('Password reset successful! Please login again.')
      navigate('/login')
    }
  }

  return (
    <>
      <div className="req-otp-container">
        <div className="req-otp-card">
          <h2 className="dashboard-title">Reset Password</h2>

          <form className="otp-form" onSubmit={handleSubmit}>
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
              <button 
                type="submit" 
                className="btn-design" 
                disabled={loading}
              >
                Reset Password
              </button>
            </div>
          </form>

          {error && <p className="error-text">{error}</p>}
        </div>
      </div>
    </>
  )
}

export default ResetPassword