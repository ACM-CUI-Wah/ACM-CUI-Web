  
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./BlogCard.css";
import { Link, useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTrash } from "react-icons/fa";

import axiosInstance from "../../axios";

const BlogCard = ({
  id,
  title,
  author,
  date,
  tag,
  image,
  authorImg,
  role,
  currentUserId,
  authorId,
  onDelete,

}) => {
  const navigate = useNavigate();



  const canEdit = role != "ADMIN" && (String(currentUserId) === String(authorId));
  console.log(canEdit)
  const canDelete = role === "ADMIN";

  const handleEdit = (e) => {
    e.preventDefault();
    navigate(`/blogs/${id}/edit`);
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await axiosInstance.delete(`/blogs/${id}/delete/`);
      alert("Blog deleted successfully!");
      if (onDelete) onDelete(id);
    } catch (err) {
      console.error("Delete failed:", err.response || err);
      alert(err.response?.data?.message || "Failed to delete blog. You may not have permission.");
    }
  };

  return (
    <Link to={`/blog/${id}`} style={{ textDecoration: "none" }}>
      <div className="blogCard-wrapper">
        <div className="blogCard-container border container">
          <div className="blog-img-container py-3">
            <img
              src={image}
              alt="Blog"
              className="blog-image img-fluid"
            />
          </div>

          <div className="blog-tag">
            <span className="tag-text">{tag}</span>
          </div>

          <div className="blog-title1 pt-2">
            <h2 className="blog-title-text1" style={{ fontSize: "1rem" }}>
              {title}
            </h2>
          </div>

          <div className="d-flex pt-3 flex-row align-items-center justify-content-start bottom w-100">
            <span className="d-flex blog-author-pfp">
              <img
                src={authorImg}
                alt="Author"
                className="author-image img-fluid"
              />
            </span>
            <span className="d-flex pt-1 ps-3 blog-author-name" style={{ fontSize: "0.8rem" }}>
              {author}
            </span>
            <span className="d-flex pt-1 ps-3 blog-date" style={{ fontSize: "0.8rem" }}>
              {date}
            </span>

            <span className="ms-auto d-flex gap-2">
              {canEdit && <FaPencilAlt onClick={handleEdit} style={{ cursor: "pointer" }} />}
              {canDelete && <FaTrash onClick={handleDelete} style={{ cursor: "pointer", color: "red" }} />}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
