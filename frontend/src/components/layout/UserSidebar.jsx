import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  ClipboardEdit,
  History,
  LogOut,
  X,
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
      label: 'Asset Usage',
      path: '/user/usage',
      icon: ClipboardEdit
    },
    {
      label: 'Asset History',
      path: '/user/asset-history',
      icon: History
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
        <div className="sidebar-header sidebar-brand-header">
          <IoclBrand
            theme="light"
            size={isCollapsed ? "sm" : "md"}
            subtitle={isCollapsed ? "" : "User Portal"}
          />
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav" style={{ flex: 1, overflowY: 'auto' }}>
          {!isCollapsed && (
            <div className="nav-section-title">
              OPERATIONS & PORTAL
            </div>
          )}
          <ul className="nav-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/user/dashboard' && location.pathname.startsWith(item.path));

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                    title={isCollapsed ? item.label : undefined}
                    style={{
                      height: '46px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      padding: isCollapsed ? '0' : '0 1rem',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      borderRadius: '8px'
                    }}
                  >
                    <Icon size={18} className="nav-item-icon" />
                    {!isCollapsed && (
                      <span className="nav-item-text" style={{ fontSize: '0.875rem', fontWeight: isActive ? '700' : '500' }}>
                        {item.label}
                      </span>
                    )}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
            <div
              className="user-avatar"
              style={{
                backgroundColor: 'var(--iocl-red, #B71C1C)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {user?.fullName
                ? user.fullName.substring(0, 2).toUpperCase()
                : (user?.username ? user.username.substring(0, 2).toUpperCase() : 'U')}
            </div>
            {!isCollapsed && (
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#FFFFFF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: '1.2'
                  }}
                >
                  {user?.fullName || user?.username || 'User'}
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'rgba(255, 255, 255, 0.55)', letterSpacing: '0.02em' }}>
                  IOCL Internal Portal
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
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.65)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;
