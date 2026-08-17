import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Database, Loader2, Inbox, Eye } from 'lucide-react';

/**
 * Real Procurement Register Table View
 * Displays real PostgreSQL Rate Contracts & Call-Up PO totals:
 * - Date
 * - Supplier
 * - Cartridge Part Number
 * - Rate Contract Qty
 * - Qty Already Executed
 * - Qty Taken Through WO
 * - Net Available Quantity
 * - Action (View Details)
 */
export const ProcurementRegisterPreview = ({ rateContracts = [], loading = false, error = null }) => {
  const navigate = useNavigate();

  return (
    <div className="procurement-table-card mt-6">
      <div className="table-card-header">
        <div className="table-header-title-group">
          <Table size={18} className="text-navy" />
          <div>
            <h3 className="table-card-title">Procurement Register</h3>
            <p className="table-card-subtitle">
              Live view of master Rate Contracts & Call-Up Work Orders stored in PostgreSQL
            </p>
          </div>
        </div>

        <div className="table-actions">
          <span className="badge-preview-tag" style={{ color: '#059669', borderColor: '#A7F3D0', backgroundColor: '#ECFDF5' }}>
            <Database size={12} style={{ display: 'inline', marginRight: '4px' }} />
            PostgreSQL Live Data
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="spinner text-navy" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Loading procurement register from database...</p>
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
            No procurement records currently exist in the database. Use the <strong>New Rate Contract Entry</strong> form above to create your first contract.
          </p>
        </div>
      ) : (
        <div className="table-responsive-wrapper">
          <table className="procurement-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Supplier Name</th>
                <th>Cartridge Part Number</th>
                <th>Printer / Model</th>
                <th className="text-right">Contract Qty</th>
                <th className="text-right">Qty Already Executed</th>
                <th className="text-right">Qty Taken vide WO</th>
                <th className="text-right">Net Available</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rateContracts.map((row) => (
                <tr key={row.id}>
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
                      onClick={() => navigate(`/admin/procurement/rate-contracts/${row.id}`)}
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
                      title="View Rate Contract & Call-Up PO History"
                    >
                      <Eye size={13} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-card-footer">
        <span>Total Rate Contracts: <strong>{rateContracts.length}</strong></span>
        <span className="text-muted text-xs">Real-time sync with PostgreSQL database</span>
      </div>
    </div>
  );
};
