// EventDashboard.jsx
import React, { useState, useEffect } from 'react';
import { BsPeople, BsClock, BsCalendarCheck, BsCheckCircle, BsEye, BsCheck, BsX, BsTrash } from "react-icons/bs";
import axiosInstance from '../../axios';
import './EventDashboard.css';

const EventDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewModal, setViewModal] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [regsRes, eventsRes] = await Promise.all([
        axiosInstance.get('/events/registrations/'),
        axiosInstance.get('/events/')
      ]);
      setRegistrations(regsRes.data);
      setEvents(eventsRes.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalParticipants: registrations.reduce((sum, reg) => sum + (reg.participants?.length || 0), 0),
    totalEvents: events.length,
    pending: registrations.filter(r => r.status === 'PENDING').length,
    confirmed: registrations.filter(r => r.status === 'COMPLETED').length,
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = reg.participants?.some(p =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.reg_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesEvent = !selectedEvent || reg.event === parseInt(selectedEvent);
    const matchesStatus = !selectedStatus || reg.status === selectedStatus;
    return matchesSearch && matchesEvent && matchesStatus;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'COMPLETED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  };

  const handleViewDetails = (registration) => {
    setSelectedRegistration(registration);
    setViewModal(true);
  };

  const handleUpdateStatus = async (registrationId, newStatus) => {
    try {
      await axiosInstance.patch(`/events/registrations/${registrationId}/status/`, {
        status: newStatus
      });
      alert(`Registration ${newStatus.toLowerCase()} successfully!`);
      fetchData(); // Refresh data
      setViewModal(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update registration status');
    }
  };

  const handleDeleteRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;

    try {
      await axiosInstance.delete(`/events/registrations/${registrationId}/delete/`);
      alert('Registration deleted successfully!');
      fetchData(); // Refresh data
      setViewModal(false);
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration');
    }
  };

  if (loading) {
    return (
      <div className="event-dashboard">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-dashboard">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#e74c3c' }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>EVENT REGISTRATIONS MANAGEMENT</h1>
        <p>Manage and track event registrations and participant data</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Participants</h3>
            <div className="stat-value">{stats.totalParticipants}</div>
            <div className="stat-sub">All time</div>
          </div>
          <div className="stat-icon">
            <BsPeople size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Events</h3>
            <div className="stat-value">{stats.totalEvents}</div>
            <div className="stat-sub">Total events</div>
          </div>
          <div className="stat-icon">
            <BsCalendarCheck size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending</h3>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-sub">{registrations.length > 0 ? Math.round((stats.pending / registrations.length) * 100) : 0}% pending</div>
          </div>
          <div className="stat-icon">
            <BsClock size={18} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Confirmed</h3>
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-sub">{registrations.length > 0 ? Math.round((stats.confirmed / registrations.length) * 100) : 0}% confirmed</div>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="filter-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
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
            {filteredRegistrations.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  No registrations found
                </td>
              </tr>
            ) : (
              filteredRegistrations.map((reg) =>
                reg.participants?.map((participant, idx) => (
                  <tr key={`${reg.id}-${idx}`}>
                    <td>{participant.name}</td>
                    <td>{participant.reg_no}</td>
                    <td>{participant.email}</td>
                    <td>{getEventName(reg.event)}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(reg.status)}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        title="View Details"
                        onClick={() => handleViewDetails(reg)}
                      >
                        <BsEye />
                      </button>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>

      {/* View Details Modal */}
      {viewModal && selectedRegistration && (
        <div className="modal-overlay" onClick={() => setViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Registration Details</h2>
              <button className="modal-close-btn" onClick={() => setViewModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h3>Event Information</h3>
                <p><strong>Event:</strong> {getEventName(selectedRegistration.event)}</p>
                <p><strong>Registration Type:</strong> {selectedRegistration.registration_type}</p>
                {selectedRegistration.team_name && (
                  <p><strong>Team Name:</strong> {selectedRegistration.team_name}</p>
                )}
                <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedRegistration.status)}`}>{selectedRegistration.status}</span></p>
              </div>

              <div className="detail-section">
                <h3>Participants ({selectedRegistration.participants?.length || 0})</h3>
                {selectedRegistration.participants?.map((participant, idx) => (
                  <div key={idx} className="participant-card">
                    <p><strong>Name:</strong> {participant.name}</p>
                    <p><strong>Email:</strong> {participant.email}</p>
                    <p><strong>Registration No:</strong> {participant.reg_no}</p>
                    <p><strong>Department:</strong> {participant.department}</p>
                    <p><strong>Semester:</strong> {participant.current_semester}</p>
                    <p><strong>Phone:</strong> {participant.phone_no}</p>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                {selectedRegistration.status === 'PENDING' && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() => handleUpdateStatus(selectedRegistration.id, 'COMPLETED')}
                    >
                      <BsCheck /> Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleUpdateStatus(selectedRegistration.id, 'CANCELLED')}
                    >
                      <BsX /> Reject
                    </button>
                  </>
                )}
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteRegistration(selectedRegistration.id)}
                >
                  <BsTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDashboard;
