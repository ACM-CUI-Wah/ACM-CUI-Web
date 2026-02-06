import { useState } from "react";
import axiosInstance from "../../axios";
import "./CreateBill.css";
import { useNavigate } from "react-router-dom";

function CreateBillPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    description: "",
    amount: "",
    date: "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Frontend validation matching backend constraints
   */
  const validateForm = () => {
    const newErrors = {};

    // Description validation (max 200 chars, required)
    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    } else if (form.description.trim().length > 200) {
      newErrors.description = "Description cannot exceed 200 characters";
    }

    // Amount validation (required, must be > 0, max 8 digits before decimal)
    if (!form.amount) {
      newErrors.amount = "Amount is required";
    } else {
      const amount = parseFloat(form.amount);
      if (isNaN(amount)) {
        newErrors.amount = "Amount must be a valid number";
      } else if (amount < 0) {
        newErrors.amount = "Amount must be a positive number (MinValueValidator)";
      } else if (amount > 99999999.99) {
        newErrors.amount = "Amount cannot exceed 99,999,999.99";
      }
    }

    // Date validation (required, must be valid date)
    if (!form.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(form.date);
      if (isNaN(selectedDate.getTime())) {
        newErrors.date = "Invalid date format";
      }
    }

    // Image validation (optional but check file size if provided)
    if (image) {
      const maxSizeInMB = 5; // Adjust based on your backend settings
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (image.size > maxSizeInBytes) {
        newErrors.image = `Image size must be less than ${maxSizeInMB}MB`;
      }
      if (!image.type.startsWith("image/")) {
        newErrors.image = "File must be a valid image";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maps backend error response to user-friendly messages
   */
  const parseBackendErrors = (errorData) => {
    const backendErrors = {};

    if (typeof errorData === "object") {
      // Handle field-specific errors from Django REST Framework
      if (errorData.description) {
        backendErrors.description = Array.isArray(errorData.description)
          ? errorData.description[0]
          : errorData.description;
      }
      if (errorData.amount) {
        backendErrors.amount = Array.isArray(errorData.amount)
          ? errorData.amount[0]
          : errorData.amount;
      }
      if (errorData.date) {
        backendErrors.date = Array.isArray(errorData.date)
          ? errorData.date[0]
          : errorData.date;
      }
      if (errorData.image) {
        backendErrors.image = Array.isArray(errorData.image)
          ? errorData.image[0]
          : errorData.image;
      }
      // General non-field errors
      if (errorData.detail) {
        backendErrors.general = errorData.detail;
      }
      if (errorData.non_field_errors) {
        backendErrors.general = Array.isArray(errorData.non_field_errors)
          ? errorData.non_field_errors[0]
          : errorData.non_field_errors;
      }
    }

    return backendErrors;
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (errors.image) {
      setErrors({ ...errors, image: "" });
    }
    const input = document.getElementById("bill-image-upload");
    if (input) input.value = null;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear previous URL to avoid memory leak
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      // Clear image error if user selects new image
      if (errors.image) {
        setErrors({ ...errors, image: "" });
      }
    } else {
      removeImage();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // 1. Frontend validation
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const fd = new FormData();
    fd.append("description", form.description.trim());
    fd.append("amount", form.amount);
    fd.append("date", form.date);

    if (image) {
      fd.append("image", image);
    }

    try {
      await axiosInstance.post("/bills/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("✓ Bill added successfully!");
      setForm({ description: "", amount: "", date: "" });
      removeImage();
      navigate("/dashboard/bills");
    } catch (err) {
      console.error("Failed to upload bill:", err);

      // 2. Parse and handle backend errors
      if (err.response?.data) {
        const backendErrors = parseBackendErrors(err.response.data);
        setErrors(backendErrors);

        // Show user-friendly error alert
        const errorMessages = Object.values(backendErrors)
          .filter(msg => msg)
          .join("\n");
        if (errorMessages) {
          alert(`Error:\n\n${errorMessages}`);
        }
      } else if (err.request) {
        // Network error
        setErrors({
          general: "Network error. Please check your connection and try again.",
        });
        alert("Network error. Please check your connection and try again.");
      } else {
        // Other errors
        setErrors({
          general: err.message || "An unexpected error occurred",
        });
        alert(`Error: ${err.message || "An unexpected error occurred"}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-bill-wrapper">
      <div className="form-card">
        <h2 className="dashboard-title">Create Bill</h2>

        {/* General error message */}
        {errors.general && (
          <div className="alert alert-danger" role="alert">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Description */}
          <div className="form-group">
            <label className="custom-label">
              Description
              <span className="char-count">
                ({form.description.length}/200)
              </span>
            </label>
            <textarea
              className={`custom-textarea ${errors.description ? "is-invalid" : ""}`}
              placeholder="Enter bill details"
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                if (errors.description) {
                  setErrors({ ...errors, description: "" });
                }
              }}
              maxLength="200"
            />
            {errors.description && (
              <small className="text-danger">{errors.description}</small>
            )}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="custom-label">Amount</label>
            <input
              type="number"
              className={`custom-input ${errors.amount ? "is-invalid" : ""}`}
              placeholder="0.00"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) => {
                setForm({ ...form, amount: e.target.value });
                if (errors.amount) {
                  setErrors({ ...errors, amount: "" });
                }
              }}
            />
            {errors.amount && (
              <small className="text-danger">{errors.amount}</small>
            )}
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="custom-label">Date</label>
            <input
              type="date"
              className={`custom-input ${errors.date ? "is-invalid" : ""}`}
              value={form.date}
              onChange={(e) => {
                setForm({ ...form, date: e.target.value });
                if (errors.date) {
                  setErrors({ ...errors, date: "" });
                }
              }}
            />
            {errors.date && (
              <small className="text-danger">{errors.date}</small>
            )}
          </div>

          {/* File Input */}
          <div className="form-group">
            <label className="custom-label">Upload Image</label>
            <input
              type="file"
              id="bill-image-upload"
              accept="image/*"
              className={`custom-input file-input-wrapper ${
                errors.image ? "is-invalid" : ""
              }`}
              onChange={handleImageChange}
            />
            {errors.image && (
              <small className="text-danger">{errors.image}</small>
            )}
          </div>

          {/* IMAGE PREVIEW */}
          {imagePreview && (
            <div className="image-preview-container single-image-container">
              <div className="file-name-display-bill">
                <span className="file-name-text">{image?.name}</span>
              </div>

              <div className="image-preview-box">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Bill"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateBillPage;