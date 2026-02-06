import React from 'react'
import { useLocation } from 'react-router-dom'
import BlogBanner from '../../components/Blogs/BlogBanner'
import BlogGrid from '../../components/Blogs/BlogGrid'
import Navbar from '../../components/DashboardNavbar/Navbar'

import useAuthStore from '../../store/authStore'

const BlogListingPage = () => {
  const { role } = useAuthStore()
  const location = useLocation()
  const shouldShowNavbar = location.pathname === '/blogs'

  return (
    <div className="blog-listing-page-wrapper">
      <Navbar/>
      
      {/* Wrap everything in a standard container for centered layout */}
      <div className="container mt-5">
        <div className="text-center mb-4">
          <h2 className="fw-bold" style={{fontSize: '32px', letterSpacing: '1px'}}>
            ACM CUI WAH BLOGS
          </h2>
          <p className="text-muted" style={{fontSize:'16px'}}>Home</p>
        </div>

        <BlogBanner />

        <div className="mt-5">
          <BlogGrid
            userRole={role}
            filterByUser={false}
            blogListing={true}
          />
        </div>
      </div>
    </div>
  )
}
export default BlogListingPage