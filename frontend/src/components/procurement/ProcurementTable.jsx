import React, { useState } from 'react';
import { Eye, ChevronLeft, ChevronRight, Inbox, AlertCircle, ChevronDown } from 'lucide-react';
import { ProcurementStatusBadge } from './ProcurementStatusBadge';
import { ProcurementDetailsModal } from './ProcurementDetailsModal';
import { ProcurementRowHistory } from './ProcurementRowHistory';

export const ProcurementTable = ({
  records = [],
  loading = false,
  error = null,
  currentPage = 1,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onClearFilters
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRowExpansion = (rowId) => {
    setExpandedRowId((prev) => (prev === rowId ? null : rowId));
  };

  const startIndex = totalElements > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  return (
    <div className="procurement-table-card">
      {/* Table Content Area */}
      <div className="table-responsive-wrapper">
        <table className="procurement-table">
          <thead>
            <tr>
              <th style={{ width: '36px', textAlign: 'center' }}></th>
              <th>Date</th>
              <th>Supplier Name</th>
              <th>Printer Name</th>
              <th>Cartridge Name</th>
              <th>Part Number</th>
              <th className="text-right">Contract Qty</th>
              <th className="text-right">Executed</th>
              <th className="text-right">WO Qty</th>
              <th className="text-right">Net Available in RC</th>
              <th className="text-right">Rate (₹)</th>
              <th className="text-right">Tax</th>
              <th className="text-center">Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={14} className="text-center py-8">
                  <div className="table-loading-box" style={{ padding: '2rem 0', textAlign: 'center' }}>
                    <div className="spinner text-navy mb-2" style={{ margin: '0 auto 0.5rem' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      Loading procurement records...
                    </span>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={14} className="text-center py-8">
                  <div className="table-error-box" style={{ padding: '2rem 0', textAlign: 'center' }}>
                    <AlertCircle size={24} className="text-danger mb-2" style={{ margin: '0 auto 0.5rem' }} />
                    <p className="font-semibold text-danger">{error}</p>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={14} className="text-center py-8">
                  <div className="empty-state-box" style={{ background: '#FFFFFF', border: 'none' }}>
                    <div className="empty-state-icon">
                      <Inbox size={24} />
                    </div>
                    <h4 className="empty-state-title">No procurement records found</h4>
                    <p className="empty-state-desc">
                      No real procurement records matched your search or filter criteria. Try adjusting your parameters.
                    </p>
                    {onClearFilters && (
                      <button
                        type="button"
                        className="btn-secondary mt-3"
                        onClick={onClearFilters}
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              records.map((row) => {
                const isExpanded = expandedRowId === row.id;
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className="table-row-hover"
                      onClick={() => toggleRowExpansion(row.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? '#EFF6FF' : undefined
                      }}
                      title="Click to expand/collapse PO transaction history"
                    >
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
                        >
                          {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                        </button>
                      </td>
                      <td>
                        <span className="font-medium text-primary">{row.date || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="font-semibold text-navy">{row.supplierName || 'N/A'}</span>
                      </td>
                      <td className="text-secondary" style={{ fontSize: '0.8125rem' }}>
                        {row.printerName || 'N/A'}
                      </td>
                      <td>
                        <span className="font-medium">{row.cartridgeName || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="part-number-chip">{row.cartridgePartNumber || 'N/A'}</span>
                      </td>
                      <td className="text-right font-medium">
                        {row.contractQuantity}
                      </td>
                      <td className="text-right font-medium text-muted">
                        {row.executedQuantity}
                      </td>
                      <td className="text-right font-medium text-saffron">
                        {row.callUpPoQuantity}
                      </td>
                      <td className="text-right font-bold text-success">
                        {row.netAvailableQuantity}
                      </td>
                      <td className="text-right font-medium">
                        ₹ {Number(row.ratePerUnit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-right text-muted">
                        {row.tax}%
                      </td>
                      <td className="text-center">
                        <ProcurementStatusBadge status={row.status} />
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn-view-details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(row);
                          }}
                          title="View full record details"
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>
                      </td>
                    </tr>

                    {/* Expanded PO History Row */}
                    {isExpanded && (
                      <tr key={`history-${row.id}`}>
                        <td colSpan={14} style={{ padding: 0, borderTop: 'none', backgroundColor: '#F8FAFC' }}>
                          <ProcurementRowHistory
                            rateContractId={row.id}
                            supplierName={row.supplierName}
                            partNumber={row.cartridgePartNumber}
                            cartridgeId={row.cartridgeId}
                            initialNetAvailable={row.netAvailableQuantity}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && !error && totalElements > 0 && (
        <div className="table-card-footer">
          <span>
            Showing <strong>{startIndex}</strong>–<strong>{endIndex}</strong> of <strong>{totalElements}</strong> records
          </span>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-btn"
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    className={`pagination-num-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => onPageChange && onPageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="pagination-btn"
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Record Details Modal */}
      {selectedRecord && (
        <ProcurementDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};
