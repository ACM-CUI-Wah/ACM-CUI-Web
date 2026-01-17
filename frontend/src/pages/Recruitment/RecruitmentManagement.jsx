import React, { useState } from 'react';
import { BsPeople, BsClock, BsCalendarCheck, BsCheckCircle, BsEye } from "react-icons/bs";
import './Recruitment.css';

const RecruitmentManagement = () => {
    const [applicants] = useState([
        { id: 1, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', role: 'codehub', status: 'Under Review' },
        { id: 2, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', role: 'codehub', status: 'Accepted' },
        { id: 3, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', role: 'codehub', status: 'Rejected' },
        { id: 4, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', role: 'codehub', status: 'Interviews' },
        { id: 5, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', role: 'codehub', status: 'Accepted' },
        { id: 6, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', role: 'codehub', status: 'Under Review' },
        { id: 7, name: 'Ali', rollNo: 'FA24-BSE-001', email: 'ali12@gmail.com', role: 'codehub', status: 'Interviews' },
    ]);

    const getStatusClass = (status) => {
        switch (status) {
            case 'Under Review': return 'status-under-review';
            case 'Accepted': return 'status-accepted';
            case 'Rejected': return 'status-rejected';
            case 'Interviews': return 'status-interviews';
            default: return '';
        }
    };

    return (
        <div className="recruitment-dashboard">
            <div className="dashboard-header">
                <h1>RECRUITMENT MANAGEMENT</h1>
                <p>Track applications and manage the hiring pipeline</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Total Applications</h3>
                        <div className="stat-value">120</div>
                        <div className="stat-sub">All time</div>
                    </div>
                    <div className="stat-icon">
                        <BsPeople size={18} color="#a0a0a0" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Under Review</h3>
                        <div className="stat-value">20</div>
                        <div className="stat-sub">Awaiting review</div>
                    </div>
                    <div className="stat-icon">
                        <BsClock size={18} color="#a0a0a0" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Interviews</h3>
                        <div className="stat-value">85</div>
                        <div className="stat-sub">Scheduled</div>
                    </div>
                    <div className="stat-icon">
                        <BsCalendarCheck size={18} color="#a0a0a0" />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-info">
                        <h3>Accepted</h3>
                        <div className="stat-value">10</div>
                        <div className="stat-sub">New members</div>
                    </div>
                    <div className="stat-icon">
                        <BsCheckCircle size={18} color="#a0a0a0" />
                    </div>
                </div>
            </div>

            <div className="recruitment-table-container">
                <div className="table-controls">
                    <input
                        type="text"
                        placeholder="Search by email, name, or registration"
                        className="search-input"
                    />
                    <select className="filter-select">
                        <option>All Role</option>
                    </select>
                    <select className="filter-select">
                        <option>All Status</option>
                    </select>
                </div>

                <table className="r-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Roll No.</th>
                            <th>Email</th>
                            <th>Preferred Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applicants.map((app) => (
                            <tr key={app.id}>
                                <td>{app.name}</td>
                                <td>{app.rollNo}</td>
                                <td>{app.email}</td>
                                <td>{app.role}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(app.status)}`}>
                                        {app.status}
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

export default RecruitmentManagement;
