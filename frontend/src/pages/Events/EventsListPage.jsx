// src/components/EventListPage.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../axios";
import "./EventsList.css";
import "./EventsCreatePage.css";
import { Link } from "react-router-dom";


const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editAbout, setEditAbout] = useState("");
  const [editSpeakers, setEditSpeakers] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [eventTypes, setEventTypes] = useState([]);
  const userRole = localStorage.getItem("role");
  const isAdminOrLead = userRole === "ADMIN" || userRole === "LEAD";

  useEffect(() => {
    fetchEvents();
    fetchEventTypes();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get("/events/");
      setEvents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const res = await axiosInstance.get("/events/types/");
      setEventTypes(res.data);
    } catch (error) {
      console.error("Error fetching event types:", error);
    }
  };

  const deleteImage = async (eventId, imgId) => {
    try {
      await axiosInstance.delete(`/events/${eventId}/image/${imgId}`);

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
              ...event,
              images: event.images.filter((img) => img.id !== imgId),
            }
            : event
        )
      );
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  const removeNewImage = (index) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axiosInstance.delete(`/events/${eventId}/`);
      fetchEvents();
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  // Helper function to parse hosts/tags (handles double-encoded JSON)
  const parseArrayField = (field) => {
    if (!field || !Array.isArray(field)) return [];

    return field.map(item => {
      try {
        // If item is a JSON string, parse it
        if (typeof item === 'string' && item.startsWith('[')) {
          const parsed = JSON.parse(item);
          return Array.isArray(parsed) ? parsed[0] : parsed;
        }
        return item;
      } catch (e) {
        return item;
      }
    }).filter(item => item && String(item).trim());
  };

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h) => {
    if (!time12h) return "";

    // If already in 24-hour format (HH:mm or HH:mm:ss), return as is
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(time12h)) {
      return time12h.substring(0, 5); // Return HH:mm
    }

    // Parse 12-hour format
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }

    return `${String(hours).padStart(2, '0')}:${minutes}`;
  };

  const startEdit = (event) => {
    setEditingEvent(event.id);
    setEditTitle(event.title || "");
    setEditContent(event.content || "");
    setEditAbout(event.description || ""); // API uses 'description'

    // Parse and convert hosts array to comma-separated string
    const parsedHosts = parseArrayField(event.hosts);
    setEditSpeakers(parsedHosts.join(", "));

    setEditDate(event.date || "");

    // Convert times from 12-hour to 24-hour format for HTML time inputs
    setEditStartTime(convertTo24Hour(event.time_from) || "");
    setEditEndTime(convertTo24Hour(event.time_to) || "");

    setEditVenue(event.location || ""); // API uses 'location'
    setEditCapacity(event.total_seats || ""); // API uses 'total_seats'

    // Extract event_type ID from the event_type object
    const eventTypeId = event.event_type?.id || event.event_type || "";
    setEditCategory(eventTypeId);

    // Parse and convert tags array to comma-separated string
    const parsedTags = parseArrayField(event.tags);
    setEditTags(parsedTags.join(", "));

    setEditImages([]);
    setShowEditModal(true);
  };

  const handleEditImageChange = (e) => {
    setEditImages((prev) => [...prev, ...Array.from(e.target.files)]);
  };


  const saveEdit = async (eventId) => {
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("content", editContent);
    formData.append("description", editAbout);
    formData.append("date", editDate);
    formData.append("time_from", editStartTime);
    formData.append("time_to", editEndTime);
    formData.append("location", editVenue);
    formData.append("total_seats", editCapacity);
    formData.append("event_type", editCategory); // Should be event type ID

    // Convert comma-separated speakers to hosts array
    if (editSpeakers) {
      const speakersStr = Array.isArray(editSpeakers) ? editSpeakers.join(", ") : String(editSpeakers);
      if (speakersStr.trim()) {
        const hostsArray = speakersStr.split(",").map(s => s.trim()).filter(s => s);
        formData.append("hosts", JSON.stringify(hostsArray));
      }
    }

    // Convert comma-separated tags to array
    if (editTags) {
      const tagsStr = Array.isArray(editTags) ? editTags.join(", ") : String(editTags);
      if (tagsStr.trim()) {
        const tagsArray = tagsStr.split(",").map(t => t.trim()).filter(t => t);
        formData.append("tags", JSON.stringify(tagsArray));
      }
    }

    editImages.forEach((img) => {
      formData.append("image", img);
    });

    try {
      await axiosInstance.put(`/events/${eventId}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Event updated successfully!");
      setEditingEvent(null);
      setShowEditModal(false);
      fetchEvents();
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert("Failed to update event. Please check all fields.");
    }
  };

  return (
    <>
      {/* <Navbar/> */}
      <div className="event-list-container">
        <h2 className="dashboard-title">Events</h2>
        {events.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-image-container">
              {event.image ? (
                <img
                  src={event.image}
                  alt="event"
                  className="event-main-image"
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
            </div>

            <div className="event-content-container">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-content">{event.content}</p>
              <p className="event-date">
                <strong>Date:</strong> {event.date}
              </p>

              <div className="card-buttons">
                {isAdminOrLead && (
                  <>
                    <button onClick={() => startEdit(event)} className="btn-design">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="btn-design"
                    >
                      Delete
                    </button>
                  </>
                )}
                <Link to={`/events/${event.id}`} className="btn-design" style={{ textDecoration: 'none' }}>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="modal-overlay">
            <div className="modal-content-large">
              <div className="modal-header">
                <h2 className="event-details-heading">Edit Event</h2>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  ✕
                </button>
              </div>

              <form className="event-form-new">
                {/* Event Title */}
                <div className="form-field full-width">
                  <label>Event Title <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Web Development Workshop"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                {/* Event Description */}
                <div className="form-field full-width">
                  <label>Event Description</label>
                  <textarea
                    placeholder="Describe your event, what participants will learn or experience....."
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    required
                    rows="4"
                  />
                </div>

                {/* About */}
                <div className="form-field full-width">
                  <label>About</label>
                  <textarea
                    placeholder="Provide detailed information about the event, agenda, what to expect..."
                    value={editAbout}
                    onChange={(e) => setEditAbout(e.target.value)}
                    rows="4"
                  />
                </div>

                {/* Speakers */}
                <div className="form-field full-width">
                  <label>Speakers</label>
                  <textarea
                    placeholder="List the speakers/presenters for this event (e.g., John Doe - Software Engineer at Google, Jane Smith - Data Scientist)"
                    value={editSpeakers}
                    onChange={(e) => setEditSpeakers(e.target.value)}
                    rows="3"
                  />
                </div>

                {/* Date Row */}
                <div className="form-field full-width">
                  <label>Date<span className="required">*</span></label>
                  <input
                    type="date"
                    placeholder="mm/dd/yyyy"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    required
                  />
                </div>

                {/* Time Interval Row */}
                <div className="form-row">
                  <div className="form-field">
                    <label>Start Time <span className="required">*</span></label>
                    <input
                      type="time"
                      placeholder="--:-- ---"
                      value={editStartTime}
                      onChange={(e) => setEditStartTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>End Time <span className="required">*</span></label>
                    <input
                      type="time"
                      placeholder="--:-- ---"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Venue */}
                <div className="form-field full-width">
                  <label>Venue <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., Computer Science Block Lecture Room F-09"
                    value={editVenue}
                    onChange={(e) => setEditVenue(e.target.value)}
                    required
                  />
                </div>

                {/* Capacity and Category Row */}
                <div className="form-row">
                  <div className="form-field">
                    <label>Capacity<span className="required">*</span></label>
                    <input
                      type="number"
                      placeholder="e.g., 50"
                      value={editCapacity}
                      onChange={(e) => setEditCapacity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Category <span className="required">*</span></label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      required
                    >
                      <option value="">Select a category</option>
                      {eventTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Event Image */}
                <div className="form-field full-width">
                  <label>Event Image</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      id="edit-event-image"
                      accept="image/*"
                      multiple
                      onChange={handleEditImageChange}
                      className="file-input-hidden"
                    />
                    <label htmlFor="edit-event-image" className="file-upload-label">
                      <span className="file-upload-btn">Choose file</span>
                      <span className="file-upload-text">
                        {editImages.length > 0 ? `${editImages.length} file(s) selected` : 'no file choose'}
                      </span>
                    </label>
                  </div>

                  {editImages.length > 0 && (
                    <div className="image-preview-container-new">
                      {editImages.map((file, index) => (
                        <div key={index} className="image-preview-box-new">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`preview-${index}`}
                            className="image-preview-new"
                          />
                          <button
                            type="button"
                            className="remove-image-btn-new"
                            onClick={() => removeNewImage(index)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tag */}
                <div className="form-field full-width">
                  <label>Tag</label>
                  <input
                    type="text"
                    placeholder="e.g., Beginner, Web Development, Hand-on (comma-separate)"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                  />
                </div>

                {/* Submit Button */}
                <div className="form-submit-wrapper">
                  <button
                    type="button"
                    className="create-event-btn"
                    onClick={() => saveEdit(editingEvent)}
                  >
                    Update Event
                  </button>
                  <button
                    type="button"
                    className="cancel-event-btn"
                    onClick={() => setShowEditModal(false)}
                    style={{ marginLeft: '12px' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default EventListPage;
