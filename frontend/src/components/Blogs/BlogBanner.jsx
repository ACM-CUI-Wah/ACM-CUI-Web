import React, { useState, useEffect } from "react";
import './BlogBanner.css';

import axiosInstance from '../../axios';

const BlogBanner = () => {
  const [featuredBlog, setFeaturedBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/blogs/');

        // Get the first blog as featured or the most recent one
        if (response.data && response.data.length > 0) {
          setFeaturedBlog(response.data[0]);
        }
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get background image - use blog image if available, otherwise default
  const getBackgroundImage = () => {
    if (featuredBlog?.images && featuredBlog.images.length > 0) {
      return featuredBlog.images[0].image_url;
    }
    return bgImage;
  };

  if (loading) {
    return (
      <div className="blog-banner-wrapper position-relative text-white d-flex align-items-center justify-content-center mx-5"
        style={{ height: '450px', backgroundColor: '#333', borderRadius: '8px' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !featuredBlog) {
    return (
      <div className="blog-banner-wrapper position-relative text-white d-flex align-items-center justify-content-center mx-5"
        style={{ height: '450px', backgroundColor: '#333', borderRadius: '8px' }}>
        <p>{error || 'No blogs available'}</p>
      </div>
    );
  }

  // Inside the return of BlogBanner
  return (
    <div
      className="blog-banner-wrapper position-relative text-white d-flex align-items-end"
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        opacity: 0.9,
        borderRadius: '12px', 
      }}
    >
      <div className="blog-banner-overlay w-100 h-100 position-absolute top-0 start-0"></div>

      <div className="container position-relative z-2 py-5 px-4">
        <span className="badge bg-primary mb-2 px-3">Technology</span>

        <h1 className="blog-banner-title fw-bold mb-3">
          {featuredBlog.title}
        </h1>

        <div className="d-flex align-items-center gap-3 blog-banner-meta">
          {/* Add author image if available */}
          {featuredBlog.authorImg && (
            <img src={featuredBlog.authorImg} alt="Author" className="blog-author-img" />
          )}
          <span className="fw-semibold">{featuredBlog.authorName || 'Anonymous'}</span>
          <span className="opacity-75">{formatDate(featuredBlog.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default BlogBanner;