import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Package,
  ClipboardEdit,
  History,
  Bell,
  LogOut,
  X,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { IoclBrand } from '../branding/IoclBrand';
import { useAuth } from '../../context/AuthContext';

export const UserSidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/user/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'My Profile',
      path: '/user/profile',
      icon: User
    },
    {
      label: 'My Assets',
      path: '/user/assets',
      icon: Package
    },
    {
      label: 'Asset Usage',
      path: '/user/usage',
      icon: ClipboardEdit
    },
    {
      label: 'Asset History',
      path: '/user/asset-history',
      icon: History
    },
    {
      label: 'Notifications',
      path: '/user/notifications',
      icon: Bell
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/user/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`app-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
        aria-label="User Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <IoclBrand
            size={isCollapsed ? "sm" : "md"}
            subtitle={isCollapsed ? "" : "User Portal"}
          />
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Portal Identifier Badge */}
        {!isCollapsed && (
          <div style={{ padding: '0.75rem 1.25rem 0.25rem' }}>
            <div
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <UserCheck size={14} color="var(--iocl-saffron)" />
              <span style={{ fontSize: '0.6875rem', fontWeight: '800', color: '#CBD5E1', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                USER PORTAL
              </span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav-menu" style={{ flex: 1, overflowY: 'auto' }}>
          {!isCollapsed && <div className="nav-section-label">Operations & Portal</div>}
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/user/dashboard' && location.pathname.startsWith(item.path));

              return (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Toggle Button (Desktop) */}
        {onToggleCollapse && (
          <div
            style={{
              padding: '0.5rem 1.25rem',
              display: 'none',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            className="sidebar-collapse-wrapper"
          >
            <button
              type="button"
              onClick={onToggleCollapse}
              style={{
                width: '100%',
                padding: '0.4rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#CBD5E1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Collapse</span></>}
            </button>
          </div>
        )}

        {/* User Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div
              className="user-avatar"
              style={{ backgroundColor: 'var(--iocl-saffron)' }}
            >
              {user?.fullName
                ? user.fullName.substring(0, 2).toUpperCase()
                : (user?.username ? user.username.substring(0, 2).toUpperCase() : 'U')}
            </div>
            {!isCollapsed && (
              <div className="user-info">
                <span className="user-name">{user?.fullName || user?.username || 'User Account'}</span>
                <span className="user-role" style={{ color: 'var(--iocl-saffron)' }}>
                  {user?.department || 'USER'}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out of User Portal"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
