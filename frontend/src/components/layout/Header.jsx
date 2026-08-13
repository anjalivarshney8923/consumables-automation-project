import React from 'react';
import { Menu, LogOut, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Top Header Navigation Bar
 */
export const Header = ({ onToggleSidebar }) => {
  const { adminUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const displayName = adminUser?.name || 'IOCL Administrator';
  const roleName = adminUser?.role || 'ADMIN';

  return (
    <header className="app-header">
      {/* Left: Mobile Sidebar Toggle + Page Section Indicator */}
      <div className="header-left">
        <button
          type="button"
          className="header-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
            Admin Portal
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Consumables & Procurement Management System
          </span>
        </div>
      </div>

      {/* Right: User Profile Chip & Logout */}
      <div className="header-right">
        {/* User Info Chip */}
        <div className="user-profile-chip" title={`Logged in as ${displayName}`}>
          <div className="user-avatar" aria-hidden="true">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role-badge">
              <ShieldCheck size={10} style={{ display: 'inline', marginRight: '2px' }} />
              {roleName}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="btn-logout"
          onClick={handleLogout}
          aria-label="Sign out of Admin Portal"
          title="Sign out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
