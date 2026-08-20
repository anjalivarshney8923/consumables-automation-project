import React from 'react';
import { Link } from 'react-router-dom';
import { History, Clock, ArrowRight, Filter, Calendar } from 'lucide-react';

export const UserActivity = () => {
  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 className="page-title-text">My Activity</h1>
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
              LOG HISTORY
            </span>
          </div>
          <p className="page-subtitle-text">
            Audit logs of your consumable usage recordings, asset status changes, and account activity.
          </p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          style={{
            padding: '0.45rem 1rem',
            backgroundColor: 'var(--iocl-navy)',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: '700',
            border: 'none',
            cursor: 'default'
          }}
        >
          All Activity
        </button>
        <button
          type="button"
          disabled
          style={{
            padding: '0.45rem 1rem',
            backgroundColor: '#FFFFFF',
            color: '#64748B',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: '600',
            border: '1px solid #E2E8F0',
            cursor: 'not-allowed'
          }}
        >
          Usage Executions
        </button>
        <button
          type="button"
          disabled
          style={{
            padding: '0.45rem 1rem',
            backgroundColor: '#FFFFFF',
            color: '#64748B',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: '600',
            border: '1px solid #E2E8F0',
            cursor: 'not-allowed'
          }}
        >
          Account Events
        </button>
      </div>

      {/* Activity Timeline Card */}
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
            Recent Activity Logs
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
            0 events recorded
          </span>
        </div>

        {/* Empty Timeline State */}
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
            <Clock size={32} />
          </div>

          <h4 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#1E293B', margin: '0 0 0.5rem' }}>
            No recent activity
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            When you execute cartridge work orders or update assigned assets, your chronological activity timeline will appear here.
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
