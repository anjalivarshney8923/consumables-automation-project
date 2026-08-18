import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardEdit,
  History,
  Package,
  LogOut,
  X,
  UserCheck
} from 'lucide-react';
import { IoclBrand } from '../branding/IoclBrand';

export const UserSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/user/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Record Usage',
      path: '/user/record-usage',
      icon: ClipboardEdit
    },
    {
      label: 'Usage History',
      path: '/user/usage-history',
      icon: History
    },
    {
      label: 'My Assigned POs',
      path: '/user/assigned-pos',
      icon: Package
    }
  ];

  const handleLogout = () => {
    // Clear any frontend-only session state and redirect to user login
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
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
        aria-label="User Navigation"
      >
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <IoclBrand
            size="md"
            subtitle="Consumables & Store Portal"
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
              STORE / USER PORTAL
            </span>
          </div>
        </div>

        {/* Navigation Navigation Menu */}
        <nav className="sidebar-nav-menu">
          <div className="nav-section-label">Store Operations</div>
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
                  >
                    <Icon size={18} className="nav-icon" />
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-badge">
            <div
              className="user-avatar"
              style={{ backgroundColor: 'var(--iocl-saffron)' }}
            >
              SU
            </div>
            <div className="user-info">
              <span className="user-name">Store Keeper</span>
              <span className="user-role" style={{ color: 'var(--iocl-saffron)' }}>STORE USER</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
            title="Sign out of Store Portal"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
