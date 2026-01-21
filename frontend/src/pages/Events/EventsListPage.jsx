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
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editImages, setEditImages] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const userRole = localStorage.getItem("role");
  const isAdminOrLead = userRole === "ADMIN" || userRole === "LEAD";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get("/events/");
      setEvents(res.data);
    } catch (error) {
      console.error(error);
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

  const startEdit = (event) => {
    setEditingEvent(event.id);
    setEditTitle(event.title);
    setEditContent(event.content);
    setEditDate(event.date || "");
    setEditTime(event.time || "");
    setEditVenue(event.venue || "");
    setEditCapacity(event.capacity || "");
    setEditCategory(event.category || "");
    setEditTags(event.tags || "");
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

    editImages.forEach((img) => {
      formData.append("images", img);
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
              {event.images.length > 0 ? (
                <img
                  src={`http://localhost:8000${event.images[0].image}`}
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

                {/* Date and Time Row */}
                <div className="form-row">
                  <div className="form-field">
                    <label>Date<span className="required">*</span></label>
                    <input
                      type="date"
                      placeholder="mm/dd/yyyy"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-field">
                    <label>Time <span className="required">*</span></label>
                    <input
                      type="time"
                      placeholder="--:-- ---"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
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
                      <option value="Workshop">Workshop</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Competition">Competition</option>
                      <option value="Networking">Networking</option>
                      <option value="Other">Other</option>
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
