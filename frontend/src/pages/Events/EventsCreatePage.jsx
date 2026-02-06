import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../axios";
import "./EventsCreatePage.css";


const EventCreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [about, setAbout] = useState("");
  const [speakers, setSpeakers] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch event types on component mount
  useEffect(() => {
    fetchEventTypes();
  }, []);

  const fetchEventTypes = async () => {
    try {
      const res = await axiosInstance.get("/events/types/");
      setEventTypes(res.data);
    } catch (error) {
      console.error("Error fetching event types:", error);
      // Fallback to default categories if API fails
      setEventTypes([
        { id: 1, type: "WORKSHOP" },
        { id: 2, type: "SEMINAR" },
        { id: 3, type: "COMPETITION" },
        { id: 4, type: "NETWORKING" },
      ]);
    }
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("You must upload an image for the event.");
      return;
    }

    if (!category) {
      alert("Please select an event category.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("description", about); // Map 'about' to 'description'
    formData.append("date", date);
    formData.append("time_from", startTime); // Map 'startTime' to 'time_from'
    formData.append("time_to", endTime); // Map 'endTime' to 'time_to'
    formData.append("location", venue); // Map 'venue' to 'location'
    formData.append("total_seats", capacity); // Map 'capacity' to 'total_seats'
    formData.append("event_type", category); // Event type ID
    formData.append("image", image);

    // Convert comma-separated speakers to hosts array
    if (speakers.trim()) {
      const hostsArray = speakers.split(",").map(s => s.trim()).filter(s => s);
      formData.append("hosts", JSON.stringify(hostsArray));
    }

    // Convert comma-separated tags to array
    if (tags.trim()) {
      const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t);
      formData.append("tags", JSON.stringify(tagsArray));
    }

    try {
      await axiosInstance.post("/events/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Event created successfully!");
      navigate("/dashboard/events-list");
    } catch (error) {
      console.error("Error creating event:", error.response?.data || error.message);
      alert("Failed to create event. Please check all fields and try again.");
    } finally {
      setLoading(false);
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

            {/* About */}
            <div className="form-field full-width">
              <label>About</label>
              <textarea
                placeholder="Provide detailed information about the event, agenda, what to expect..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows="4"
              />
            </div>

            {/* Speakers */}
            <div className="form-field full-width">
              <label>Speakers</label>
              <textarea
                placeholder="List the speakers/presenters for this event (e.g., John Doe - Software Engineer at Google, Jane Smith - Data Scientist)"
                value={speakers}
                onChange={(e) => setSpeakers(e.target.value)}
                rows="3"
              />
            </div>

            {/* Date Row */}
            <div className="form-field full-width">
              <label>Date<span className="required">*</span></label>
              <input
                type="date"
                placeholder="mm/dd/yyyy"
                value={date}
                onChange={(e) => setDate(e.target.value)}
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
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <label>End Time <span className="required">*</span></label>
                <input
                  type="time"
                  placeholder="--:-- ---"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
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
                  {eventTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type}
                    </option>
                  ))}
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
                  onChange={handleImageChange}
                  className="file-input-hidden"
                />
                <label htmlFor="event-image" className="file-upload-label">
                  <span className="file-upload-btn">Choose file</span>
                  <span className="file-upload-text">
                    {image ? image.name : 'no file chosen'}
                  </span>
                </label>
              </div>

              {previewUrl && (
                <div className="image-preview-container-new">
                  <div className="image-preview-box-new">
                    <img src={previewUrl} alt="preview" className="image-preview-new" />
                    <button
                      type="button"
                      className="remove-image-btn-new"
                      onClick={removeImage}
                    >
                      ✕
                    </button>
                  </div>
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
              <button type="submit" className="create-event-btn" disabled={loading}>
                {loading ? "Creating Event..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EventCreatePage;
