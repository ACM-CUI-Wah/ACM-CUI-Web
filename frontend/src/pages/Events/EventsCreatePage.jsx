import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios";
import "./EventsCreatePage.css";


const EventCreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImages((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      alert("You must upload at least one image for the event.");
      return;
    }
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("date", date);
    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      await axiosInstance.post("/events/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/dashboard/events");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <>
      <div className="event-create-page-container">
        <div className="event-create-header">
          <h1 className="event-create-page-title">CREATE NEW EVENTS</h1>
          <p className="event-create-page-subtitle">Add a new event to Student Week</p>
        </div>

        <div className="event-details-card">
          <h2 className="event-details-heading">Event Details</h2>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="event-form-new">
            {/* Event Title */}
            <div className="form-field full-width">
              <label>Event Title <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Web Development Workshop"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Event Description */}
            <div className="form-field full-width">
              <label>Event Description</label>
              <textarea
                placeholder="Describe your event, what participants will learn or experience....."
                value={content}
                onChange={(e) => setContent(e.target.value)}
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
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Time <span className="required">*</span></label>
                <input
                  type="time"
                  placeholder="--:-- ---"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Venue */}
            <div className="form-field full-width">
              <label>Venue <span className="required">*</span></label>
              <input
                type="text"
                placeholder="e.g., Computer Science  Block Lecture Room F-09"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
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
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>Category <span className="required">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
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
              <label>Event Image<span className="required">*</span></label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="event-image"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="file-input-hidden"
                />
                <label htmlFor="event-image" className="file-upload-label">
                  <span className="file-upload-btn">Choose file</span>
                  <span className="file-upload-text">
                    {images.length > 0 ? `${images.length} file(s) selected` : 'no file choose'}
                  </span>
                </label>
              </div>

              {previewUrls.length > 0 && (
                <div className="image-preview-container-new">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="image-preview-box-new">
                      <img src={url} alt={`preview-${index}`} className="image-preview-new" />
                      <button
                        type="button"
                        className="remove-image-btn-new"
                        onClick={() => removeImage(index)}
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
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <div className="form-submit-wrapper">
              <button type="submit" className="create-event-btn">
                Create Event
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EventCreatePage;
