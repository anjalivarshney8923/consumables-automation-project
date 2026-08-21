import React, { useState } from 'react';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Inbox,
  AlertCircle,
  RefreshCw,
  User,
  ShieldCheck,
  Package,
  Layers,
  Building,
  MapPin,
  FileText,
  Clock
} from 'lucide-react';
import { AdminAssetUsageDetailModal } from './AdminAssetUsageDetailModal';

export const AdminAssetUsageTable = ({
  records = [],
  loading = false,
  error = null,
  currentPage = 1,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onClearFilters
}) => {
  const [selectedUsage, setSelectedUsage] = useState(null);

  const startIndex = totalElements > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  // Format Date & Time for table
  const formatTableDateTime = (val) => {
    if (!val) return '—';
    try {
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [year, month, day] = val.split('-');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
      }
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return String(val);
    }
  };

  return (
    <div className="procurement-table-card">
      {/* Table Content Area */}
      <div className="table-responsive-wrapper">
        <table className="procurement-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Date & Time</th>
              <th>Usage ID</th>
              <th>Engineer (Submitted By)</th>
              <th>Beneficiary (End User)</th>
              <th>Part Number</th>
              <th>Asset / Cartridge</th>
              <th className="text-right">Qty Used</th>
              <th>Seat / Cabin</th>
              <th>Department & Location</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="skeleton-row">
                  <td colSpan={10} style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '110px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '80px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '140px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '140px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '90px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '120px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '50px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite', marginLeft: 'auto' }} />
                    </div>
                  </td>
                </tr>
              ))
            ) : error ? (
              // Error State
              <tr>
                <td colSpan={10} className="text-center py-8">
                  <div className="table-error-box" style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                    <AlertCircle size={36} color="var(--iocl-red, #DC2626)" style={{ margin: '0 auto 0.75rem' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Unable to load asset usage history
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      {error}
                    </p>
                    {onRetry && (
                      <button
                        type="button"
                        className="btn-retry"
                        onClick={onRetry}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 16px',
                          background: 'var(--iocl-navy, #002D62)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <RefreshCw size={14} /> Retry
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={10} className="text-center py-8">
                  <div className="table-empty-box" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <Inbox size={42} color="var(--text-muted, #94A3B8)" style={{ margin: '0 auto 0.75rem', opacity: 0.7 }} />
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      No asset usage records found.
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1rem' }}>
                      Consumable usage logged by maintenance engineers across the enterprise will appear here in chronological order.
                    </p>
                    {onClearFilters && (
                      <button
                        type="button"
                        className="btn-clear-filters"
                        onClick={onClearFilters}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
                          background: 'transparent',
                          color: 'var(--iocl-navy, #002D62)',
                          border: '1px solid var(--border-color, #CBD5E1)',
                          borderRadius: '6px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // Active Record Rows
              records.map((item, idx) => {
                const usageId = item.usageId || (item.id ? `USG-${String(item.id).padStart(4, '0')}` : `#${idx + 1}`);
                const qtyUsed = Number(item.quantityUsed || item.quantity || item.quantityChange) || 0;

                const engineerName = item.recordedByEmployeeName || item.engineerName || item.performedBy || item.userName || '—';
                const engineerEmpNo = item.recordedByEmployeeNo || item.engineerEmployeeNo || item.employeeNumber || item.employeeId || '—';

                const beneficiaryName = item.beneficiaryEmployeeName || item.beneficiaryName || '—';
                const beneficiaryEmpNo = item.beneficiaryEmployeeNo || item.employeeNo || '—';

                return (
                  <tr key={item.id || `usage-row-${idx}`} className="hover-row">
                    {/* Date & Time */}
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 500, fontSize: '0.8125rem' }}>
                      {formatTableDateTime(item.usageDate || item.transactionDate || item.createdAt)}
                    </td>

                    {/* Usage ID */}
                    <td style={{ fontWeight: 700, color: 'var(--iocl-navy)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {usageId}
                    </td>

                    {/* Engineer (Submitted By) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {engineerName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Emp ID: {engineerEmpNo}
                        </span>
                      </div>
                    </td>

                    {/* Beneficiary (End User) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: '#059669', fontSize: '0.875rem' }}>
                          {beneficiaryName}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Emp ID: {beneficiaryEmpNo}
                        </span>
                      </div>
                    </td>

                    {/* Part Number */}
                    <td>
                      <span className="part-number-chip">
                        {item.partNumber || item.cartridgePartNumber || '—'}
                      </span>
                    </td>

                    {/* Asset / Cartridge */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {item.cartridgeName || item.assetName || '—'}
                        </span>
                        {item.printerModel && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.printerModel}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Quantity Used */}
                    <td className="text-right" style={{ whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: '#D97706'
                        }}
                      >
                        {qtyUsed}
                      </span>
                    </td>

                    {/* Seat / Cabin */}
                    <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {item.beneficiarySeatOrCabinNo || item.seatOrCabinNo || item.cabinNumber || item.seatNumber || '—'}
                    </td>

                    {/* Department & Location */}
                    <td style={{ fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>
                          {item.beneficiaryDepartment || item.department || '—'}
                        </span>
                        {(item.beneficiaryLocation || item.location) && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.beneficiaryLocation || item.location}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn-table-action"
                        onClick={() => setSelectedUsage(item)}
                        title="View Complete Usage Details"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          background: 'rgba(0, 45, 98, 0.06)',
                          color: 'var(--iocl-navy, #002D62)',
                          border: '1px solid rgba(0, 45, 98, 0.15)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="table-card-footer">
        <div className="pagination-info">
          {totalElements > 0 ? (
            <span>
              Showing <strong>{startIndex}</strong>–<strong>{endIndex}</strong> of <strong>{totalElements}</strong> records
            </span>
          ) : (
            <span>No records to display</span>
          )}
        </div>

        <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Page Size Selector */}
          <div className="page-size-selector" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rows per page:</span>
            <select
              className="filter-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{ padding: '2px 8px', fontSize: '0.75rem', minWidth: '60px', height: '28px' }}
              aria-label="Rows per page"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Navigation Buttons */}
          <div className="pagination-buttons" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              aria-label="Previous Page"
            >
              <ChevronLeft size={16} />
              <span>Prev</span>
            </button>

            <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0 6px', color: 'var(--text-secondary)' }}>
              Page {currentPage} of {Math.max(totalPages, 1)}
            </span>

            <button
              type="button"
              className="pagination-btn"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              aria-label="Next Page"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedUsage && (
        <AdminAssetUsageDetailModal
          usage={selectedUsage}
          onClose={() => setSelectedUsage(null)}
        />
      )}
    </div>
  );
};

export default AdminAssetUsageTable;
