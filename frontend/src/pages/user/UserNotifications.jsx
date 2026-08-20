import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

export const UserNotifications = () => {
  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 className="page-title-text">Notifications</h1>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                fontWeight: '800',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #BFDBFE'
              }}
            >
              ALERTS & NOTICES
            </span>
          </div>
          <p className="page-subtitle-text">
            Stay updated with asset allocations, usage quota notices, and system alerts.
          </p>
        </div>
      </header>

      {/* Notifications Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
            Inbox Notifications
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
            0 unread
          </span>
        </div>

        {/* Empty Notifications State */}
        <div
          style={{
            padding: '4.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              backgroundColor: '#F1F5F9',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}
          >
            <Bell size={32} />
          </div>

          <h4 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#1E293B', margin: '0 0 0.5rem' }}>
            No new notifications
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            You are all caught up! When new consumables are assigned or alerts are triggered, you will be notified here.
          </p>

          <Link
            to="/user/dashboard"
            style={{
              fontSize: '0.8125rem',
              fontWeight: '700',
              color: 'var(--iocl-navy)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <span>Return to Dashboard</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};
