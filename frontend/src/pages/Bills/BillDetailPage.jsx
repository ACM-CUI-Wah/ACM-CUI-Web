import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../axios";
import "./CreateBill.css"; // 👈 Import the shared CSS

function BillDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  
  // State for the new/updated image file
  const [newImage, setNewImage] = useState(null);
  // State for the image preview URL (can be the existing URL or the new file URL)
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/bills/${id}/`)
      .then(res => {
        setBill(res.data);
        // Set the initial image preview to the existing bill image
        setImagePreview(res.data.image); 
      })
      .catch(err => console.error(err));
  }, [id]);
  
  // --- IMAGE HANDLERS ---
  
  /**
   * Clears the new image state and reverts the preview to the original bill image.
   */
  const removeImage = () => {
    setNewImage(null);
    // Revert preview back to the original image URL from the bill state
    setImagePreview(bill.image); 
    // Use the ID to clear the file input field visually
    const input = document.getElementById("bill-image-upload-edit");
    if (input) input.value = null;
  };

  /**
   * Handles the file input change, setting the new image file and generating a preview URL.
   */
  const handleNewImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Clear previous object URL before setting new one to avoid memory leak
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      removeImage();
    }
  };

  // --- SUBMISSION HANDLERS ---
const handleSave = async () => {
  if (!bill.description.trim() || !bill.amount || !bill.date) {
    alert("Error: All fields must be filled.");
    return;
  }

  const fd = new FormData();
  fd.append("description", bill.description);
  fd.append("amount", bill.amount); 
  fd.append("date", bill.date);

  // Only include if user selected a new image
  if (newImage) {
    fd.append("image", newImage);
  }

  try {
    await axiosInstance.patch(`/bills/${id}/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert("Bill updated successfully!");
    navigate("/dashboard/bills");
  } catch (err) {
    console.error("Failed to update bill:", err);
    alert(JSON.stringify(err.response?.data || err.message));
  }
};


  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this bill?")) {
      try {
        await axiosInstance.delete(`/bills/${id}/`);
        alert("Bill deleted successfully!");
        navigate("/dashboard/bills");
      } catch (err) {
        console.error("Failed to delete bill:", err);
        alert("Error deleting bill. See console for details.");
      }
    }
  };

  if (!bill) return <p>Loading...</p>;
  
  // Convert amount back to decimal string for display, handling null/undefined
  const displayAmount = bill.amount ? String(bill.amount) : "";


  return (
    // 💡 Apply the main wrapper class
    <div className="create-bill-wrapper"> 
      {/* 💡 Apply the form card class */}
      <div className="form-card"> 
        <h2 className="dashboard-title">Edit Bill</h2>

        <div>
          {/* Description */}
          <div className="form-group">
            <label className="custom-label">Description</label>
            <textarea
              className="custom-textarea" // 💡 Use custom-textarea
              placeholder="Enter bill details"
              value={bill.description}
              onChange={(e) => setBill({ ...bill, description: e.target.value })}
            />
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="custom-label">Amount</label>
            <input
              type="number"
              className="custom-input" // 💡 Use custom-input
              placeholder="0.00"
              // Display the amount state value (which is a string)
              value={bill.amount} 
              onChange={(e) => setBill({ ...bill, amount: e.target.value })}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="custom-label">Date</label>
            <input
              type="date"
              className="custom-input" // 💡 Use custom-input
              value={bill.date}
              onChange={(e) => setBill({ ...bill, date: e.target.value })}
            />
          </div>
          
          {/* File Input */}
          <div className="form-group">
            <label className="custom-label">Replace Image</label>
            <input
              type="file"
              id="bill-image-upload-edit" 
              accept="image/*"
              className="custom-input file-input-wrapper"
              onChange={handleNewImageChange}
            />
          </div>

          {/* IMAGE PREVIEW (Reusing the image preview logic and structure) */}
          {imagePreview && (
            <div className="image-preview-container single-image-container">
                {/* Display File Name (new file) or 'Current Image' (existing) */}
                <div className="file-name-display-bill">
                    <span className="file-name-text">
                        {newImage ? newImage.name : 'Current Image'}
                    </span>
                </div>
                
                {/* Image Box */}
                <div className="image-preview-box">
                    <img src={imagePreview} alt="Preview" className="image-preview" />
                    
                    {/* Only show remove button if it's a new, uploaded image, 
                        or if they want to clear the existing image (optional logic) */}
                    <button
                        type="button"
                        className="remove-image-btn"
                        // If newImage exists, clear newImage. Otherwise, do nothing or add logic to clear bill.image
                        onClick={removeImage} 
                        aria-label="Remove image"
                    >
                        ✕
                    </button>
                </div>
            </div>
          )}

          <div className="form-buttons"> {/* 💡 Use the custom button wrapper */}
              <button 
                  type="button" 
                  className="btn-submit btn-design" // 💡 Use btn-design for styling
                  onClick={handleSave}
              >
                  Save Changes
              </button>
              <button 
                  type="button" 
                  className="btn-submit btn-design" 
                  onClick={handleDelete}
              >
                  Delete Bill
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillDetailPage;