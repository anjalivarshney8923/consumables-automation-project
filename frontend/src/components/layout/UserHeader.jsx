import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  User,
  ShieldCheck,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IndianOilLogo } from '../branding/IndianOilLogo';

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
    if (path.includes('/user/usage') || path.includes('/user/record-usage')) return 'Asset Usage';
    if (path.includes('/user/asset-history') || path.includes('/user/usage-history')) return 'Asset Usage History';
    if (path.includes('/user/activity')) return 'My Activity';
    return 'Dashboard';
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/user/login');
  };

  return (
    <header
      className="app-header"
      style={{
        height: '68px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle, #E2E8F0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
      }}
    >
      {/* Left side: Hamburger Toggle & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <IndianOilLogo size={16} alt="Indian Oil Corporation Limited" />
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                color: 'var(--text-muted, #64748B)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              Indian Oil Corporation Limited
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.125rem',
              fontWeight: '800',
              color: 'var(--text-primary, #0F172A)',
              margin: 0,
              letterSpacing: '-0.01em',
              lineHeight: '1.2'
            }}
          >
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side: User Badge & Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        {/* User Role Badge */}
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: '800',
            backgroundColor: '#EFF6FF',
            color: '#1D4ED8',
            border: '1px solid #BFDBFE',
            padding: '0.25rem 0.625rem',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            letterSpacing: '0.04em'
          }}
        >
          <ShieldCheck size={13} />
          USER
        </span>

        {/* User Profile Area */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.3rem 0.625rem',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle, #E2E8F0)',
              cursor: 'pointer',
              color: 'inherit',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {/* User Avatar */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--iocl-navy, #002D62)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: '700',
                flexShrink: 0
              }}
            >
              {user?.fullName
                ? user.fullName.substring(0, 2).toUpperCase()
                : (user?.username ? user.username.substring(0, 2).toUpperCase() : 'U')}
            </div>

            {/* User Name & Email */}
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="header-user-meta">
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--text-primary, #0F172A)',
                  lineHeight: '1.2'
                }}
              >
                {user?.fullName || user?.username || 'User Account'}
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: 'var(--text-muted, #64748B)',
                  maxWidth: '160px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {user?.email || 'user@iocl.co.in'}
              </span>
            </div>

            <ChevronDown size={14} color="#64748B" style={{ marginLeft: '0.15rem' }} />
          </button>

          {/* Dropdown Menu Modal */}
          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '230px',
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle, #E2E8F0)',
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

export default UserHeader;
