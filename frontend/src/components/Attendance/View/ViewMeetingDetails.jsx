import React from "react";

const ViewMeetingDetails = ({ meeting }) => (
  <div className="meeting-details-box mt-4">
    <h5>Meeting Details</h5>
    <p><strong>Date:</strong> {meeting.date}</p>
    <p><strong>Time:</strong> {meeting.start_time} - {meeting.end_time}</p>
    <p><strong>Venue:</strong> {meeting.venue}</p>
    <p><strong>Highlights:</strong> {meeting.highlights}</p>
    <p><strong>Agenda:</strong> {meeting.agenda}</p>
  </div>
);

export default ViewMeetingDetails;
