import React from 'react';
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
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
  const { adminUser } = useAuth();
  const adminName = adminUser?.name || 'IOCL Administrator';

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
              <span>Threshold Alerts</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Monitoring</span>
          </div>
          <div className="section-body">
            <div className="empty-state-box">
              <div className="empty-state-icon">
                <AlertTriangle size={22} />
              </div>
              <h2 className="empty-state-title">No alerts</h2>
              <p className="empty-state-desc">
                No active threshold violations. Stock levels and procurement quotas are within standard operating parameters.
              </p>
            </div>
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
