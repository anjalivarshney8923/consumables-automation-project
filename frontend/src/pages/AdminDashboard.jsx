import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Boxes,
  FileText,
  AlertTriangle,
  Activity,
  PlusCircle,
  PackagePlus,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUnreadAlerts, markAlertAsRead } from '../services/alertService';

export const AdminDashboard = () => {
  const { adminUser } = useAuth();
  const adminName = adminUser?.name || 'IOCL Administrator';

  const [activeAlerts, setActiveAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const loadDashboardAlerts = useCallback(async () => {
    setAlertsLoading(true);
    const res = await getUnreadAlerts();
    if (res.success && res.data) {
      setActiveAlerts(res.data);
    }
    setAlertsLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardAlerts();
  }, [loadDashboardAlerts]);

  const handleDismissAlert = async (alertId) => {
    const res = await markAlertAsRead(alertId);
    if (res.success) {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }
  };

  const todayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Welcome Hero Banner */}
      <section className="dashboard-welcome-hero" aria-label="Dashboard Overview">
        <div className="welcome-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="welcome-heading">Welcome, {adminName}</h1>
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--iocl-saffron-light)',
                color: 'var(--iocl-saffron-hover)',
                fontWeight: '600',
                padding: '0.125rem 0.5rem',
                borderRadius: '4px'
              }}
            >
              IOCL Admin
            </span>
          </div>
          <p className="welcome-subtext">
            Consumables & Procurement Management System &bull; Operational Control Panel
          </p>
        </div>

        <div className="welcome-badges">
          <span className="status-pill status-pill-online" title="System Operational">
            <span className="status-dot" />
            System Active
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={13} /> {todayDate}
          </span>
        </div>
      </section>

      {/* KPI Placeholder Cards Grid */}
      <section aria-label="Key Performance Indicators">
        <div className="kpi-grid">
          {/* Card 1: Procurement Register */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">Procurement Register</span>
              <div className="kpi-icon-container kpi-icon-navy">
                <ShoppingBag size={20} />
              </div>
            </div>
            <div className="kpi-card-body">
              <span className="kpi-card-value">--</span>
              <span className="kpi-card-placeholder-badge">Not Initialized</span>
            </div>
            <div className="kpi-card-footer">
              <span>Total POs & Indents</span>
              <span style={{ fontWeight: '500' }}>Module Ready</span>
            </div>
          </div>

          {/* Card 2: Store Inventory */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">Store Inventory</span>
              <div className="kpi-icon-container kpi-icon-saffron">
                <Boxes size={20} />
              </div>
            </div>
            <div className="kpi-card-body">
              <span className="kpi-card-value">--</span>
              <span className="kpi-card-placeholder-badge">Not Initialized</span>
            </div>
            <div className="kpi-card-footer">
              <span>Consumable Stock SKUs</span>
              <span style={{ fontWeight: '500' }}>Module Ready</span>
            </div>
          </div>

          {/* Card 3: Active Tenders */}
          <div className="kpi-card">
            <div className="kpi-card-header">
              <span className="kpi-card-title">Tendering</span>
              <div className="kpi-icon-container kpi-icon-purple">
                <FileText size={20} />
              </div>
            </div>
            <div className="kpi-card-body">
              <span className="kpi-card-value">--</span>
              <span className="kpi-card-placeholder-badge">Not Initialized</span>
            </div>
            <div className="kpi-card-footer">
              <span>Active Tender Bids</span>
              <span style={{ fontWeight: '500' }}>Module Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections: Alerts & Recent Activity */}
      <section className="dashboard-sections-grid" aria-label="System Sections">
        {/* Section 1: Threshold Alerts */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <AlertTriangle size={18} color="var(--iocl-saffron)" />
              <span>Threshold Alerts (Alert 1)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Monitoring</span>
              <button
                type="button"
                onClick={loadDashboardAlerts}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--iocl-navy)',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'inline-flex'
                }}
                title="Refresh alerts"
              >
                <RefreshCw size={13} className={alertsLoading ? 'spin-icon' : ''} />
              </button>
            </div>
          </div>
          <div className="section-body">
            {alertsLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                Checking threshold alerts from database...
              </div>
            ) : activeAlerts.length === 0 ? (
              <div className="empty-state-box">
                <div className="empty-state-icon">
                  <CheckCircle2 size={22} color="#16A34A" />
                </div>
                <h2 className="empty-state-title">No alerts</h2>
                <p className="empty-state-desc">
                  No active threshold violations. Rate contract availability and stock quotas are within configured operating parameters.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#FFFBF6',
                      border: '1px solid #FED7AA',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            fontSize: '0.6875rem',
                            fontWeight: '700',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          Low Availability
                        </span>
                        <strong style={{ fontSize: '0.875rem', color: '#1E293B' }}>
                          {alert.cartridgeName}
                        </strong>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
                          ({alert.partNumber})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDismissAlert(alert.id)}
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: '600',
                          color: '#475569',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Mark Read
                      </button>
                    </div>

                    <p style={{ fontSize: '0.8125rem', color: '#334155', margin: 0 }}>
                      {alert.message}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <span style={{ color: '#DC2626', fontWeight: '700' }}>
                          Net Available in RC: {alert.netAvailableQuantity}
                        </span>
                        <span style={{ color: '#475569', fontWeight: '600' }}>
                          PO Threshold: {alert.threshold}
                        </span>
                      </div>
                      <Link
                        to="/admin/thresholds"
                        style={{
                          color: 'var(--iocl-navy)',
                          textDecoration: 'none',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        Adjust Threshold &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Recent Activity */}
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <Activity size={18} color="var(--iocl-navy)" />
              <span>Recent Activity</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit Log</span>
          </div>
          <div className="section-body">
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <Activity size={22} />
              </div>
              <h2 className="empty-state-title">No activity yet</h2>
              <p className="empty-state-desc">
                Activity log is currently clear. Recent transactions and administrative actions will be recorded here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Action Shortcuts (Module Placeholders) */}
      <section aria-label="Quick Actions">
        <div className="section-card">
          <div className="section-header">
            <div className="section-title">
              <ShieldCheck size={18} color="var(--iocl-navy)" />
              <span>Future Modules & Quick Actions</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Under Development</span>
          </div>
          <div className="section-body">
            <div className="quick-actions-grid">
              <div className="quick-action-btn" title="Procurement Register (Coming in next phase)">
                <div className="quick-action-icon">
                  <PlusCircle size={18} />
                </div>
                <div className="quick-action-info">
                  <span className="quick-action-label">New Procurement</span>
                  <span className="quick-action-status">Module In Development</span>
                </div>
              </div>

              <div className="quick-action-btn" title="Store Requisition (Coming in next phase)">
                <div className="quick-action-icon" style={{ color: 'var(--iocl-saffron)', backgroundColor: 'var(--iocl-saffron-light)' }}>
                  <PackagePlus size={18} />
                </div>
                <div className="quick-action-info">
                  <span className="quick-action-label">Stock Requisition</span>
                  <span className="quick-action-status">Module In Development</span>
                </div>
              </div>

              <div className="quick-action-btn" title="Call-up PO (Coming in next phase)">
                <div className="quick-action-icon" style={{ color: '#059669', backgroundColor: '#ECFDF5' }}>
                  <FileSpreadsheet size={18} />
                </div>
                <div className="quick-action-info">
                  <span className="quick-action-label">Call-up PO</span>
                  <span className="quick-action-status">Module In Development</span>
                </div>
              </div>

              <div className="quick-action-btn" title="Tender Register (Coming in next phase)">
                <div className="quick-action-icon" style={{ color: '#7C3AED', backgroundColor: '#F5F3FF' }}>
                  <ArrowUpRight size={18} />
                </div>
                <div className="quick-action-info">
                  <span className="quick-action-label">Publish Tender</span>
                  <span className="quick-action-status">Module In Development</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
