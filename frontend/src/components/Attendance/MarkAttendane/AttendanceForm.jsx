import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./AttendanceForm.css";

const AttendanceForm = ({ selectedDate, setSelectedDate, showCalendar, setShowCalendar, meetingDetails, handleDetailChange }) => {
  
  // FIX: Relaxed regex to allow partial input while typing (e.g., '2', '2:', '2:3')
  const handleTimeValueChange = (e) => {
    const { value } = e.target;
    
    // Allows empty string, up to 2 digits for hours, optionally a colon, and up to 2 digits for minutes.
    const timeRegex = /^\d{0,2}:?\d{0,2}$/;
    
    if (value === "" || timeRegex.test(value)) {
      handleDetailChange(e);
    }
  };

  const handleTimeModifierChange = (e, timeType) => {
    // Manually create a structure matching e.target for the parent handler
    handleDetailChange({ target: { name: `${timeType}Modifier`, value: e.target.value } });
  };
  
  return (
    <div className="attendance-form">
      <div className="filter-container">
        
        {/* Date Picker Button */}
        <button className="btn-design" onClick={() => setShowCalendar(!showCalendar)}>
          DATE: {selectedDate.toLocaleDateString()}
        </button>
        {showCalendar && (
          <div className="calendar-popup">
            <DatePicker selected={selectedDate} onChange={setSelectedDate} inline />
          </div>
        )}

        {/* Start Time Group (Input + Dropdown) */}
        <div className="time-input-group">
          <input 
            type="text" 
            name="startTimeValue" 
            placeholder="Start HH:MM" 
            value={meetingDetails.startTimeValue} 
            onChange={handleTimeValueChange} 
            className="time-value-input"
          />
          <select
            name="startTimeModifier"
            value={meetingDetails.startTimeModifier}
            onChange={(e) => handleTimeModifierChange(e, 'startTime')}
            className="time-modifier-select"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        {/* End Time Group (Input + Dropdown) */}
        <div className="time-input-group">
          <input 
            type="text" 
            name="endTimeValue" 
            placeholder="End HH:MM" 
            value={meetingDetails.endTimeValue} 
            onChange={handleTimeValueChange} 
            className="time-value-input"
          />
          <select
            name="endTimeModifier"
            value={meetingDetails.endTimeModifier}
            onChange={(e) => handleTimeModifierChange(e, 'endTime')}
            className="time-modifier-select"
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        {/* Venue Input */}
        <input 
          type="text" 
          name="venue" 
          placeholder="Venue" 
          value={meetingDetails.venue} 
          onChange={handleDetailChange} 
          className="meeting-input"
        />
      </div>

      <div className="notes-section">
        <div className="highlight-section">
          <h5>Meeting Highlights</h5>
          <textarea name="highlights" value={meetingDetails.highlights} onChange={handleDetailChange} className="highlight-input" placeholder="Highlights"/>
        </div>

        <div className="agenda-section">
          <h5>Meeting Agenda</h5>
          <textarea name="agenda" value={meetingDetails.agenda} onChange={handleDetailChange} className="highlight-input" placeholder="Agenda"/>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;