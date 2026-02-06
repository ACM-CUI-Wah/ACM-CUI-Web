import React from "react";
import Navbar from "../../components/DashboardNavbar/Navbar.jsx";

import BlogGrid from "../../components/Blogs/BlogGrid.jsx";
import useAuthStore from "../../store/authStore.js";
import BlogOwner from "../../components/Blogs/blogowner.jsx";


const MyBlogPage = () => {
  const { user_id, role } = useAuthStore();

  return (
    <div>


      <div className="container mt-4">
        <BlogOwner />
        <h2>My Blogs</h2>
        <BlogGrid
          userId={user_id}
          userRole={role}
          filterByUser={true}
          blogListing={false}
        />
      </div>

    </div>
  );
};

export default MyBlogPage;
