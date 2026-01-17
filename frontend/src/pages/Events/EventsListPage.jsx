// src/components/EventListPage.js
import React, { useState, useEffect } from "react";
import axiosInstance from "../../axios";
import "./EventsListPage.css";
import { Link } from "react-router-dom";


const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
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
                src={event.images[0].image}
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
        </div>
      ))}

      {/* Edit Modal */}
{showEditModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Edit Event</h3>
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
      />
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
      />

      {/* Existing images */}
      <div className="modal-image-preview">
        {events.find((e) => e.id === editingEvent)?.images.map((img) => (
          <div key={img.id} className="preview-box">
            <img src={img.image} alt="existing" />
            <button
              type="button"
              className="btn-remove-img"
              onClick={() => deleteImage(editingEvent, img.id)} // backend delete
            >
              ✕
            </button>
          </div>
        ))}

        {/* New selected images */}
        {Array.from(editImages).map((file, idx) => (
          <div key={idx} className="preview-box">
            <img src={URL.createObjectURL(file)} alt="new upload" />
            <button
              type="button"
              className="btn-remove-img"
              onClick={() =>
                setEditImages((prev) => prev.filter((_, i) => i !== idx))
              }
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* File input for uploading new images */}
      <input type="file" multiple onChange={handleEditImageChange} />

      <div className="form-buttons">
        <button
          onClick={() => saveEdit(editingEvent)}
          className="btn-design"
        >
          Save
        </button>
        <button
          onClick={() => setShowEditModal(false)}
          className="btn-design"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


    </div>
    </>
  );
};

export default EventListPage;
