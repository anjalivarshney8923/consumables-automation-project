import React, { useState, useEffect, useCallback } from 'react';
import {
  History,
  FileText,
  Building2,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  Inbox,
  CheckCircle2,
  Layers,
  TrendingDown,
  Hash,
  UserCheck,
  Calculator
} from 'lucide-react';
import { getRateContractProcurementHistory, getCartridgeProcurementHistory } from '../../services/procurementService';

/**
 * Real PostgreSQL PO History Component for Expanded Procurement Rows
 * Fetches and displays real historical Rate Contracts and Call-Up POs specifically
 * for the selected Rate Contract / Procurement relationship and Supplier,
 * showing the chronological running balance after each transaction.
 */
export const ProcurementRowHistory = ({
  rateContractId,
  procurementId,
  supplierName,
  partNumber,
  cartridgeId,
  initialNetAvailable
}) => {
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const effectiveRateContractId = rateContractId || procurementId;

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    let res = null;
    // Prioritize querying by specific Rate Contract / Procurement ID to isolate supplier's records
    if (effectiveRateContractId) {
      res = await getRateContractProcurementHistory(effectiveRateContractId);
    } else if (cartridgeId) {
      res = await getCartridgeProcurementHistory(cartridgeId);
    }

    if (res && res.success && res.data) {
      setHistoryData(res.data);
    } else {
      setError(res?.message || 'Unable to load PO history.');
    }
    setLoading(false);
  }, [effectiveRateContractId, cartridgeId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const rawItems = historyData?.history || [];
  
  // Safety filter: ensure history items strictly belong to the selected supplier / contract if available
  const activeSupplier = supplierName || historyData?.supplierName;
  const items = activeSupplier
    ? rawItems.filter((item) => !item.supplierName || item.supplierName.trim().toLowerCase() === activeSupplier.trim().toLowerCase())
    : rawItems;

  const totalContractQty = historyData?.totalContractQuantity !== undefined ? historyData.totalContractQuantity : 0;
  const totalTakenWO = historyData?.totalTakenThroughWO !== undefined ? historyData.totalTakenThroughWO : 0;
  const currentNet = historyData?.currentNetAvailable !== undefined
    ? historyData.currentNetAvailable
    : (initialNetAvailable !== undefined ? initialNetAvailable : (totalContractQty - totalTakenWO));

  return (
    <div
      className="procurement-expanded-history-container"
      style={{
        backgroundColor: '#F8FAFC',
        borderTop: '2px solid #3B82F6',
        borderBottom: '2px solid #CBD5E1',
        padding: '1.25rem 1.5rem',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #E2E8F0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1E40AF'
            }}
          >
            <History size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h4
                style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  fontWeight: '800',
                  color: 'var(--iocl-navy)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                PO Transaction History
              </h4>
              {partNumber && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: '#1E293B',
                    color: '#FFFFFF',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}
                >
                  {partNumber}
                </span>
              )}
              {activeSupplier && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    backgroundColor: '#FFF7ED',
                    color: '#C2410C',
                    border: '1px solid #FFEDD5',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <UserCheck size={12} />
                  <span>Supplier: {activeSupplier}</span>
                </span>
              )}
              {effectiveRateContractId && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                    border: '1px solid #E2E8F0',
                    padding: '0.125rem 0.4rem',
                    borderRadius: '4px',
                    fontFamily: 'monospace'
                  }}
                >
                  RC-{effectiveRateContractId}
                </span>
              )}
            </div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#64748B' }}>
              Chronological audit trail showing real running balance after each Call-Up PO transaction
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          disabled={loading}
          style={{
            padding: '0.3125rem 0.625rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#475569',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            transition: 'all 0.15s ease'
          }}
          title="Refresh History"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Body States */}
      {loading ? (
        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748B' }}>
          <Loader2 size={20} className="spinner" style={{ margin: '0 auto 0.5rem', color: '#1E40AF' }} />
          <p style={{ fontSize: '0.8125rem', fontWeight: '500', margin: 0 }}>
            Loading real PO transaction history...
          </p>
        </div>
      ) : error ? (
        <div
          style={{
            padding: '1.25rem',
            textAlign: 'center',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '8px',
            color: '#DC2626'
          }}
        >
          <AlertCircle size={20} style={{ margin: '0 auto 0.375rem' }} />
          <p style={{ fontSize: '0.8125rem', fontWeight: '600', margin: '0 0 0.5rem' }}>{error}</p>
          <button
            type="button"
            onClick={fetchHistory}
            style={{
              padding: '0.3125rem 0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #DC2626',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#DC2626',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            padding: '1.5rem',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px dashed #CBD5E1',
            color: '#64748B'
          }}
        >
          <Inbox size={22} style={{ margin: '0 auto 0.375rem', color: '#94A3B8' }} />
          <p style={{ fontSize: '0.8125rem', fontWeight: '600', margin: 0 }}>
            No previous Call-Up PO transactions recorded for this rate contract.
          </p>
        </div>
      ) : (
        <>
          {/* History Table */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1', color: 'var(--iocl-navy)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>DATE</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>TYPE</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>PO / REF NO.</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>SUPPLIER</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700', textAlign: 'right' }}>CONTRACT QTY</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700', textAlign: 'right' }}>EXECUTED</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700', textAlign: 'right' }}>TAKEN VIDE WO</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700', textAlign: 'right' }}>BALANCE AFTER TRANSACTION</th>
                  <th style={{ padding: '0.5rem 0.75rem', fontWeight: '700' }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => {
                  const isRC = row.recordType === 'RATE_CONTRACT';
                  return (
                    <tr
                      key={row.id ? `${row.recordType}-${row.id}-${idx}` : idx}
                      style={{
                        borderBottom: idx === items.length - 1 ? 'none' : '1px solid #F1F5F9',
                        backgroundColor: isRC ? '#FFFDF7' : '#FFFFFF',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: '#1E293B', whiteSpace: 'nowrap' }}>
                        {row.date ? new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
                        {isRC ? (
                          <span
                            style={{
                              backgroundColor: '#FEF3C7',
                              color: '#92400E',
                              border: '1px solid #FDE68A',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                              fontWeight: '700',
                              fontSize: '0.6875rem'
                            }}
                          >
                            Rate Contract
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#1E40AF',
                              border: '1px solid #BFDBFE',
                              padding: '0.125rem 0.375rem',
                              borderRadius: '4px',
                              fontWeight: '700',
                              fontSize: '0.6875rem'
                            }}
                          >
                            Call-Up PO
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', fontWeight: '600', color: isRC ? '#92400E' : '#0F172A' }}>
                        {row.poNumber || '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: '#334155' }}>
                        {row.supplierName || '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '500', color: '#475569' }}>
                        {row.contractQuantity !== null && row.contractQuantity !== undefined ? row.contractQuantity : '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '500', color: '#64748B' }}>
                        {row.quantityAlreadyExecuted !== null && row.quantityAlreadyExecuted !== undefined ? row.quantityAlreadyExecuted : '0'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '700', color: isRC ? '#94A3B8' : '#D97706' }}>
                        {isRC ? '—' : (row.quantityTakenThroughWO !== null && row.quantityTakenThroughWO !== undefined ? row.quantityTakenThroughWO : '0')}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: '800', color: '#16A34A' }}>
                        {row.netAvailableQuantity !== null && row.netAvailableQuantity !== undefined ? row.netAvailableQuantity : '—'}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', color: '#64748B', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.remarks || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* History Summary Footer with Breakdown */}
          <div
            style={{
              marginTop: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ color: '#475569' }}>
                Total Contract Qty: <strong style={{ color: '#0F172A' }}>{totalContractQty}</strong>
              </span>
              <span style={{ color: '#475569' }}>
                Total Taken vide WO: <strong style={{ color: '#D97706' }}>{totalTakenWO}</strong>
              </span>
              <span style={{ color: '#475569' }}>
                Total Transactions: <strong style={{ color: '#0F172A' }}>{items.length}</strong>
              </span>
              {historyData?.latestPODate && (
                <span style={{ color: '#475569' }}>
                  Latest PO Date:{' '}
                  <strong style={{ color: '#0F172A' }}>
                    {new Date(historyData.latestPODate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </strong>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{ color: '#64748B', fontWeight: '600' }}>Current Net Available:</span>
              <span
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '800',
                  color: '#166534',
                  backgroundColor: '#DCFCE7',
                  border: '1px solid #86EFAC',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '6px'
                }}
              >
                {currentNet} Units
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
