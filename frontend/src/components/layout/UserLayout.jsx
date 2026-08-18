import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UserHeader } from './UserHeader';
import { UserSidebar } from './UserSidebar';

export const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-container">
      {/* Store User Sidebar Navigation */}
      <UserSidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <UserHeader onToggleSidebar={toggleSidebar} />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
