import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Inbox, ClipboardEdit, Loader2, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { getUserUsageHistory } from '../../services/assetUsageService';

export const UsageHistory = () => {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getUserUsageHistory();
      if (result.success && Array.isArray(result.data)) {
        setHistoryRecords(result.data);
      } else {
        setError(result.message || 'Failed to load usage history from database.');
        setHistoryRecords([]);
      }
    } catch (err) {
      setError('Unable to connect to backend server. Please verify Spring Boot is running.');
      setHistoryRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

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
            Historical log of all cartridge consumption transactions submitted through the Store Portal.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={fetchHistory}
            disabled={isLoading}
            className="btn btn-secondary"
            style={{
              padding: '0.4375rem 0.875rem',
              fontSize: '0.8125rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>

          <Link
            to="/user/usage"
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

      {error && (
        <div
          className="mb-6"
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            color: '#991B1B',
            fontSize: '0.875rem'
          }}
        >
          <AlertCircle size={18} color="#DC2626" />
          <span>{error}</span>
        </div>
      )}

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
              Execution History Records (PostgreSQL)
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

        {/* Render Table or Loading / Clean Empty State */}
        {isLoading ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
            <Loader2 size={24} className="spinner text-navy" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Loading usage records from database...</p>
          </div>
        ) : historyRecords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>TRANSACTION ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>USAGE DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>PRINTER MODEL</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CARTRIDGE / PART NO.</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>COLOUR</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>QTY USED</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>LOCATION</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>REFERENCE / WO</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {historyRecords.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#64748B', fontSize: '0.75rem' }}>
                      #{item.id}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1E293B' }}>
                      {item.usageDate}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                      {item.printerModel || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="font-semibold text-navy">{item.partNumber || item.cartridgeName}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {item.colour ? (
                        <span
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: '700',
                            backgroundColor: item.colour === 'BLACK' ? '#F1F5F9' : item.colour === 'CYAN' ? '#ECFEFF' : item.colour === 'MAGENTA' ? '#FDF4FF' : '#FEFCE8',
                            color: item.colour === 'BLACK' ? '#0F172A' : item.colour === 'CYAN' ? '#0891B2' : item.colour === 'MAGENTA' ? '#C026D3' : '#CA8A04',
                            border: '1px solid currentColor'
                          }}
                        >
                          {item.colour}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#D4001F' }}>
                      {item.quantityUsed}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.75rem' }}>
                      {item.location} · {item.seatOrCabinNo}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>
                      {item.workOrderReference || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748B', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.remarks}>
                      {item.remarks || '—'}
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
              No Usage Records Found
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
              You have not submitted any consumable usage records yet. Click below to record your first cartridge usage.
            </p>
            <Link to="/user/usage" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', textDecoration: 'none' }}>
              <ClipboardEdit size={14} />
              <span>Record First Usage</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
