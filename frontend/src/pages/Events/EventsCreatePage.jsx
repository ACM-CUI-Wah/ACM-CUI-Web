import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios";
import "./EventsCreatePage.css";


const EventCreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
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
      {/* <Navbar /> */}
      <div className="event-create-container">
        <h2 className="dashboard-title">Create Event</h2>
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="event-form">
          <label>Title</label>
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label>Content</label>
          <textarea
            placeholder="Event Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Upload Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImageChange} />

          {previewUrls.length > 0 && (
            <div className="image-preview-container">
              {previewUrls.map((url, index) => (
                <div key={index} className="image-preview-box">
                  <img src={url} alt={`preview-${index}`} className="image-preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="form-buttons">
            <button type="submit" className="btn-design">Create Event</button>
            <button type="button" className="btn-design" onClick={() => navigate("/dashboard/events")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EventCreatePage;
