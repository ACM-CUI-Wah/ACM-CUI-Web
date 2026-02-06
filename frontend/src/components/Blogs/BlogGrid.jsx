import React, { useEffect, useState } from "react";
import BlogCard from "./BlogCard";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container, Row, Col, Button } from "react-bootstrap";
import axiosInstance from "../../axios"; 
import useAuthStore from "../../store/authStore.js";

const BlogGrid = ({ userId = null, userRole, filterByUser = false, blogListing = false }) => {
  const { user_id } = useAuthStore(); 
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        
        // Fetch blogs (public endpoint)
        const blogsRes = await axiosInstance.get("/blogs/"); 
        const blogsData = blogsRes.data;

        // Fetch public students (no auth required)
        let students = [];
        try {
          const studentsRes = await axiosInstance.get("/students/public/"); 
          students = Array.isArray(studentsRes.data)
            ? studentsRes.data
            : [studentsRes.data];
        } catch (err) {
          console.warn("Could not fetch public students:", err);
          // Continue without student data
        }

        const mappedBlogs = blogsData.map((blog) => {
          // Match student by user_id
          const authorProfile = students.find(
            (s) => s.user_id === blog.created_by.id
          );

          return {
            id: blog.id,
            title: blog.title,
            author: blog.createdBy || "Unknown",
            authorId: blog.created_by.id || blog.user,
            date: new Date(blog.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            tag: "General",
            image: blog.images?.length > 0 ? blog.images[0].image_url : null,
            authorImg: authorProfile?.profile_pic || null,
            authorName: authorProfile?.full_name || blog.createdBy || "Unknown",
          };
        });

        const filteredBlogs = filterByUser && user_id
          ? mappedBlogs.filter((b) => String(b.authorId) === String(user_id))
          : mappedBlogs;

        setBlogs(filteredBlogs);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to load blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [filterByUser, user_id]);

  const handleDeleteBlog = (deletedId) => {
    setBlogs((prev) => prev.filter((b) => b.id !== deletedId));
  };

  const handleLoadMore = () => setVisibleCount((prev) => prev + 12);

  if (loading) return <p>Loading blogs...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (blogs.length === 0) return <p>No blogs found.</p>;

  return (
    <div className="my-4">
      <Row className="justify-content-center g-4">
        {blogs.slice(0, visibleCount).map((blog) => (
          <Col key={blog.id} xs={11} sm={6} md={4} lg={4} xl={3}>
            <BlogCard
              {...blog}
              role={userRole}
              currentUserId={user_id}
              onDelete={handleDeleteBlog}
              blogListing={blogListing}
            />
          </Col>
        ))}
      </Row>

      {visibleCount < blogs.length && (
        <div className="text-center mt-4">
          <Button onClick={handleLoadMore} variant="primary">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogGrid;