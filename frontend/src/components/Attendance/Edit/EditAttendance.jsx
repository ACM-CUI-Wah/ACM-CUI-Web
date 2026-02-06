import React, { useState } from "react";
import axiosInstance from "../../../axios";
import "./EditAttendance.css"
const EditAttendance = ({ meetingId, students }) => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/meetings/${meetingId}/attendance/`);
      const filtered = res.data.filter((a) => a.meeting === parseInt(meetingId));
      setAttendance(filtered);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

 
  const handleUpdateAttendance = async (record) => {
    try {
      await axiosInstance.put(`/meetings/${meetingId}/attendance/${record.id}`, record);
      alert("Attendance updated!");
    } catch (err) {
      alert("Failed to update attendance");
    }
  };

  return (
    <div className="attendance-section mt-5">
      <h5>Edit Attendance</h5>
      <button className="btn btn-design my-3" onClick={fetchAttendance} disabled={loading}>
        {loading ? "Loading..." : "Load Attendance"}
      </button>
      {error && <p className="text-danger">{error}</p>}

      {attendance.length > 0 && (
        <>
          <div className="attendance-header-row mt-3">
            <h6 className="col-name-header">NAME</h6>
            <h6 className="col-reg-header">REG NO.</h6>
            <h6 className="col-status-header">STATUS</h6>
          </div>
          <div className="attendance-list">
            {students.map((student) => {
              const record = attendance.find((a) => a.user === student.user.id);
              if (!record) return null;

              return (
                <div key={record.id} className="student-attendance-row">
                  <div className="student-name">
                    {student.user.first_name} {student.user.last_name}
                  </div>
                  <div className="student-reg">{student.roll_no}</div>
                  <div className="student-status d-flex align-items-center">
                    <select
                      value={record.status}
                      onChange={(e) =>
                        setAttendance((prev) =>
                          prev.map((a) =>
                            a.id === record.id
                              ? { ...a, status: e.target.value }
                              : a
                          )
                        )
                      }
                    >
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="LEAVE">Leave</option>
                    </select>
                    <button
                      className="btn btn-design ms-2"
                      onClick={() => handleUpdateAttendance(record)}
                    >
                      Save
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default EditAttendance;
