import React from 'react';
import {
  FileSpreadsheet,
  AlertCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  FilterX
} from 'lucide-react';

export const ReportTable = ({
  reportType = 'ASSET_USAGE',
  data = [],
  loading = false,
  error = null,
  page = 0,
  size = 10,
  totalElements = 0,
  totalPages = 0,
  sortBy = '',
  sortDir = 'desc',
  onSort,
  onPageChange,
  onSizeChange,
  onRetry,
  onResetFilters
}) => {
  // Render Status Badge
  const renderStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    if (s === 'ACTIVE' || s === 'AVAILABLE' || s === 'COMPLETED' || s === 'NORMAL') {
      return <span className="status-badge status-active">{s}</span>;
    }
    if (s === 'INACTIVE' || s === 'OUT_OF_STOCK' || s === 'CRITICAL' || s === 'EXPIRED') {
      return <span className="status-badge status-danger">{s.replace('_', ' ')}</span>;
    }
    if (s === 'LOW_STOCK' || s === 'PARTIALLY_EXECUTED' || s === 'PENDING' || s === 'TENDERING_REQUIRED') {
      return <span className="status-badge status-warning">{s.replace('_', ' ')}</span>;
    }
    return <span className="status-badge status-default">{s || '--'}</span>;
  };

  // Header Column with Sort Trigger
  const renderSortableHeader = (label, fieldKey, align = 'left') => (
    <th
      style={{ textAlign: align, cursor: onSort ? 'pointer' : 'default', userSelect: 'none' }}
      onClick={() => onSort && onSort(fieldKey)}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span>{label}</span>
        {onSort && <ArrowUpDown size={12} style={{ opacity: sortBy === fieldKey ? 1 : 0.4 }} />}
      </div>
    </th>
  );

  return (
    <div className="table-card">
      <div className="table-responsive" style={{ overflowX: 'auto', minHeight: '320px' }}>
        <table className="data-table" style={{ width: '100%', minWidth: '960px' }}>
          <thead>
            {/* 1. ASSET USAGE REPORT HEADERS */}
            {reportType === 'ASSET_USAGE' && (
              <tr>
                {renderSortableHeader('Usage ID', 'id')}
                {renderSortableHeader('Date', 'usageDate')}
                {renderSortableHeader('Engineer', 'recordedByEngineerName')}
                <th>Eng Emp No</th>
                {renderSortableHeader('Beneficiary', 'beneficiaryEmployeeName')}
                <th>Ben Emp No</th>
                {renderSortableHeader('Department', 'beneficiaryDepartment')}
                {renderSortableHeader('Part Number', 'partNumber')}
                <th>Cartridge Name</th>
                <th>Printer ID</th>
                <th style={{ textAlign: 'right' }}>Qty Used</th>
                <th>Seat / Cabin</th>
                <th>Location</th>
                <th>Remarks</th>
              </tr>
            )}

            {/* 2. STORE INVENTORY REPORT HEADERS */}
            {reportType === 'STORE_INVENTORY' && (
              <tr>
                {renderSortableHeader('Part Number', 'partNumber')}
                {renderSortableHeader('Cartridge / Asset', 'cartridgeName')}
                <th>Colour</th>
                <th style={{ textAlign: 'right' }}>Store Qty</th>
                <th style={{ textAlign: 'right' }}>Total RC</th>
                <th style={{ textAlign: 'right' }}>Qty Taken Vide WO</th>
                <th style={{ textAlign: 'right' }}>Net Available RC</th>
                <th style={{ textAlign: 'right' }}>Combined Net Qty</th>
                <th style={{ textAlign: 'right' }}>Threshold</th>
                <th style={{ textAlign: 'center' }}>Stock Status</th>
                <th>Location</th>
              </tr>
            )}

            {/* 3. PROCUREMENT / RATE CONTRACT HEADERS */}
            {reportType === 'PROCUREMENT' && (
              <tr>
                {renderSortableHeader('Rate Contract No.', 'contractNumber')}
                {renderSortableHeader('Part Number', 'partNumber')}
                <th>Description</th>
                {renderSortableHeader('Supplier', 'supplierName')}
                <th style={{ textAlign: 'right' }}>Contract Qty</th>
                <th style={{ textAlign: 'right' }}>Qty Taken Vide WO</th>
                <th style={{ textAlign: 'right' }}>Net Available RC</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            )}

            {/* 4. CALL-UP PO HEADERS */}
            {reportType === 'CALL_UP_PO' && (
              <tr>
                {renderSortableHeader('PO Number', 'poNumber')}
                {renderSortableHeader('PO Date', 'poDate')}
                <th>Rate Contract Ref</th>
                {renderSortableHeader('Part Number', 'partNumber')}
                <th>Supplier</th>
                <th style={{ textAlign: 'right' }}>Order Qty</th>
                <th style={{ textAlign: 'right' }}>Executed Qty</th>
                <th style={{ textAlign: 'right' }}>Remaining Qty</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            )}

            {/* 5. EMPLOYEE MASTER REPORT HEADERS */}
            {reportType === 'EMPLOYEE' && (
              <tr>
                {renderSortableHeader('Employee Number', 'employeeNumber')}
                {renderSortableHeader('Full Name', 'employeeName')}
                {renderSortableHeader('Department', 'department')}
                {renderSortableHeader('Designation', 'designation')}
                <th>GD</th>
                <th>Email</th>
                <th>Cabin / Room</th>
                <th>Location</th>
                <th>Assigned Printer</th>
                <th>Printer Serial No</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            )}

            {/* 6. STORE STOCK HISTORY HEADERS */}
            {reportType === 'STOCK_HISTORY' && (
              <tr>
                {renderSortableHeader('Date & Time', 'transactionDate')}
                {renderSortableHeader('Part Number', 'partNumber')}
                {renderSortableHeader('Type', 'transactionType')}
                <th>Reference</th>
                <th style={{ textAlign: 'right' }}>Qty In</th>
                <th style={{ textAlign: 'right' }}>Qty Out</th>
                <th style={{ textAlign: 'right' }}>Balance</th>
                <th>Source</th>
                <th>Remarks</th>
              </tr>
            )}
          </thead>

          <tbody>
            {/* LOADING STATE */}
            {loading && (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={`skeleton-${i}`} className="skeleton-row">
                    {Array.from({ length: 11 }).map((_, j) => (
                      <td key={`skel-cell-${j}`}>
                        <div
                          style={{
                            height: '16px',
                            background: '#E2E8F0',
                            borderRadius: '4px',
                            animation: 'pulse 1.5s infinite'
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}

            {/* ERROR STATE */}
            {!loading && error && (
              <tr>
                <td colSpan={14} style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={36} color="#DC2626" />
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                        Unable to Load Report Data
                      </h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                        {error}
                      </p>
                    </div>
                    {onRetry && (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={onRetry}
                        style={{ marginTop: '8px', padding: '6px 16px', fontSize: '0.8125rem' }}
                      >
                        Retry Request
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* EMPTY STATE */}
            {!loading && !error && (!data || data.length === 0) && (
              <tr>
                <td colSpan={14} style={{ textAlign: 'center', padding: '54px 24px' }}>
                  <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '50%',
                        background: 'rgba(0, 45, 98, 0.05)',
                        color: 'var(--iocl-navy)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FileSpreadsheet size={28} />
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: 'var(--iocl-navy)', fontSize: '1rem', fontWeight: 700 }}>
                        No Report Data Available
                      </h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8125rem', maxWidth: '380px' }}>
                        Configure desired filters above and click <strong>Generate Report</strong> to preview real operational records.
                      </p>
                    </div>
                    {onResetFilters && (
                      <button
                        type="button"
                        className="btn-filter-reset"
                        onClick={onResetFilters}
                        style={{ marginTop: '6px' }}
                      >
                        <FilterX size={14} />
                        <span>Clear All Filters</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}

            {/* REAL DATA ROWS */}
            {!loading && !error && data && data.length > 0 && (
              <>
                {data.map((row, idx) => (
                  <tr key={row.id || row.key || idx}>
                    {/* 1. ASSET USAGE ROWS */}
                    {reportType === 'ASSET_USAGE' && (
                      <>
                        <td style={{ fontWeight: 600, color: 'var(--iocl-navy)' }}>#{row.id}</td>
                        <td>{row.usageDate || '--'}</td>
                        <td style={{ fontWeight: 600 }}>{row.recordedByEngineerName || row.engineerName || '--'}</td>
                        <td><span className="code-badge">{row.recordedByEmployeeNo || row.engineerEmployeeNo || '--'}</span></td>
                        <td style={{ fontWeight: 600 }}>{row.beneficiaryEmployeeName || row.beneficiaryName || '--'}</td>
                        <td><span className="code-badge">{row.beneficiaryEmployeeNo || '--'}</span></td>
                        <td>{row.beneficiaryDepartment || row.department || '--'}</td>
                        <td><span className="code-badge">{row.partNumber || '--'}</span></td>
                        <td>{row.cartridgeName || '--'}</td>
                        <td>{row.printerId || row.printerName || '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.quantityUsed || 1}</td>
                        <td>{row.beneficiarySeatOrCabinNo || row.cabinNumber || '--'}</td>
                        <td>{row.beneficiaryLocation || row.location || '--'}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.remarks || '--'}</td>
                      </>
                    )}

                    {/* 2. STORE INVENTORY ROWS */}
                    {reportType === 'STORE_INVENTORY' && (
                      <>
                        <td><span className="code-badge">{row.partNumber || '--'}</span></td>
                        <td style={{ fontWeight: 600 }}>{row.cartridgeName || row.name || '--'}</td>
                        <td>{row.colour || '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.storeQuantity ?? '--'}</td>
                        <td style={{ textAlign: 'right' }}>{row.totalRcQuantity ?? '--'}</td>
                        <td style={{ textAlign: 'right' }}>{row.qtyTakenVideWO ?? '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>{row.netAvailableRc ?? '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--iocl-navy)' }}>{row.combinedNetQty ?? '--'}</td>
                        <td style={{ textAlign: 'right' }}>{row.thresholdLimit ?? '--'}</td>
                        <td style={{ textAlign: 'center' }}>{renderStatusBadge(row.status)}</td>
                        <td>{row.location || '--'}</td>
                      </>
                    )}

                    {/* 3. PROCUREMENT ROWS */}
                    {reportType === 'PROCUREMENT' && (
                      <>
                        <td style={{ fontWeight: 700, color: 'var(--iocl-navy)' }}>{row.contractNumber || row.rateContractNumber || '--'}</td>
                        <td><span className="code-badge">{row.partNumber || '--'}</span></td>
                        <td>{row.description || row.cartridgeName || '--'}</td>
                        <td style={{ fontWeight: 600 }}>{row.supplierName || row.vendorName || '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.contractQuantity ?? '--'}</td>
                        <td style={{ textAlign: 'right' }}>{row.qtyTakenVideWO ?? '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>{row.netAvailableRc ?? '--'}</td>
                        <td>{row.startDate || '--'}</td>
                        <td>{row.endDate || '--'}</td>
                        <td style={{ textAlign: 'center' }}>{renderStatusBadge(row.status)}</td>
                      </>
                    )}

                    {/* 4. CALL-UP PO ROWS */}
                    {reportType === 'CALL_UP_PO' && (
                      <>
                        <td style={{ fontWeight: 700, color: 'var(--iocl-navy)' }}>{row.poNumber || '--'}</td>
                        <td>{row.poDate || '--'}</td>
                        <td>{row.rateContractNumber || row.contractRef || '--'}</td>
                        <td><span className="code-badge">{row.partNumber || '--'}</span></td>
                        <td>{row.supplierName || '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.orderQuantity ?? '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#059669' }}>{row.executedQuantity ?? '--'}</td>
                        <td style={{ textAlign: 'right', color: '#D97706' }}>{row.remainingQuantity ?? '--'}</td>
                        <td style={{ textAlign: 'center' }}>{renderStatusBadge(row.status)}</td>
                      </>
                    )}

                    {/* 5. EMPLOYEE ROWS */}
                    {reportType === 'EMPLOYEE' && (
                      <>
                        <td><span className="code-badge" style={{ fontWeight: 700 }}>{row.employeeNumber || '--'}</span></td>
                        <td style={{ fontWeight: 600 }}>{row.employeeName || row.fullName || '--'}</td>
                        <td>{row.department || '--'}</td>
                        <td>{row.designation || '--'}</td>
                        <td>{row.gd || '--'}</td>
                        <td>{row.email || '--'}</td>
                        <td>{row.cabinNumber || row.seatNumber || '--'}</td>
                        <td>{row.location || '--'}</td>
                        <td>{row.printerName || '--'}</td>
                        <td><span className="code-badge">{row.printerSerialNumber || '--'}</span></td>
                        <td style={{ textAlign: 'center' }}>{renderStatusBadge(row.status)}</td>
                      </>
                    )}

                    {/* 6. STOCK HISTORY ROWS */}
                    {reportType === 'STOCK_HISTORY' && (
                      <>
                        <td>{row.transactionDate || '--'}</td>
                        <td><span className="code-badge">{row.partNumber || '--'}</span></td>
                        <td>{renderStatusBadge(row.transactionType)}</td>
                        <td style={{ fontWeight: 600 }}>{row.reference || '--'}</td>
                        <td style={{ textAlign: 'right', color: '#059669', fontWeight: 600 }}>{row.quantityIn > 0 ? `+${row.quantityIn}` : '--'}</td>
                        <td style={{ textAlign: 'right', color: '#DC2626', fontWeight: 600 }}>{row.quantityOut > 0 ? `-${row.quantityOut}` : '--'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{row.balance ?? '--'}</td>
                        <td>{row.source || '--'}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.remarks || '--'}</td>
                      </>
                    )}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION FOOTER */}
      <div className="table-pagination">
        <div className="pagination-info">
          <span>Showing</span>
          <select
            className="pagination-size-select"
            value={size}
            onChange={(e) => onSizeChange && onSizeChange(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            entries &bull; Total {totalElements.toLocaleString('en-IN')} records
          </span>
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-btn"
            disabled={page <= 0 || loading}
            onClick={() => onPageChange && onPageChange(page - 1)}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
            <span>Prev</span>
          </button>

          <span className="pagination-page-indicator">
            Page {totalPages === 0 ? 0 : page + 1} of {totalPages || 1}
          </span>

          <button
            type="button"
            className="pagination-btn"
            disabled={page >= totalPages - 1 || totalPages === 0 || loading}
            onClick={() => onPageChange && onPageChange(page + 1)}
            aria-label="Next Page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportTable;
