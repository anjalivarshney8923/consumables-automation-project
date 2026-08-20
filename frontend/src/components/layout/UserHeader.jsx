import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  User,
  ShieldCheck,
  Bell,
  ChevronDown,
  LogOut,
  Package,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const UserHeader = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute Page Title from route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/user/profile')) return 'My Profile';
    if (path.includes('/user/assets')) return 'My Assets';
    if (path.includes('/user/usage') || path.includes('/user/record-usage')) return 'Asset Usage';
    if (path.includes('/user/activity') || path.includes('/user/usage-history')) return 'My Activity';
    if (path.includes('/user/notifications')) return 'Notifications';
    return 'Dashboard';
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/user/login');
  };

  return (
    <header className="app-header">
      {/* Left side: Hamburger Toggle & Title */}
      <div className="header-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-block">
          <span className="header-subtitle">Indian Oil Corporation Limited</span>
          <h2 className="header-title">{getPageTitle()}</h2>
        </div>
      </div>

      {/* Right side: Notification Icon + User Profile Dropdown */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notification Bell Icon */}
        <Link
          to="/user/notifications"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
            textDecoration: 'none',
            position: 'relative',
            transition: 'all 0.15s ease'
          }}
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </Link>

        {/* User Role Badge */}
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: '800',
            backgroundColor: '#EFF6FF',
            color: '#1E40AF',
            border: '1px solid #BFDBFE',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <ShieldCheck size={12} />
          USER
        </span>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              color: 'inherit'
            }}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: 'var(--iocl-navy)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700'
              }}
            >
              {user?.fullName
                ? user.fullName.substring(0, 2).toUpperCase()
                : (user?.username ? user.username.substring(0, 2).toUpperCase() : 'U')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1E293B', lineHeight: '1.2' }}>
                {user?.fullName || user?.username || 'User Account'}
              </span>
              <span style={{ fontSize: '0.625rem', color: '#64748B' }}>
                {user?.email || 'user@iocl.co.in'}
              </span>
            </div>
            <ChevronDown size={14} color="#64748B" style={{ marginLeft: '0.25rem' }} />
          </button>

          {/* Dropdown Menu Modal */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '230px',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
                padding: '0.5rem 0',
                zIndex: 1000
              }}
            >
              <div style={{ padding: '0.625rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#1E293B' }}>
                  {user?.fullName || user?.username || 'User'}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#64748B', wordBreak: 'break-all' }}>
                  {user?.email || 'user@iocl.co.in'}
                </div>
              </div>

              <Link
                to="/user/profile"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#334155',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={15} color="var(--iocl-navy)" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/user/assets"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#334155',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Package size={15} color="var(--iocl-navy)" />
                <span>My Assets</span>
              </Link>

              <Link
                to="/user/notifications"
                onClick={() => setDropdownOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#334155',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Bell size={15} color="var(--iocl-navy)" />
                <span>Notifications</span>
              </Link>

              <div style={{ borderTop: '1px solid #F1F5F9', margin: '0.375rem 0' }} />

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.625rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.8125rem',
                  color: '#DC2626',
                  backgroundColor: 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FEF2F2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={15} color="#DC2626" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
