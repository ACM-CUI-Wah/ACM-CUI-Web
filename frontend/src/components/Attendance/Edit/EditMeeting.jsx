import React, { useState } from "react";
import axiosInstance from "../../../axios";
import "./EditMeeting.css"

const EditMeeting = ({ meeting, setMeeting, meetingId, onCancel }) => {
  const [saving, setSaving] = useState(false);

  const handleUpdateMeeting = async (e) => {
    e.preventDefault();
    setSaving(true);

    
    const formatForBackend = (timeStr) =>
      timeStr && timeStr.length === 5 ? `${timeStr}:00` : timeStr;

    const payload = {
      ...meeting,
      start_time: formatForBackend(meeting.start_time),
      end_time: formatForBackend(meeting.end_time),
    };

    try {
      await axiosInstance.patch(`/meetings/${meetingId}/`, payload);
      alert(" Meeting updated successfully!");
      onCancel();
    } catch (err) {
      alert(" Failed to update meeting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow p-4" style={{ maxWidth: "500px", width: "100%" }}>
        <h4 className="text-center mb-4">Edit Meeting</h4>
        <form onSubmit={handleUpdateMeeting}>
          <div className="mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={meeting.date}
              onChange={(e) => setMeeting({ ...meeting, date: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Start Time</label>
            <input
              type="time"
              className="form-control"
              value={meeting.start_time}
              onChange={(e) => setMeeting({ ...meeting, start_time: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">End Time</label>
            <input
              type="time"
              className="form-control"
              value={meeting.end_time}
              onChange={(e) => setMeeting({ ...meeting, end_time: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Venue</label>
            <input
              type="text"
              className="form-control"
              value={meeting.venue}
              onChange={(e) => setMeeting({ ...meeting, venue: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Agenda</label>
            <textarea
              className="form-control"
              rows="3"
              value={meeting.agenda}
              onChange={(e) => setMeeting({ ...meeting, agenda: e.target.value })}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label">Highlights</label>
            <textarea
              className="form-control"
              rows="3"
              value={meeting.highlights}
              onChange={(e) => setMeeting({ ...meeting, highlights: e.target.value })}
            ></textarea>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-design" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Meeting"}
            </button>
            <button className="btn btn-design" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMeeting;
