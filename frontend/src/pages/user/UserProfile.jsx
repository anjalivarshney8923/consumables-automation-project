import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Building,
  MapPin,
  BadgeCheck,
  Shield,
  KeyRound,
  IdCard,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 className="page-title-text">My Profile</h1>
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
              USER ACCOUNT
            </span>
          </div>
          <p className="page-subtitle-text">
            View your authenticated employee profile details, departmental allocation, and security credentials.
          </p>
        </div>
      </header>

      {/* Main Grid: User Hero Card + Details Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Profile Summary Hero Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '2rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              backgroundColor: 'var(--iocl-navy)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: '800',
              marginBottom: '1rem',
              boxShadow: '0 4px 12px rgba(11,39,72,0.2)'
            }}
          >
            {user?.fullName
              ? user.fullName.substring(0, 2).toUpperCase()
              : (user?.username ? user.username.substring(0, 2).toUpperCase() : 'U')}
          </div>

          <h2 style={{ fontSize: '1.375rem', fontWeight: '800', color: '#1E293B', margin: '0 0 0.25rem' }}>
            {user?.fullName || user?.name || 'Authenticated User'}
          </h2>
          <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: '500', marginBottom: '1rem' }}>
            @{user?.username || 'username'}
          </span>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.35rem 0.85rem',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              border: '1px solid #A7F3D0',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              marginBottom: '1.5rem'
            }}
          >
            <CheckCircle2 size={14} />
            <span>Active IOCL Personnel</span>
          </div>

          <div
            style={{
              width: '100%',
              borderTop: '1px solid #F1F5F9',
              paddingTop: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#475569', fontSize: '0.875rem' }}>
              <IdCard size={16} color="var(--iocl-navy)" />
              <span style={{ color: '#64748B' }}>Employee ID:</span>
              <strong style={{ color: '#1E293B', marginLeft: 'auto' }}>{user?.employeeId || '--'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#475569', fontSize: '0.875rem' }}>
              <Building size={16} color="var(--iocl-navy)" />
              <span style={{ color: '#64748B' }}>Department:</span>
              <strong style={{ color: '#1E293B', marginLeft: 'auto' }}>{user?.department || 'Operations'}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', color: '#475569', fontSize: '0.875rem' }}>
              <MapPin size={16} color="var(--iocl-navy)" />
              <span style={{ color: '#64748B' }}>Location / Unit:</span>
              <strong style={{ color: '#1E293B', marginLeft: 'auto' }}>{user?.location || 'IOCL Site'}</strong>
            </div>
          </div>
        </div>

        {/* Account & Authentication Details Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '2rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <Shield size={20} color="var(--iocl-navy)" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>
              Account & Credentials
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Email Address
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1E293B', wordBreak: 'break-all' }}>
                {user?.email || 'user@iocl.co.in'}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Assigned Role
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1E293B' }}>
                {user?.role || 'USER'}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Authentication Type
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1E293B' }}>
                JWT Bearer Token
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                Account Status
              </div>
              <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#065F46' }}>
                ACTIVE
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}
          >
            <KeyRound size={18} color="#1E40AF" style={{ marginTop: '0.125rem', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#1E40AF', marginBottom: '0.15rem' }}>
                Security & Role Information
              </div>
              <p style={{ fontSize: '0.75rem', color: '#3B82F6', margin: 0, lineHeight: 1.4 }}>
                This user account is authorized for Consumables & Store operations. Role changes or administrative access elevation can only be granted by the system administrator.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
