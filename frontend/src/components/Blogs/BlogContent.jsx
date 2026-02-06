import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./BlogContent.css";

const BlogContent = () => {
  const { id } = useParams(); // get blog id from route
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:8000/api/blogs/");
        // find blog by id
        const foundBlog = res.data.find((b) => String(b.id) === id);
        if (foundBlog) {
          setBlog(foundBlog);
        } else {
          setError("Blog not found");
        }
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) return <p>Loading blog...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!blog) return null;

  return (
    <div className="container my-5 mx-9">
      <div className="blog-tag mb-3">
        <span className="tag-text">{blog.tag || "General"}</span>
      </div>

      <h1 className="blog-title-text">{blog.title}</h1>

      <div className="flex align-items-center justify-content-start my-3">
        {blog.authorImg && (
          <img
            src={blog.authorImg}
            alt="Author"
            className="author-image img-fluid rounded-circle"
            style={{ width: "40px", height: "40px" }}
          />
        )}
        <span className="mx-1">
          {blog.createdBy || "Unknown"}
          <span className="mx-3">
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </span>
      </div>

      {blog.images?.length > 0 && (
        <img
          src={blog.images[0].image_url || blog.images[0]}
          alt="Featured"
          className="img-fluid rounded mb-4"
          style={{ maxHeight: "350px", width: "100%", objectFit: "cover" }}
        />
      )}

  
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </div>
  );
};

export default BlogContent;
