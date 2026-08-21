import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Clock,
  ClipboardEdit,
  History,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Zap,
  Clock3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserDashboardData } from '../../services/userService';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async (isUserRefresh = false) => {
    if (isUserRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getUserDashboardData();
      if (res.success && res.data) {
        setDashboardData(res.data);
      } else {
        setError(res.message || 'Unable to load dashboard data from server.');
      }
    } catch {
      setError('Unable to connect to backend server. Please verify Spring Boot is running.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Resolved user display name from real backend dashboard response or auth context
  const resolvedName = dashboardData?.userName || user?.fullName || user?.name || user?.username || 'User';

  // Format date helper
  const formatDate = (val) => {
    if (!val) return '—';
    try {
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [year, month, day] = val.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
      }
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return String(val);
    }
  };

  // Get colour badge class helper
  const getColourBadgeClass = (colour) => {
    if (!colour) return 'colour-badge colour-badge-black';
    const c = colour.toUpperCase();
    if (c === 'CYAN') return 'colour-badge colour-badge-cyan';
    if (c === 'MAGENTA') return 'colour-badge colour-badge-magenta';
    if (c === 'YELLOW') return 'colour-badge colour-badge-yellow';
    return 'colour-badge colour-badge-black';
  };

  return (
    <div className="procurement-page-container">
      {/* ================================================================= */}
      {/* 1. HERO / WELCOME CARD                                            */}
      {/* ================================================================= */}
      <div className="user-hero-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
            <h1 className="user-hero-title">
              {getGreeting()}, {resolvedName} 👋
            </h1>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: 'var(--iocl-red-light, #FFEBEE)',
                color: 'var(--iocl-red, #B71C1C)',
                fontWeight: 800,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid rgba(183, 28, 28, 0.2)',
                letterSpacing: '0.04em'
              }}
            >
              USER PORTAL
            </span>
          </div>
          <p className="user-hero-subtitle">
            Welcome to the IOCL Consumables & Procurement Management System. Here is an overview of your recent activity and recorded usage.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Refresh Button */}
          <button
            type="button"
            className="btn-refresh"
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing || loading}
            title="Refresh dashboard data from server"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              height: '38px'
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>

          {/* Record Asset Usage Button */}
          <Link
            to="/user/usage"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0 16px',
              backgroundColor: 'var(--iocl-red, #B71C1C)',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              height: '38px',
              boxShadow: '0 2px 6px rgba(183, 28, 28, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--iocl-red-hover, #D32F2F)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--iocl-red, #B71C1C)'}
          >
            <ClipboardEdit size={16} />
            <span>Record Asset Usage</span>
          </Link>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div
          className="mb-6"
          style={{
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <AlertTriangle size={18} color="#DC2626" />
            <span style={{ fontSize: '0.875rem', color: '#991B1B', fontWeight: 600 }}>
              {error}
            </span>
          </div>
          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 2. THREE SUMMARY METRIC CARDS (REAL DATABASE DATA)                */}
      {/* ================================================================= */}
      <div className="user-kpi-grid">
        {/* Card 1: Usage Total */}
        <div className="user-kpi-card">
          <div className="user-kpi-top">
            <span className="user-kpi-label">USAGE TOTAL</span>
            <div
              className="user-kpi-icon-box"
              style={{ backgroundColor: '#ECFDF5', color: '#059669' }}
            >
              <Activity size={18} />
            </div>
          </div>
          <div className="user-kpi-number" style={{ color: 'var(--text-primary)' }}>
            {loading ? '...' : (dashboardData?.usageTotal ?? 0).toLocaleString()}
          </div>
          <p className="user-kpi-subtext">Total consumable units recorded</p>
        </div>

        {/* Card 2: Assets Requiring Attention */}
        <div className="user-kpi-card">
          <div className="user-kpi-top">
            <span className="user-kpi-label">ASSETS REQUIRING ATTENTION</span>
            <div
              className="user-kpi-icon-box"
              style={{
                backgroundColor: (dashboardData?.assetsRequiringAttention ?? 0) > 0 ? '#FEF2F2' : '#F1F5F9',
                color: (dashboardData?.assetsRequiringAttention ?? 0) > 0 ? '#DC2626' : '#64748B'
              }}
            >
              <AlertCircle size={18} />
            </div>
          </div>
          <div
            className="user-kpi-number"
            style={{ color: (dashboardData?.assetsRequiringAttention ?? 0) > 0 ? '#DC2626' : 'var(--text-primary)' }}
          >
            {loading ? '...' : (dashboardData?.assetsRequiringAttention ?? 0)}
          </div>
          <p className="user-kpi-subtext">Threshold alerts & low stock items</p>
        </div>

        {/* Card 3: Pending Actions */}
        <div className="user-kpi-card">
          <div className="user-kpi-top">
            <span className="user-kpi-label">PENDING ACTIONS</span>
            <div
              className="user-kpi-icon-box"
              style={{ backgroundColor: '#FFF7ED', color: '#EA580C' }}
            >
              <Clock size={18} />
            </div>
          </div>
          <div className="user-kpi-number" style={{ color: 'var(--text-primary)' }}>
            {loading ? '...' : (dashboardData?.pendingActions ?? 0)}
          </div>
          <p className="user-kpi-subtext">Awaiting execution / confirmation</p>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. TWO-COLUMN SECTION: ASSET USAGE (50%) & RECENT ACTIVITY (50%)   */}
      {/* ================================================================= */}
      <div className="user-dashboard-columns">
        {/* Left Column: ASSET USAGE */}
        <div className="user-panel-card">
          <div className="user-panel-header">
            <div className="user-panel-title-group">
              <Zap size={16} color="var(--iocl-red, #B71C1C)" />
              <h2 className="user-panel-title">
                ASSET USAGE
              </h2>
            </div>
            <Link
              to="/user/asset-history"
              className="user-panel-link"
            >
              <span>View History</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* List of Real Usage Transactions */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={20} className="spin-icon" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, margin: 0 }}>Loading usage records...</p>
              </div>
            ) : dashboardData?.recentUsages && dashboardData.recentUsages.length > 0 ? (
              dashboardData.recentUsages.map((item) => (
                <div
                  key={item.id}
                  className="user-record-row"
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="part-number-chip" style={{ fontSize: '0.8125rem' }}>
                        {item.partNumber || item.cartridgeName}
                      </span>
                      {item.colour && (
                        <span className={getColourBadgeClass(item.colour)}>
                          {item.colour}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      For: <strong style={{ color: 'var(--text-secondary)' }}>{item.beneficiaryEmployeeName || item.employeeName || 'Beneficiary'}</strong>
                      {item.beneficiaryEmployeeNo ? ` (${item.beneficiaryEmployeeNo})` : ''} · {formatDate(item.usageDate)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--iocl-red, #B71C1C)' }}>
                      {item.quantityUsed} unit{item.quantityUsed > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '3.5rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#F1F5F9',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}
                >
                  <ClipboardEdit size={22} />
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                  No recent usage records
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 1rem', maxWidth: '280px', lineHeight: 1.4 }}>
                  When you record consumable cartridge usage, your execution logs will appear here.
                </p>
                <Link
                  to="/user/usage"
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--iocl-red, #B71C1C)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>Record Cartridge Usage</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: RECENT ACTIVITY */}
        <div className="user-panel-card">
          <div className="user-panel-header">
            <div className="user-panel-title-group">
              <Clock3 size={16} color="var(--iocl-red, #B71C1C)" />
              <h2 className="user-panel-title">
                RECENT ACTIVITY
              </h2>
            </div>
            <Link
              to="/user/activity"
              className="user-panel-link"
            >
              <span>View All Activity</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* List of Real Activities */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={20} className="spin-icon" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, margin: 0 }}>Loading activity logs...</p>
              </div>
            ) : dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="user-activity-row"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--iocl-red-light, #FFEBEE)',
                        color: 'var(--iocl-red, #B71C1C)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '1px'
                      }}
                    >
                      <Activity size={14} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {act.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {act.description}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, flexShrink: 0, marginLeft: '8px' }}>
                    {formatDate(act.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '3.5rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#F1F5F9',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}
                >
                  <History size={22} />
                </div>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                  No recent activity
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, maxWidth: '280px', lineHeight: 1.4 }}>
                  Recent usage submissions, assignments, and profile updates will be logged here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 4. SUPPORT & COMPLIANCE FOOTER CARD                               */}
      {/* ================================================================= */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle, #E2E8F0)',
          padding: '0.875rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <ShieldCheck size={18} color="var(--iocl-red, #B71C1C)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            IOCL Consumables & Store Management · Departmental Usage Tracking Unit
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Authenticated as <strong>{dashboardData?.userEmail || user?.email || 'User'}</strong>
        </span>
      </div>
    </div>
  );
};

export default UserDashboard;
