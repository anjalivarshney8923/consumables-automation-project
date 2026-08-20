import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  AlertCircle,
  Activity,
  Clock,
  ClipboardEdit,
  History,
  Bell,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Inbox,
  Info,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserUsageHistory } from '../../services/assetUsageService';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [recentUsages, setRecentUsages] = useState([]);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        const res = await getUserUsageHistory();
        if (res.success && Array.isArray(res.data)) {
          setRecentUsages(res.data);
        }
      } catch {
        setRecentUsages([]);
      } finally {
        setLoadingUsage(false);
      }
    };
    loadUsage();
  }, []);

  const totalQuantityRecorded = recentUsages.reduce((sum, item) => sum + (item.quantityUsed || 0), 0);

  // Dynamic greeting based on current time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const displayName = user?.fullName || user?.name || user?.username || 'User';

  return (
    <div className="dashboard-container">
      {/* 1. Welcome Banner Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem 1.75rem',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1E293B', margin: 0, letterSpacing: '-0.02em' }}>
              {getGreeting()}, {displayName} 👋
            </h1>
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
              USER PORTAL
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0, fontWeight: '500' }}>
            Welcome to the IOCL Consumables & Procurement Management System. Here's an overview of your assigned assets and recent activity.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link
            to="/user/usage"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.125rem',
              backgroundColor: '#D4001F',
              color: '#FFFFFF',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.875rem',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(212,0,31,0.25)',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#BA001A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D4001F'}
          >
            <ClipboardEdit size={16} />
            <span>Record Asset Usage</span>
          </Link>

          <Link
            to="/user/assets"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              backgroundColor: '#F8FAFC',
              color: '#334155',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F1F5F9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
          >
            <Package size={16} color="var(--iocl-navy)" />
            <span>View My Assets</span>
          </Link>
        </div>
      </header>

      {/* 2. Four Summary Metric Cards (Clean neutral placeholders with no fake numbers) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '1.75rem'
        }}
      >
        {/* Card 1: My Assets */}
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
                My Assets
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
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
            Assigned consumables & devices
          </div>
        </div>

        {/* Card 2: Assets Requiring Attention */}
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
                Assets Requiring Attention
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
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
            Low cartridge / maintenance required
          </div>
        </div>

        {/* Card 3: Usage This Month */}
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
                Usage Total
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--iocl-navy)', marginTop: '0.25rem' }}>
                {loadingUsage ? '--' : `${totalQuantityRecorded}`}
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
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
            Units recorded this billing cycle
          </div>
        </div>

        {/* Card 4: Pending Actions */}
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
                Pending Actions
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
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.5rem' }}>
            Awaiting execution / confirmation
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
          gap: '1.5rem',
          marginBottom: '1.75rem'
        }}
      >
        {/* Left Column: MY ASSETS & ASSET USAGE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section: MY ASSETS */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={18} color="var(--iocl-navy)" />
                <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                  MY ASSETS
                </h2>
              </div>
              <Link
                to="/user/assets"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Empty State */}
            <div
              style={{
                padding: '3rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <Package size={26} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
                No assets assigned yet.
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, maxWidth: '320px', lineHeight: 1.4 }}>
                Your assigned printer consumables and hardware devices will appear here once allocated.
              </p>
            </div>
          </div>

          {/* Section: ASSET USAGE */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} color="var(--iocl-navy)" />
                <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                  ASSET USAGE
                </h2>
              </div>
              <Link
                to="/user/asset-history"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>View Usage History</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Render real recent usage items or clean empty state */}
            {loadingUsage ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
                <Loader2 size={20} className="spinner text-navy" style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.8125rem', fontWeight: 500, margin: 0 }}>Loading usage records...</p>
              </div>
            ) : recentUsages.length > 0 ? (
              <div style={{ padding: '0.5rem 1rem' }}>
                {recentUsages.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0.5rem',
                      borderBottom: '1px solid #F1F5F9'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                        {item.partNumber || item.cartridgeName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                        For: <strong>{item.beneficiaryEmployeeName || item.employeeName || 'Beneficiary'}</strong> ({item.beneficiarySeatOrCabinNo || item.seatOrCabinNo || 'Cabin'}) · {item.usageDate}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#D4001F' }}>
                        {item.quantityUsed} unit{item.quantityUsed > 1 ? 's' : ''}
                      </span>
                      {item.colour && (
                        <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#0891B2' }}>
                          {item.colour}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '3rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '12px',
                    backgroundColor: '#F1F5F9',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}
                >
                  <ClipboardEdit size={26} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
                  No recent usage records.
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0 0 1.25rem', maxWidth: '320px', lineHeight: 1.4 }}>
                  When you record consumable cartridge usage, your execution logs will be displayed here.
                </p>
                <Link
                  to="/user/usage"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#D4001F',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span>Record Cartridge Usage</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: NOTIFICATIONS & RECENT ACTIVITY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section: NOTIFICATIONS PREVIEW */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="var(--iocl-navy)" />
                <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                  NOTIFICATIONS
                </h2>
              </div>
              <Link
                to="/user/notifications"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Empty State */}
            <div
              style={{
                padding: '3rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <Bell size={26} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
                No new notifications
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, maxWidth: '320px', lineHeight: 1.4 }}>
                You are all caught up! System alerts and allocation notices will show up here.
              </p>
            </div>
          </div>

          {/* Section: RECENT ACTIVITY */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--iocl-navy)" />
                <h2 style={{ fontSize: '1rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
                  RECENT ACTIVITY
                </h2>
              </div>
              <Link
                to="/user/activity"
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <span>View All Activity</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Empty State */}
            <div
              style={{
                padding: '3rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem'
                }}
              >
                <History size={26} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
                No recent activity.
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, maxWidth: '320px', lineHeight: 1.4 }}>
                Recent usage submissions, assignments, and profile updates will be logged here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Support & Compliance Footer Card */}
      <div
        style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={20} color="var(--iocl-navy)" />
          <span style={{ fontSize: '0.8125rem', color: '#475569', fontWeight: '500' }}>
            IOCL Consumables & Store Management · Departmental Usage Tracking Unit
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
          Authenticated as <strong>{user?.email || 'User'}</strong>
        </span>
      </div>
    </div>
  );
};
