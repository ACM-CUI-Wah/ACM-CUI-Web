import React, { useState, useEffect, useRef } from 'react'
import { PersonFill } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore.js'
import './Login.css'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, token } = useAuthStore()
  const navigate = useNavigate()
  const isLoggingIn = useRef(false)

  useEffect(() => {
    // Only check on initial mount, not when token changes during login
    const storedToken = localStorage.getItem('token')
    if (storedToken && !isLoggingIn.current) {
      alert('You are already logged in. Please logout first!')
      navigate('/dashboard')
    }
  }, [navigate]) // Remove token from dependencies

  const handleSubmit = async (e) => {
    e.preventDefault()
    isLoggingIn.current = true // Set flag before login
    const success = await login(username, password)
    if (success) {
      navigate('/dashboard')
    } else {
      isLoggingIn.current = false // Reset flag if login fails
      alert("Invalid credentials. Please try again.")
    }
  }

  return (
    <div className="login-container d-flex flex-column align-items-center">
      <div className="login-card text-center">
        <h2 className="welcome-text text-black">WELCOME BACK</h2>
        <form className="mt-4" onSubmit={handleSubmit}>
          <div className="form-group1 mb-3 text-start">
            <label htmlFor="username" className="text-black ">Username</label>
            <input
              type="text"
              id="username"
              className="form-control1 custom-input1"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group1 mb-4 text-start">
            <label htmlFor="password" className="text-black label1">Password</label>
            <input
              type="password"
              id="password"
              className="form-control1 custom-input1"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="login-link px-4 py-2 ms-lg-3 fw-semibold"
            style={{ backgroundColor: "#ffffff", cursor: "pointer" }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>

        <div className="icon-container">
          <PersonFill size={30} />
        </div>
      </div>

      <img
        src="acm-comsats-wah-chapter.png"
        alt="ACM Logo"
        className="acm-logo mt-4 my-4"
      />
    </div>
  )
}

export default Login