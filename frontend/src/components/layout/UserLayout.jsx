import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { UserHeader } from './UserHeader';
import { UserSidebar } from './UserSidebar';

export const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    // On mobile screens toggle drawer open/close
    setSidebarOpen((prev) => !prev);
  };

  const toggleDesktopCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`app-container ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* User Sidebar Navigation */}
      <UserSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleDesktopCollapse}
      />

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
