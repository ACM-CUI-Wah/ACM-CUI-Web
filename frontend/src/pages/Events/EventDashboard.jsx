// EventDashboard.jsx
import React, { useState } from 'react';
import { BsPeople, BsClock, BsCalendarCheck, BsCheckCircle, BsEye } from "react-icons/bs";
import './EventDashboard.css';

const EventDashboard = () => {
  const [participants] = useState([
    { id: 1, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', event: 'Coding Competition', status: 'Pending' },
    { id: 2, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', event: 'Speak & Shine', status: 'Confirmed' },
    { id: 3, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', event: 'Puzzle Fuzzle', status: 'Confirmed' },
    { id: 4, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', event: 'Escape Room', status: 'Confirmed' },
    { id: 5, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', event: 'Girls Fest', status: 'Pending' },
    { id: 6, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', event: 'Squid Game', status: 'Pending' },
    { id: 7, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', event: 'Traitors', status: 'Confirmed' },
  ]);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'Confirmed':
        return 'status-confirmed';
      default:
        return '';
    }
  };

  return (
    <div className="event-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>STUDENT WEEK EVENTS</h1>
        <p>Manage and track event registrations and participant data</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Participants</h3>
            <div className="stat-value">120</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-icon">
            <BsPeople size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Events</h3>
            <div className="stat-value">20</div>
            <div className="stat-sub">Upcoming this week</div>
          </div>
          <div className="stat-icon">
            <BsCalendarCheck size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending</h3>
            <div className="stat-value">85</div>
            <div className="stat-sub">75% pending participants</div>
          </div>
          <div className="stat-icon">
            <BsClock size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Confirmed</h3>
            <div className="stat-value">10</div>
            <div className="stat-sub">45% confirmed participants</div>
          </div>
          <div className="stat-icon">
            <BsCheckCircle size={18} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="event-table-container">
        <div className="table-controls">
          <input
            type="text"
            placeholder="Search by email, name, or registration"
            className="search-input"
          />
          <select className="filter-select">
            <option>All Events</option>
          </select>
          <select className="filter-select">
            <option>All Status</option>
          </select>
        </div>

        <table className="event-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Roll No.</th>
              <th>Email</th>
              <th>Events</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.rollNo}</td>
                <td>{p.email}</td>
                <td>{p.event}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(p.status)}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="action-btn">
                    <BsEye />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventDashboard;
