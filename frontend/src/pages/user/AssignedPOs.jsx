import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Inbox, Eye, ClipboardEdit, RefreshCw } from 'lucide-react';

export const AssignedPOs = () => {
  const [assignedPOs, setAssignedPOs] = useState([]);
  const navigate = useNavigate();

  return (
    <div className="procurement-page-container">
      {/* Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title-text">My Assigned POs</h1>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                fontWeight: '800',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #FFEDD5'
              }}
            >
              WORK ORDERS
            </span>
          </div>
          <p className="page-subtitle-text">
            Call-Up Purchase Orders dispatched against master Rate Contracts assigned to your store.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Link
            to="/user/record-usage"
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
            <span>Record Usage</span>
          </Link>
        </div>
      </header>

      {/* Table Container */}
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
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} color="var(--iocl-navy)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
              Assigned Call-Up Purchase Orders
            </h3>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              color: '#64748B',
              backgroundColor: '#F1F5F9',
              padding: '0.25rem 0.625rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1'
            }}
          >
            Assigned: <strong>{assignedPOs.length}</strong>
          </span>
        </div>

        {/* Render Table or Empty State */}
        {assignedPOs.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>PO / WO NUMBER</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>PO DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CARTRIDGE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>PO QTY</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>EXECUTED</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>REMAINING</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {assignedPOs.map((po) => (
                  <tr key={po.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontWeight: '700' }}>{po.poNumber}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>{po.poDate}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{po.cartridge}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{po.quantity}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#EA580C', fontWeight: '700' }}>{po.alreadyExecuted}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#059669', fontWeight: '700' }}>{po.remainingQuantity}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge-preview-tag">{po.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/user/assigned-pos/${po.id}`)}
                        className="btn btn-sm"
                        style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE' }}
                      >
                        <Eye size={12} style={{ marginRight: '4px' }} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
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
              No Call-Up POs Assigned
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              Assigned Call-Up Purchase Orders will appear here after backend integration and administrator allocation.
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
              <span>Record Cartridge Usage</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
