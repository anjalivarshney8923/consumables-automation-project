import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Calendar,
  Layers,
  Building2,
  TrendingDown,
  ClipboardEdit,
  Info
} from 'lucide-react';

export const POUserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="procurement-page-container">
      {/* Header & Back Button */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <button
              type="button"
              onClick={() => navigate('/user/assigned-pos')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Back to Assigned POs"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 className="page-title-text" style={{ margin: 0 }}>
                  Call-Up PO Details
                </h1>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    fontWeight: '800',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  PO #{id || '—'}
                </span>
              </div>
              <p className="page-subtitle-text" style={{ marginTop: '0.25rem' }}>
                Work order allocation specifications and execution status
              </p>
            </div>
          </div>
        </div>

        <div>
          <Link
            to={`/user/record-usage?poId=${id || ''}`}
            className="btn btn-primary"
            style={{
              padding: '0.4375rem 0.875rem',
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              textDecoration: 'none'
            }}
          >
            <ClipboardEdit size={14} />
            <span>Record Usage against this PO</span>
          </Link>
        </div>
      </header>

      {/* Details Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
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
            <Package size={18} color="var(--iocl-navy)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
              Work Order Specifications
            </h3>
          </div>

          <span
            style={{
              fontSize: '0.6875rem',
              fontWeight: '700',
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #FCD34D'
            }}
          >
            PENDING INTEGRATION
          </span>
        </div>

        <div
          style={{
            padding: '1.75rem 1.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem'
          }}
        >
          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              PO / WO Number
            </span>
            <p style={{ fontSize: '0.9375rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--iocl-navy)', margin: '0.25rem 0 0' }}>
              {id ? `PO-2026-${id}` : '—'}
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              PO Date
            </span>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0.25rem 0 0' }}>
              --
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              Cartridge
            </span>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0.25rem 0 0' }}>
              --
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              Supplier
            </span>
            <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0.25rem 0 0' }}>
              --
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              PO Allocated Quantity
            </span>
            <p style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--iocl-navy)', margin: '0.25rem 0 0' }}>
              --
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              Already Executed
            </span>
            <p style={{ fontSize: '1rem', fontWeight: '800', color: '#EA580C', margin: '0.25rem 0 0' }}>
              --
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              Remaining Available
            </span>
            <p style={{ fontSize: '1rem', fontWeight: '800', color: '#059669', margin: '0.25rem 0 0' }}>
              --
            </p>
          </div>

          <div style={{ backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
              Execution Status
            </span>
            <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#64748B', margin: '0.25rem 0 0' }}>
              PENDING
            </p>
          </div>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Info size={15} color="#64748B" />
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Detailed live values will be populated from PostgreSQL upon backend integration.
          </span>
        </div>
      </div>
    </div>
  );
};
