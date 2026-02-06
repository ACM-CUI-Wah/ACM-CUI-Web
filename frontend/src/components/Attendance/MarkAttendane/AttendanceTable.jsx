import React from "react";
import "./AttendanceTable.css";

const AttendanceTable = ({ students, attendance, handleAttendanceChange, loading }) => {
  return (
    <div className="attendance-section">
      <div className="attendance-header-row mt-4">
        <h6 className="col-name-header">NAME</h6>
        <h6 className="col-reg-header">ROLL NO.</h6>
        <div className="col-status-header">
          <h6>STATUS</h6>
          <div className="status-header-labels">
            <span>P</span>
            <span>A</span>
            <span>L</span>
          </div>
        </div>
      </div>

      {loading && <p>Loading students...</p>}

      {!loading &&
        students.map((s, index) => (
          <div key={s.user.id} className="student-attendance-row">
            <div className="student-name">
              <span>{index + 1}.</span> {s.user.first_name} {s.user.last_name}
            </div>
            <div className="student-reg">{s.roll_no}</div>
            <div className="student-status-controls">
              {["PRESENT", "ABSENT", "LEAVE"].map((status) => (
                <label
                  key={status}
                  className={`circle ${status.toLowerCase()} ${attendance[s.user.id] === status ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name={`student-${s.user.id}`}
                    value={status}
                    checked={attendance[s.user.id] === status}
                    onChange={() => handleAttendanceChange(s.user.id, status)}
                  />
                </label>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default AttendanceTable;
