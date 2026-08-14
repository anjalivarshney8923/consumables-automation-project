import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  LogOut,
  ShieldCheck,
  User,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ExternalLink,
  CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getUnreadAlerts, getAlertCounts, markAlertAsRead, markAllAlertsAsRead } from '../../services/alertService';

/**
 * Top Header Navigation Bar with Interactive Procurement Alert Notification Center
 */
export const Header = ({ onToggleSidebar }) => {
  const { adminUser, logout } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = adminUser?.name || 'IOCL Administrator';
  const roleName = adminUser?.role || 'ADMIN';

  // Load alert metrics from backend
  const fetchAlertData = async () => {
    const countRes = await getAlertCounts();
    if (countRes.success && countRes.data) {
      setUnreadCount(countRes.data.unreadCount || 0);
    }
  };

  const loadAlertDetails = async () => {
    setLoading(true);
    const [alertsRes, countRes] = await Promise.all([
      getUnreadAlerts(),
      getAlertCounts()
    ]);

    if (alertsRes.success && alertsRes.data) {
      setAlerts(alertsRes.data);
    }
    if (countRes.success && countRes.data) {
      setUnreadCount(countRes.data.unreadCount || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlertData();
    // Refresh alert counts periodically every 20 seconds
    const interval = setInterval(fetchAlertData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDropdown = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadAlertDetails();
    }
  };

  const handleMarkAsRead = async (alertId, e) => {
    e.stopPropagation();
    const res = await markAlertAsRead(alertId);
    if (res.success) {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllAlertsAsRead();
    if (res.success) {
      setAlerts([]);
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

      {/* Right: Notifications Bell, User Profile Chip & Logout */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={handleToggleDropdown}
            style={{
              position: 'relative',
              background: isOpen ? '#F1F5F9' : 'transparent',
              border: '1px solid',
              borderColor: isOpen ? '#CBD5E1' : 'transparent',
              borderRadius: '8px',
              padding: '0.5rem',
              color: unreadCount > 0 ? 'var(--iocl-saffron)' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            aria-label={`Notifications (${unreadCount} unread)`}
            title={`${unreadCount} Unread Alerts`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '0.6875rem',
                  fontWeight: '700',
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  boxShadow: '0 0 0 2px #FFFFFF'
                }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '380px',
                maxWidth: '90vw',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #E2E8F0',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              {/* Dropdown Header */}
              <div
                style={{
                  padding: '0.875rem 1rem',
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={16} color="var(--iocl-navy)" />
                  <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--iocl-navy)' }}>
                    Procurement Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span
                      style={{
                        backgroundColor: '#FEE2E2',
                        color: '#DC2626',
                        fontSize: '0.6875rem',
                        fontWeight: '700',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '9999px'
                      }}
                    >
                      {unreadCount} New
                    </span>
                  )}
                </div>

                {alerts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--iocl-navy)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    title="Mark all alerts as read"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Alert Items List */}
              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.8125rem' }}>
                    Loading alerts...
                  </div>
                ) : alerts.length === 0 ? (
                  <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                    <CheckCircle2 size={32} color="#16A34A" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1E293B' }}>All Stock Levels Adequate</div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                      No active procurement threshold violations.
                    </p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: '#FFFBF6',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <AlertTriangle size={15} color="#DC2626" style={{ flexShrink: 0 }} />
                          <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: '#1E293B' }}>
                            {alert.cartridgeName}
                          </span>
                          <span
                            style={{
                              fontFamily: 'monospace',
                              fontSize: '0.6875rem',
                              backgroundColor: '#E2E8F0',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}
                          >
                            {alert.partNumber}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(alert.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748B',
                            fontSize: '0.6875rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '4px',
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                          title="Mark this alert as read"
                        >
                          Mark read
                        </button>
                      </div>

                      <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                        {alert.message}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <span style={{ color: '#DC2626', fontWeight: '600' }}>
                            Available: {alert.netAvailableQuantity}
                          </span>
                          <span style={{ color: '#64748B' }}>
                            Threshold: {alert.threshold}
                          </span>
                        </div>
                        <span style={{ color: '#94A3B8' }}>
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer Link */}
              <div
                style={{
                  padding: '0.625rem 1rem',
                  backgroundColor: '#F8FAFC',
                  borderTop: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}
              >
                <Link
                  to="/admin/thresholds"
                  onClick={() => setIsOpen(false)}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--iocl-navy)',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Sliders size={13} />
                  <span>Configure Threshold Limits</span>
                  <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          )}
        </div>

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
