import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, ClipboardEdit, ArrowRight, ShieldCheck } from 'lucide-react';

export const UserAssets = () => {
  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 className="page-title-text">My Assets</h1>
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
              ASSIGNED ASSETS
            </span>
          </div>
          <p className="page-subtitle-text">
            View printer consumables and hardware assets allocated to your department and location.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/user/usage"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <ClipboardEdit size={16} />
            <span>Record Usage</span>
          </Link>
        </div>
      </header>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '360px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by part number, printer model..."
              disabled
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                fontSize: '0.875rem',
                backgroundColor: '#F8FAFC',
                cursor: 'not-allowed'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            disabled
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: '#64748B',
              cursor: 'not-allowed'
            }}
          >
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Main Asset Table / Empty State Card */}
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
            Allocated Consumables & Devices
          </h3>
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
            0 items allocated
          </span>
        </div>

        {/* Clean Empty State */}
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
            <Package size={32} />
          </div>

          <h4 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#1E293B', margin: '0 0 0.5rem' }}>
            No assets assigned yet
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#64748B', maxWidth: '420px', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            Consumable cartridges, printer units, and rate contract allocations assigned to your user account will appear here.
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
