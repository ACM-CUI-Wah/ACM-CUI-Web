import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./MeetingList.css";
import Navbar from "../../components/DashboardNavbar/Navbar";
import { Link } from "react-router-dom";
import useAttendanceStore from "../../store/useAttendanceStore";

const MeetingList = () => {
  const { meetings, loading, error, fetchMeetings, deleteMeeting } =
    useAttendanceStore();
  const [openMeetingId, setOpenMeetingId] = useState(null);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const toggleDropdown = (id) => {
    setOpenMeetingId(openMeetingId === id ? null : id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      await deleteMeeting(id);
    }
  };

  const formatTime = (date, time) => {
    if (!date || !time) return "N/A";
    const isoString = `${date}T${time}`;
    const parsed = new Date(isoString);
    if (isNaN(parsed)) return time;
    return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="attendance-section">
        <h3 className="dashboard-title text-center">MEETING HISTORY</h3>

        {loading && <p className="text-center">Loading meetings...</p>}
        {error && <p className="text-danger text-center">{error}</p>}

        <div className="list-group list-group-flush mt-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="list-group-item flex-column align-items-start"
            >
              <div className="d-flex justify-content-between align-items-center">
                <span className="h5 mb-0">
                  {new Date(meeting.date).toLocaleDateString()}
                </span>
                <div>
                  <button
                    className="btn btn-design me-2"
                    onClick={() => toggleDropdown(meeting.id)}
                  >
                    {openMeetingId === meeting.id ? "Hide" : "Details"}
                  </button>

                 
                  <Link
                    to={`/dashboard/meetings/${meeting.id}/`}
                    className="btn btn-design me-2"
                  >
                    View
                  </Link>
                  <Link
                    to={`/dashboard/meetings/${meeting.id}/edit`}
                    className="btn btn-design"
                    state={{ meeting }}
                  >
                    Edit
                  </Link>
                </div>
              </div>

              {/* Dropdown details */}
              {openMeetingId === meeting.id && (
                <div className="mt-3 border rounded p-3 bg-light">
                  <p>
                    <strong>Start Time:</strong>{" "}
                    {formatTime(meeting.date, meeting.start_time)}
                  </p>
                  <p>
                    <strong>End Time:</strong>{" "}
                    {formatTime(meeting.date, meeting.end_time)}
                  </p>
                  <p>
                    <strong>Venue:</strong> {meeting.venue}
                  </p>
                  <p>
                    <strong>Agenda:</strong> {meeting.agenda}
                  </p>
                  <p>
                    <strong>Highlights:</strong> {meeting.highlights}
                  </p>

                  {/* ✅ Meeting Edit/Delete */}
                  <div className="d-flex justify-content-end mt-2">
                    {/* Edit meeting */}
                    <Link
                      to={`/edit-meeting/${meeting.id}`}
                      className="btn btn-sm btn-outline-secondary me-2"
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>

                    {/* Delete meeting */}
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(meeting.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MeetingList;
