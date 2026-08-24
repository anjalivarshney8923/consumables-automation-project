import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Loader2, Inbox, Eye, ChevronRight, ChevronDown, History } from 'lucide-react';
import { ProcurementRowHistory } from './ProcurementRowHistory';

/**
 * Real Procurement Register Table View with Expandable PostgreSQL PO History
 * Displays real PostgreSQL Rate Contracts & Call-Up PO totals:
 * - Date
 * - Supplier
 * - Cartridge Part Number
 * - Rate Contract Qty
 * - Qty Already Executed
 * - Qty Taken Through WO
 * - Net Available Quantity
 * - Expandable Row: Shows real Call-Up PO transaction audit trail from PostgreSQL
 */
export const ProcurementRegisterPreview = ({ rateContracts = [], loading = false, error = null }) => {
  const navigate = useNavigate();
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRowExpansion = (rowId) => {
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  };

  return (
    <div className="procurement-table-card mt-6">
      <div className="table-card-header">
        <div className="table-header-title-group">
          <Table size={18} className="text-navy" />
          <div>
            <h3 className="table-card-title">Procurement Register</h3>
            <p className="table-card-subtitle">
              Live view of master Rate Contracts & Call-Up Work Orders — click any row to inspect historical PO transactions
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spinner text-navy" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Loading procurement register...</p>
        </div>
      ) : error ? (
        <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--iocl-red)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{error}</p>
        </div>
      ) : rateContracts.length === 0 ? (
        <div className="empty-state-box" style={{ margin: '1.5rem', background: '#FFFFFF' }}>
          <div className="empty-state-icon">
            <Inbox size={24} />
          </div>
          <h4 className="empty-state-title">No Rate Contracts Found</h4>
          <p className="empty-state-desc">
            No procurement records currently exist. Use the <strong>New Rate Contract Entry</strong> form above to create your first contract.
          </p>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="procurement-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}></th>
                <th>Date</th>
                <th>Supplier Name</th>
                <th>Cartridge Part Number</th>
                <th>Printer / Model</th>
                <th className="text-right">Contract Qty</th>
                <th className="text-right">Qty Already Executed</th>
                <th className="text-right">Qty Taken vide WO</th>
                <th className="text-right">Net Available in RC</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rateContracts.map((row) => {
                const isExpanded = expandedRowId === row.id;
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() => toggleRowExpansion(row.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? '#EFF6FF' : undefined,
                        borderBottom: isExpanded ? '1px solid #BFDBFE' : undefined,
                        transition: 'background-color 0.15s ease'
                      }}
                      className="table-row-hover"
                      title="Click to expand/collapse PO transaction history"
                    >
                      {/* Expand / Collapse Indicator */}
                      <td style={{ textAlign: 'center', color: isExpanded ? '#1E40AF' : '#64748B' }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpansion(row.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isExpanded ? '#1E40AF' : '#94A3B8'
                          }}
                          aria-label={isExpanded ? 'Collapse PO History' : 'Expand PO History'}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </td>
                      <td>
                        <span className="font-medium text-primary">{row.contractDate}</span>
                      </td>
                      <td>
                        <span className="font-semibold text-navy">{row.supplierName}</span>
                      </td>
                      <td>
                        <span className="part-number-chip">
                          {row.cartridge?.partNumber || row.cartridge?.cartridgeName || 'N/A'}
                        </span>
                      </td>
                      <td className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {row.cartridge?.printerName || 'N/A'}
                      </td>
                      <td className="text-right font-medium">
                        {row.totalContractQuantity}
                      </td>
                      <td className="text-right font-medium text-muted">
                        {row.quantityAlreadyExecuted}
                      </td>
                      <td className="text-right font-medium text-saffron">
                        {row.quantityTakenThroughWO}
                      </td>
                      <td className="text-right font-bold text-success">
                        {row.netAvailableQuantity}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/procurement/rate-contracts/${row.id}`);
                          }}
                          style={{
                            padding: '0.3125rem 0.625rem',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#1E40AF',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            transition: 'all 0.15s ease'
                          }}
                          title="View Rate Contract & Call-Up PO Details"
                        >
                          <Eye size={13} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>

                    {/* Expandable PO History Row */}
                    {isExpanded && (
                      <tr key={`history-${row.id}`}>
                        <td colSpan={10} style={{ padding: 0, borderTop: 'none', backgroundColor: '#F8FAFC' }}>
                          <ProcurementRowHistory
                            rateContractId={row.id}
                            supplierName={row.supplierName}
                            partNumber={row.cartridge?.partNumber || row.cartridge?.cartridgeName}
                            cartridgeId={row.cartridge?.id}
                            initialNetAvailable={row.netAvailableQuantity}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-card-footer">
        <span>Total Rate Contracts: <strong>{rateContracts.length}</strong></span>
        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
          💡 Click any procurement row to inspect its historical Call-Up PO transactions
        </span>
      </div>
    </div>
  );
};
