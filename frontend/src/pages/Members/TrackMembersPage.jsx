import React, { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "../../axios";
import { FaEye, FaEdit } from "react-icons/fa";
import ViewMemberModal from "../../components/members/ViewMemberModal";
import EditMemberModal from "../../components/members/EditMemberModal";
import "./TrackMemberPage.css";

// Role badge styling helper
const getRoleClass = (role) => {
  const roleLower = role?.toLowerCase() || "other";
  if (roleLower.includes("student")) return "role-student";
  if (roleLower.includes("lead")) return "role-lead";
  return "role-other";
};

const TrackMembersPage = () => {
  // Data state
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // Fetch members
  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axiosInstance.get("/students/");
      setMembers(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch members");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Modal handlers
  const handleView = useCallback((member) => {
    setSelectedMember(member);
    setViewModalOpen(true);
  }, []);

  const handleEdit = useCallback((member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  }, []);

  const handleCloseModals = useCallback(() => {
    setViewModalOpen(false);
    setEditModalOpen(false);
    setSelectedMember(null);
  }, []);

  const handleSaveSuccess = useCallback(() => {
    fetchMembers();
    handleCloseModals();
  }, [fetchMembers, handleCloseModals]);

  // Memoized table headers
  const tableHeaders = useMemo(() => [
    { key: "username", label: "Username" },
    { key: "roll_no", label: "Roll No." },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role" },
    { key: "club", label: "Club" },
    { key: "actions", label: "Actions", className: "actions-header" },
  ], []);

  // Render loading state
  if (loading) {
    return (
      <div className="track-members-container">
        <h1 className="dashboard-title">Track Members</h1>
        <p className="status-message">Loading members...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="track-members-container">
        <h1 className="dashboard-title">Track Members</h1>
        <p className="status-message error-message">{error}</p>
      </div>
    );
  }

  // Render empty state
  if (members.length === 0) {
    return (
      <div className="track-members-container">
        <h1 className="dashboard-title">Track Members</h1>
        <p className="status-message">No members found</p>
      </div>
    );
  }

  return (
    <div className="track-members-container">
      <h1 className="dashboard-title">Track Members</h1>

      {/* Desktop Table View */}
      <div className="members-table-card">
        <table className="members-table">
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header.key} className={header.className || ""}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.user?.id || member.id}>
                <td>{member.user?.username || "N/A"}</td>
                <td>{member.roll_no || "N/A"}</td>
                <td>{member.user?.email || "N/A"}</td>
                <td>{member.user?.phone_number || "N/A"}</td>
                <td>
                  <span className={`role-badge ${getRoleClass(member.user?.role)}`}>
                    {member.user?.role || "Unknown"}
                  </span>
                </td>
                <td>{member.club || "N/A"}</td>
                <td className="actions-cell">
                  <button
                    className="action-btn btn-view"
                    onClick={() => handleView(member)}
                    title="View Member"
                    aria-label={`View ${member.user?.username}`}
                  >
                    <FaEye />
                  </button>
                  <button
                    className="action-btn btn-edit2"
                    onClick={() => handleEdit(member)}
                    title="Edit Member"
                    aria-label={`Edit ${member.user?.username}`}
                  >
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="members-mobile-list">
        {members.map((member) => (
          <article key={member.user?.id || member.id} className="member-card">
            <header className="member-card-header">
              <span className="member-name">{member.user?.username || "N/A"}</span>
              <span className={`role-badge ${getRoleClass(member.user?.role)}`}>
                {member.user?.role || "Unknown"}
              </span>
            </header>

            <div className="member-card-body">
              <div className="card-item">
                <span className="card-label">Roll No.</span>
                <span className="card-value">{member.roll_no || "N/A"}</span>
              </div>
              <div className="card-item">
                <span className="card-label">Email</span>
                <span className="card-value">{member.user?.email || "N/A"}</span>
              </div>
              <div className="card-item">
                <span className="card-label">Phone</span>
                <span className="card-value">{member.user?.phone_number || "N/A"}</span>
              </div>
              <div className="card-item">
                <span className="card-label">Club</span>
                <span className="card-value">{member.club || "N/A"}</span>
              </div>
            </div>

            <footer className="member-card-actions">
              <button
                className="action-btn btn-view"
                onClick={() => handleView(member)}
                aria-label={`View ${member.user?.username}`}
              >
                <FaEye /> View
              </button>
              <button
                className="action-btn btn-edit2"
                onClick={() => handleEdit(member)}
                aria-label={`Edit ${member.user?.username}`}
              >
                <FaEdit /> Edit
              </button>
            </footer>
          </article>
        ))}
      </div>

      {/* Modals */}
      <ViewMemberModal
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        member={selectedMember}
      />
      <EditMemberModal
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        member={selectedMember}
        onSave={handleSaveSuccess}
      />
    </div>
  );
};

export default TrackMembersPage;
