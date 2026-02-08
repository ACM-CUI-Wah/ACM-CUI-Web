import React, { useEffect, useState, useCallback, useMemo } from "react";
import axiosInstance from "../../axios";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
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

  // Delete state
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  // Delete handlers
  const handleDeleteClick = useCallback((member) => {
    setMemberToDelete(member);
    setDeleteModalOpen(true);
  }, []);

  const handleCancelDelete = useCallback(() => {
    setDeleteModalOpen(false);
    setMemberToDelete(null);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!memberToDelete) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(`/students/${memberToDelete.id}`);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      setDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete member");
    } finally {
      setDeleting(false);
    }
  }, [memberToDelete]);

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
                  <button
                    className="action-btn btn-delete"
                    onClick={() => handleDeleteClick(member)}
                    title="Delete Member"
                    aria-label={`Delete ${member.user?.username}`}
                  >
                    <FaTrash />
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
              <button
                className="action-btn btn-delete"
                onClick={() => handleDeleteClick(member)}
                aria-label={`Delete ${member.user?.username}`}
              >
                <FaTrash /> Delete
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && memberToDelete && (
        <div className="modal-overlay" onClick={handleCancelDelete}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Member</h2>
            <p>
              Are you sure you want to delete <strong>{memberToDelete.user?.username}</strong>?
            </p>
            <p className="delete-warning">
              This will permanently delete the member and their user account. This action cannot be undone.
            </p>
            <div className="delete-modal-actions">
              <button
                className="btn-cancel"
                onClick={handleCancelDelete}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackMembersPage;
