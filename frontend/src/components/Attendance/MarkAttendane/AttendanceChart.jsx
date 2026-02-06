import React from "react";
import "./AttendanceChart.css";

const AttendanceChart = ({ total, presentCount, absentCount, leaveCount }) => {
  const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="attendance-chart-container">
      <div className="chart-box">
        <svg width="160" height="160" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" stroke="#eee" strokeWidth="18" fill="none"/>
          <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#2D66AD"
            strokeWidth="18"
            fill="none"
            strokeDasharray={`${(percentage * 565) / 100} 565`}
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
            style={{ transition: "stroke-dasharray 0.6s ease" }}
          />
          <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="22" fontWeight="bold">
            {percentage}%
          </text>
        </svg>
        <div className="legend mt-2">
          <span className="legend-item present"></span> Present ({presentCount})
          <span className="legend-item absent ms-2"></span> Absent ({absentCount})
          <span className="legend-item leave ms-2"></span> Leave ({leaveCount})
        </div>
      </div>

      <div className="stats-box">
        <p>Total Members: <span className="stat-number">{total}</span></p>
        <p>Present: <span className="stat-number">{presentCount}</span></p>
        <p>Absent: <span className="stat-number">{absentCount}</span></p>
        <p>Leave: <span className="stat-number">{leaveCount}</span></p>
      </div>
    </div>
  );
};

export default AttendanceChart;
