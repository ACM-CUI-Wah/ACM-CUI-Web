import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import './ReqOTP.css'

const ReqOTP = () => {
  const [email, setEmail] = useState('')
  const { requestOtp, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await requestOtp(email)
    if (res.success) {
      navigate('/dashboard/reset-password')
    }
  }

  return (
    <div className="req-otp-container">
      <div className="req-otp-card">
        <h2 className="dashboard-title">Reset Password</h2>

        <form className="otp-form" onSubmit={handleSubmit}>
          <div className="otp-form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="otp-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="otp-button-row">
            <button type="submit" className="btn-design" disabled={loading}>
              SendOtp
            </button>
          </div>
        </form>

        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}

export default ReqOTP