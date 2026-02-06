import React, { useState, useEffect } from 'react';
import Navbar from '../../components/DashboardNavbar/Navbar';
import Sidebar from '../../components/dashboard/Sidebar';
import { Outlet } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard-page">
      <Navbar onMenuClick={toggleSidebar} showMenuButton={isMobile} />

      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${isMobile ? (sidebarOpen ? 'open' : 'closed') : ''}`}>
          <Sidebar onNavigate={closeSidebar} />
        </aside>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={closeSidebar} />
        )}

        {/* Main content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
