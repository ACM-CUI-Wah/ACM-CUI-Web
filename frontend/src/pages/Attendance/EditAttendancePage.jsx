import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../../components/DashboardNavbar/Navbar";
import useAttendanceStore from "../../store/useAttendanceStore";
import axiosInstance from "../../axios";
import EditMeeting from "../../components/Attendance/Edit/EditMeeting";
import EditAttendance from "../../components/Attendance/Edit/EditAttendance";
import "./EditAttendancePage.css";

const EditAttendancePage = () => {
  const { id } = useParams();
  const { students, fetchStudents } = useAttendanceStore();

  const [meeting, setMeeting] = useState(null);
  const [loadingMeeting, setLoadingMeeting] = useState(true);
  const [editingMeeting, setEditingMeeting] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await axiosInstance.get(`/meetings/${id}/`);
        const data = res.data;

        const formatTime = (timeStr) => (timeStr ? timeStr.slice(0, 5) : "");

        setMeeting({
          ...data,
          start_time: formatTime(data.start_time),
          end_time: formatTime(data.end_time),
        });
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch meeting");
      } finally {
        setLoadingMeeting(false);
      }
    };

    fetchMeeting();
    fetchStudents();
  }, [id, fetchStudents]);

  if (loadingMeeting) return <p className="text-center">Loading meeting...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;
  if (!meeting) return <p className="text-center">No meeting found.</p>;

  return (
    <div>
      {/* <Navbar /> */}
      <div className="main-content">
        <h3 className="dashboard-title text-center">EDIT MEETING & ATTENDANCE</h3>

        {!editingMeeting ? (
          <div className="meeting-details-box mt-4 text-center">
            <h5>Meeting Details</h5>
            <p><strong>Date:</strong> {meeting.date}</p>
            <p><strong>Time:</strong> {meeting.start_time} - {meeting.end_time}</p>
            <p><strong>Venue:</strong> {meeting.venue}</p>
            <p><strong>Highlights:</strong> {meeting.highlights}</p>
            <p><strong>Agenda:</strong> {meeting.agenda}</p>

            <button
              className="btn btn-design mt-3"
              onClick={() => setEditingMeeting(true)}
            >
              Edit Meeting
            </button>
          </div>
        ) : (
          <EditMeeting
            meeting={meeting}
            setMeeting={setMeeting}
            meetingId={id}
            onCancel={() => setEditingMeeting(false)}
          />
        )}


        <EditAttendance meetingId={id} students={students} />
      </div>
    </div>
  );
};

export default EditAttendancePage;
