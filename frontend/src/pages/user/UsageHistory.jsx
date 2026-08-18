import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { History, Inbox, ClipboardEdit, Database, Filter, RefreshCw } from 'lucide-react';

export const UsageHistory = () => {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="procurement-page-container">
      {/* Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title-text">Usage History</h1>
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
              EXECUTION LOGS
            </span>
          </div>
          <p className="page-subtitle-text">
            Historical log of all cartridge execution and issuance records submitted through the Store Portal.
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

      {/* History Table Container */}
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
            <History size={18} color="var(--iocl-navy)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
              Execution History Records
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
            Total Records: <strong>{historyRecords.length}</strong>
          </span>
        </div>

        {/* Render Table or Clean Empty State */}
        {historyRecords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CARTRIDGE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CALL-UP PO</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>PO QTY</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>EXECUTED QTY</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>REMAINING QTY</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.75rem 1rem' }}>{item.date}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>{item.cartridge}</td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace' }}>{item.poNumber}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{item.poQuantity}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#EA580C', fontWeight: '700' }}>{item.executedQuantity}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#059669', fontWeight: '700' }}>{item.remainingQuantity}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge-preview-tag">{item.status}</span>
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
              No Usage Records Available Yet
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              Usage history will appear after backend integration. When you record cartridge issuances, they will be logged here.
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
              <span>Record New Usage</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
