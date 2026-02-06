import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import Navbar from "../../components/Navbar.jsx"; 
import useAttendanceStore from "../../store/useAttendanceStore.js";

import AttendanceForm from "../../components/Attendance/MarkAttendane/AttendanceForm.jsx";
import AttendanceChart from "../../components/Attendance/MarkAttendane/AttendanceChart.jsx";
import AttendanceTable from "../../components/Attendance/MarkAttendane/AttendanceTable.jsx";

const MarkAttendance = () => {
  const navigate = useNavigate();
  const { students, fetchStudents, createMeeting, loading } = useAttendanceStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  // State updated for split time inputs
  const [meetingDetails, setMeetingDetails] = useState({
    startTimeValue: "2:00",
    startTimeModifier: "PM",
    endTimeValue: "3:00",
    endTimeModifier: "PM",
    venue: "",
    highlights: "",
    agenda: "",
  });
  
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (students.length > 0) {
      const initial = students.reduce((acc, s) => {
        acc[s.user.id] = null;
        return acc;
      }, {});
      setAttendance(initial);
    }
  }, [students]);

  const handleAttendanceChange = (userId, status) => {
    setAttendance((prev) => ({ ...prev, [userId]: status }));
  };

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setMeetingDetails((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Converts a 12-hour time string (e.g., "2:00 PM") to a 24-hour format (e.g., "14:00:00").
   */
  function to24Hour(timeStr) {
    if (!timeStr) return "";
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i); 
    if (!match) return "";
    
    let [_, hours, minutes, modifier] = match;
    hours = parseInt(hours, 10);
    
    if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0; 
    
    return `${hours.toString().padStart(2, "0")}:${minutes}:00`;
  }

  const handleSubmit = async () => {
    const unmarked = Object.values(attendance).some((status) => status === null);
    if (unmarked) return alert("Please mark attendance for all students.");

    // 1. Combine time parts
    const fullStartTime = `${meetingDetails.startTimeValue} ${meetingDetails.startTimeModifier}`;
    const fullEndTime = `${meetingDetails.endTimeValue} ${meetingDetails.endTimeModifier}`;

    // 2. Validate essential details and time format
    if (
      !meetingDetails.venue ||
      !meetingDetails.highlights ||
      !meetingDetails.agenda
    ) {
      return alert("Please fill in all meeting details.");
    }
    
    const timeFormatRegex = /^\d{1,2}:\d{2}$/; // Strict HH:MM check
    if (!timeFormatRegex.test(meetingDetails.startTimeValue) || !timeFormatRegex.test(meetingDetails.endTimeValue)) {
        return alert("Start Time and End Time must be in HH:MM format (e.g., 2:00).");
    }

    const attendanceArray = Object.entries(attendance).map(([userId, status]) => ({
      user: parseInt(userId),
      status,
    }));

    const submissionData = {
      date: selectedDate.toISOString().split("T")[0],
      start_time: to24Hour(fullStartTime),
      end_time: to24Hour(fullEndTime),
      venue: meetingDetails.venue,
      agenda: meetingDetails.agenda,
      highlights: meetingDetails.highlights,
      attendance: attendanceArray,
    };

    try {
      await createMeeting(submissionData);
      alert("Attendance submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "An unexpected error occurred.";
      alert(`Error submitting attendance: ${JSON.stringify(errorMessage)}`);
    }
  };


  const values = Object.values(attendance);
  const total = values.length;
  const presentCount = values.filter((v) => v === "PRESENT").length;
  const absentCount = values.filter((v) => v === "ABSENT").length;
  const leaveCount = values.filter((v) => v === "LEAVE").length;

  return (
    // <Navbar /> // Uncomment if you need Navbar
    <div className="dashboard-container">
      <div className="main-content">
        <h3 className="dashboard-title text-center">ATTENDANCE</h3>

        <AttendanceForm
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          showCalendar={showCalendar}
          setShowCalendar={setShowCalendar}
          meetingDetails={meetingDetails}
          handleDetailChange={handleDetailChange}
        />

        <AttendanceChart
          total={total}
          presentCount={presentCount}
          absentCount={absentCount}
          leaveCount={leaveCount}
        />

        <AttendanceTable
          students={students}
          attendance={attendance}
          handleAttendanceChange={handleAttendanceChange}
          loading={loading}
        />

        <div className="submit-container mt-3 text-center">
          <button className="btn-design" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;