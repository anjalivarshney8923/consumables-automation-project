import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { UserHeader } from './UserHeader';
import { UserSidebar } from './UserSidebar';

export const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('iocl_user_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebar = () => {
    if (window.innerWidth > 1024) {
      setIsCollapsed((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('iocl_user_sidebar_collapsed', String(next));
        } catch {
          // Ignore localStorage errors
        }
        return next;
      });
    } else {
      setSidebarOpen((prev) => !prev);
    }
  };

  const toggleDesktopCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('iocl_user_sidebar_collapsed', String(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
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
        <UserHeader
          onToggleSidebar={handleToggleSidebar}
          isCollapsed={isCollapsed}
        />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
