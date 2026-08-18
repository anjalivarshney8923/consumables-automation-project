import React from 'react';
import { Menu, User, ShieldCheck } from 'lucide-react';

export const UserHeader = ({ onToggleSidebar }) => {
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
          <h2 className="header-title">Consumables & Store Management Portal</h2>
        </div>
      </div>

      {/* Right side: User Profile Badge */}
      <div className="header-right">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            STORE USER
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
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
              <User size={15} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1E293B', lineHeight: '1.2' }}>
                Store Keeper
              </span>
              <span style={{ fontSize: '0.625rem', color: '#64748B' }}>
                store.user@iocl.in
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
