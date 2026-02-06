import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/DashboardNavbar/Navbar.jsx";
import useAttendanceStore from "../../store/useAttendanceStore.js";
import axiosInstance from "../../axios.js";

import MeetingDetails from "../../components/Attendance/View/ViewMeetingDetails.jsx";
import AttendanceSection from "../../components/Attendance/View/AttendanceSection.jsx";
import "./ViewAttendancePage.css";

const ViewAttendancePage = () => {
  const { id } = useParams();
  const { students, fetchStudents } = useAttendanceStore();

  const [meeting, setMeeting] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await axiosInstance.get(`/meetings/${id}/`);
        setMeeting(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch meeting");
      } finally {
        setLoadingMeeting(false);
      }
    };

    fetchMeeting();
    fetchStudents();
  }, [id, fetchStudents]);

  const handleFetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const res = await axiosInstance.get(`/meetings/${id}/attendance/`);
      setAttendance(res.data.filter((a) => a.meeting === parseInt(id)));
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch attendance");
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const res = await axiosInstance.get(`/meetings/${id}/pdf/`, { responseType: "blob" });
      const file = new Blob([res.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = `Meeting_${id}_Attendance.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(fileURL);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download PDF");
    }
  };

  if (loadingMeeting) return <p className="text-center">Loading meeting...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;
  if (!meeting) return <p className="text-center">No meeting found.</p>;

  return (
    <>
      {/* <Navbar /> */}
      <div className="dashboard-container">
        <div className="main-content">
          <h3 className="dashboard-title text-center">VIEW ATTENDANCE</h3>
          <MeetingDetails meeting={meeting} />

          <div className="text-center mt-3 d-flex justify-content-center gap-3">
            <button
              className="btn btn-design"
              onClick={handleFetchAttendance}
              disabled={loadingAttendance}
            >
              {loadingAttendance ? "Loading Attendance..." : "View Attendance"}
            </button>
            <button className="btn btn-design" onClick={handleDownloadPDF}>
              Download Attendance PDF
            </button>
          </div>

          {attendance.length > 0 && (
            <AttendanceSection
              students={students}
              attendance={attendance}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ViewAttendancePage;
