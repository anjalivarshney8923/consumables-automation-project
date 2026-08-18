import React from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardEdit,
  History,
  Package,
  Clock,
  TrendingUp,
  PackageCheck,
  Layers,
  ArrowRight,
  Inbox,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const UserDashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title-text">Welcome, Store User</h1>
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
              STORE / USER PORTAL
            </span>
          </div>
          <p className="page-subtitle-text">
            Manage and record consumable cartridge usage, dispatch work orders, and track execution logs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/user/record-usage"
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none'
            }}
          >
            <ClipboardEdit size={16} />
            <span>Record Cartridge Usage</span>
          </Link>
        </div>
      </header>

      {/* 4 Metric Cards (Clean placeholders with no fake database numbers) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        {/* Card 1: Pending Executions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                Pending Executions
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--iocl-navy)', marginTop: '0.25rem' }}>
                --
              </div>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={20} />
            </div>
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.5rem', display: 'block' }}>
            Data will appear after backend integration
          </span>
        </div>

        {/* Card 2: Today's Executed Quantity */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                Today's Executed Qty
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--iocl-saffron)', marginTop: '0.25rem' }}>
                --
              </div>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <TrendingUp size={20} />
            </div>
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.5rem', display: 'block' }}>
            Data will appear after backend integration
          </span>
        </div>

        {/* Card 3: Total Executed */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                Total Executed Quantity
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#059669', marginTop: '0.25rem' }}>
                --
              </div>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <PackageCheck size={20} />
            </div>
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.5rem', display: 'block' }}>
            Data will appear after backend integration
          </span>
        </div>

        {/* Card 4: Assigned / Available Call-Up POs */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            padding: '1.25rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                Assigned Call-Up POs
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--iocl-navy)', marginTop: '0.25rem' }}>
                --
              </div>
            </div>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Package size={20} />
            </div>
          </div>
          <span style={{ fontSize: '0.6875rem', color: '#94A3B8', marginTop: '0.5rem', display: 'block' }}>
            Data will appear after backend integration
          </span>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--iocl-navy)', marginBottom: '0.875rem' }}>
          Store Quick Operations
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem'
          }}
        >
          {/* Action 1: Record Usage */}
          <Link
            to="/user/record-usage"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  color: '#1E40AF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <ClipboardEdit size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: '0 0 0.35rem' }}>
                Record Cartridge Usage
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                Record actual quantities issued or consumed against active Call-Up Purchase Orders.
              </p>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#1E40AF', fontWeight: '700', fontSize: '0.8125rem' }}>
              <span>Open Entry Form</span>
              <ArrowRight size={15} />
            </div>
          </Link>

          {/* Action 2: My Assigned POs */}
          <Link
            to="/user/assigned-pos"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF7ED',
                  color: '#EA580C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <Package size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: '0 0 0.35rem' }}>
                My Assigned Call-Up POs
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                View Call-Up Purchase Orders dispatched to your store with pending remaining quantities.
              </p>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#EA580C', fontWeight: '700', fontSize: '0.8125rem' }}>
              <span>View Assigned POs</span>
              <ArrowRight size={15} />
            </div>
          </Link>

          {/* Action 3: Usage History */}
          <Link
            to="/user/usage-history"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              padding: '1.5rem',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <History size={22} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: '0 0 0.35rem' }}>
                Usage History & Logs
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                Review historical execution timestamps, quantities recorded, and store issuance remarks.
              </p>
            </div>
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#059669', fontWeight: '700', fontSize: '0.8125rem' }}>
              <span>View History</span>
              <ArrowRight size={15} />
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity Section (Empty State) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--iocl-navy)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
              Recent Store Usage Executions
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Store Portal Real-Time Logs
          </span>
        </div>

        <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#F1F5F9',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            <Inbox size={24} />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
            No Usage Records Available Yet
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
            When cartridge issuances are executed against assigned Call-Up POs, real-time activity logs will be displayed here.
          </p>
          <Link
            to="/user/record-usage"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--iocl-navy)',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              textDecoration: 'none'
            }}
          >
            <ClipboardEdit size={15} />
            <span>Record First Cartridge Usage</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
