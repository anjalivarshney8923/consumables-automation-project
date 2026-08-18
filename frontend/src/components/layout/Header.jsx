import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  LogOut,
  Shield,
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
 * Visual design matching IOCL enterprise brand identity
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
      {/* Left: Mobile Sidebar Toggle + Portal Indicator */}
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

        <div className="header-title-block">
          <span className="header-portal-title">
            Admin Portal
          </span>
          <span className="header-portal-subtitle">
            Consumables & Procurement Management System
          </span>
        </div>
      </div>

      {/* Right: Notifications Bell, User Profile Chip & Logout */}
      <div className="header-right">
        {/* Notification Bell with Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            className="header-bell-btn"
            onClick={handleToggleDropdown}
            aria-label={`Notifications (${unreadCount} unread)`}
            title={`${unreadCount} Unread Alerts`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="header-bell-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="notification-dropdown">
              {/* Dropdown Header */}
              <div className="notification-dropdown-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={16} color="var(--iocl-navy)" />
                  <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--iocl-navy)' }}>
                    Procurement Alerts
                  </span>
                  {unreadCount > 0 && (
                    <span className="notification-count-pill">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                {alerts.length > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="btn-mark-all-read"
                    title="Mark all alerts as read"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Alert Items List */}
              <div className="notification-items-list">
                {loading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.8125rem' }}>
                    Loading alerts...
                  </div>
                ) : alerts.length === 0 ? (
                  <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                    <CheckCircle2 size={32} color="#16A34A" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontWeight: '700', fontSize: '0.875rem', color: '#1E293B' }}>All Stock Levels Adequate</div>
                    <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.25rem' }}>
                      No active procurement threshold violations.
                    </p>
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const isUrgent = alert.severity === 'URGENT' || alert.alertType === 'TENDERING_REQUIRED';

                    return (
                      <div
                        key={alert.id}
                        className={`notification-item-row ${isUrgent ? 'urgent' : 'warning'}`}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                            <AlertTriangle size={15} color={isUrgent ? '#E30613' : '#F58220'} style={{ flexShrink: 0 }} />
                            {isUrgent && (
                              <span className="alert-badge-urgent">
                                URGENT
                              </span>
                            )}
                            <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: '#0F172A' }}>
                              {alert.cartridgeName}
                            </span>
                            <span className="part-number-chip">
                              {alert.partNumber}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleMarkAsRead(alert.id, e)}
                            className="btn-mark-item-read"
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
                            <span style={{ color: isUrgent ? '#E30613' : '#EA580C', fontWeight: '700' }}>
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
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer Link */}
              <div className="notification-dropdown-footer">
                <Link
                  to="/admin/thresholds"
                  onClick={() => setIsOpen(false)}
                  className="notification-footer-link"
                >
                  <Sliders size={13} />
                  <span>Configure Threshold Limits</span>
                  <ExternalLink size={11} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Info Profile Chip */}
        <div className="user-profile-chip" title={`Logged in as ${displayName}`}>
          <div className="user-avatar" aria-hidden="true">
            <User size={16} />
          </div>
          <div className="user-info">
            <span className="user-name">{displayName}</span>
            <div className="user-role-badge">
              <Shield size={11} className="role-shield-icon" />
              <span>{roleName}</span>
            </div>
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
          <LogOut size={15} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

