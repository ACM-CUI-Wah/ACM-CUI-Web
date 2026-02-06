import React from 'react'
import BlogBanner from '../../components/Blogs/BlogBanner'
import BlogGrid from '../../components/Blogs/BlogGrid'

import Navbar from '../../components/DashboardNavbar/Navbar'
import useAuthStore from '../../store/authStore' 

const AdminBlogPage = () => {
  const { user_id, role } = useAuthStore(); 

  return (
    <>
      {/* <Navbar/> */}
      <div>
        <h2 className="mt-5 text-center">ACM CUI WAH BLOGS</h2>
        <p className="text-center" style={{fontSize:'20px'}}>Home</p>
      </div>
      <BlogBanner/>
    
      <BlogGrid userId={user_id} userRole={role} />
    
    </>
  )
}

export default AdminBlogPage
