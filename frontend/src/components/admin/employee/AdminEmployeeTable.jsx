import React, { useState } from 'react';
import {
  Eye,
  Edit,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  RefreshCw,
  Building,
  MapPin,
  Mail,
  Printer,
  CheckCircle2,
  XCircle,
  Hash
} from 'lucide-react';
import { AdminEmployeeDetailModal } from './AdminEmployeeDetailModal';
import { AdminEmployeeFormModal } from './AdminEmployeeFormModal';
import { AdminEmployeeDeactivateDialog } from './AdminEmployeeDeactivateDialog';

export const AdminEmployeeTable = ({
  employees = [],
  loading = false,
  error = null,
  currentPage = 1,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onClearFilters,
  onUpdateEmployee,
  onStatusChange,
  isProcessing = false
}) => {
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState(null);
  const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState(null);
  const [selectedEmployeeForDeactivate, setSelectedEmployeeForDeactivate] = useState(null);

  const startIndex = totalElements > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalElements);

  return (
    <div className="procurement-table-card">
      {/* Table Responsive Wrapper */}
      <div className="table-responsive-wrapper">
        <table className="procurement-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>Emp No.</th>
              <th>Name</th>
              <th>Designation</th>
              <th>GD</th>
              <th>Department</th>
              <th>Room / Cabin</th>
              <th>Email</th>
              <th>Printer</th>
              <th>Printer Serial No.</th>
              <th className="text-center">Status</th>
              <th className="text-center" style={{ minWidth: '150px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Skeleton Loading Rows
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={`skeleton-${idx}`} className="skeleton-row">
                  <td colSpan={11} style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ width: '80px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '130px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '110px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '50px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '120px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '70px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '140px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '90px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                      <div style={{ width: '70px', height: '18px', background: '#E2E8F0', borderRadius: '4px', animation: 'pulse 1.5s infinite', marginLeft: 'auto' }} />
                    </div>
                  </td>
                </tr>
              ))
            ) : error ? (
              // Error State
              <tr>
                <td colSpan={11} className="text-center py-8">
                  <div className="table-error-box" style={{ padding: '2.5rem 1rem', textAlign: 'center' }}>
                    <AlertCircle size={36} color="var(--iocl-red, #DC2626)" style={{ margin: '0 auto 0.75rem' }} />
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Unable to load employees.
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
            ) : employees.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={11} className="text-center py-8">
                  <div className="table-empty-box" style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
                    <Users size={42} color="var(--text-muted, #94A3B8)" style={{ margin: '0 auto 0.75rem', opacity: 0.7 }} />
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      No employees found.
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 1rem' }}>
                      Employee directory records will appear here. You can add new employee records or import them.
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
              employees.map((emp, idx) => {
                const empNo = emp.employeeNumber || emp.employeeId || '—';
                const name = emp.employeeName || emp.fullName || '—';
                const designation = emp.designation || '—';
                const gd = emp.gd || '—';
                const department = emp.department || '—';
                const cabin = emp.cabinNumber || emp.roomNumber || emp.seatOrCabinNo || '—';
                const email = emp.email || '—';
                const printer = emp.printerName || emp.printerModel || '—';
                const printerSerial = emp.printerSerialNumber || emp.serialNumber || '—';
                const isActive = emp.status !== 'INACTIVE' && emp.status !== false;

                return (
                  <tr key={emp.id || `emp-${idx}`} className="hover-row">
                    {/* Employee Number */}
                    <td style={{ fontWeight: 700, color: 'var(--iocl-navy)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                      {empNo}
                    </td>

                    {/* Name */}
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {name}
                      </span>
                    </td>

                    {/* Designation */}
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      {designation}
                    </td>

                    {/* GD */}
                    <td style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {gd}
                    </td>

                    {/* Department */}
                    <td style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                      {department}
                    </td>

                    {/* Room / Cabin */}
                    <td style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {cabin}
                    </td>

                    {/* Email */}
                    <td style={{ fontSize: '0.8125rem' }}>
                      {email !== '—' ? (
                        <span style={{ color: 'var(--text-secondary)' }}>{email}</span>
                      ) : (
                        '—'
                      )}
                    </td>

                    {/* Printer */}
                    <td style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                      {printer}
                    </td>

                    {/* Printer Serial No */}
                    <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {printerSerial}
                    </td>

                    {/* Status Badge */}
                    <td className="text-center">
                      <span
                        className="status-badge"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: isActive ? '#ECFDF5' : '#FEF2F2',
                          color: isActive ? '#065F46' : '#991B1B',
                          border: `1px solid ${isActive ? '#A7F3D0' : '#FECACA'}`,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.6875rem',
                          fontWeight: 700
                        }}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 size={11} color="#059669" /> ACTIVE
                          </>
                        ) : (
                          <>
                            <XCircle size={11} color="#DC2626" /> INACTIVE
                          </>
                        )}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="text-center">
                      <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                        {/* View Details */}
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => setSelectedEmployeeForView(emp)}
                          title="View Employee Profile"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '3px 7px',
                            background: 'rgba(0, 45, 98, 0.06)',
                            color: 'var(--iocl-navy, #002D62)',
                            border: '1px solid rgba(0, 45, 98, 0.15)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={12} /> View
                        </button>

                        {/* Edit Employee */}
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => setSelectedEmployeeForEdit(emp)}
                          title="Edit Employee"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '3px 7px',
                            background: 'rgba(217, 119, 6, 0.08)',
                            color: '#D97706',
                            border: '1px solid rgba(217, 119, 6, 0.25)',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <Edit size={12} /> Edit
                        </button>

                        {/* Deactivate / Reactivate Toggle */}
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => setSelectedEmployeeForDeactivate(emp)}
                          title={isActive ? 'Deactivate Employee' : 'Reactivate Employee'}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '3px 7px',
                            background: isActive ? 'rgba(220, 38, 38, 0.06)' : 'rgba(5, 150, 105, 0.06)',
                            color: isActive ? '#DC2626' : '#059669',
                            border: `1px solid ${isActive ? 'rgba(220, 38, 38, 0.2)' : 'rgba(5, 150, 105, 0.2)'}`,
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {isActive ? <UserX size={12} /> : <UserCheck size={12} />}
                          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
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
              Showing <strong>{startIndex}</strong>–<strong>{endIndex}</strong> of <strong>{totalElements}</strong> employees
            </span>
          ) : (
            <span>No employees to display</span>
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

      {/* View Details Modal */}
      {selectedEmployeeForView && (
        <AdminEmployeeDetailModal
          employee={selectedEmployeeForView}
          onClose={() => setSelectedEmployeeForView(null)}
          onEdit={(emp) => {
            setSelectedEmployeeForView(null);
            setSelectedEmployeeForEdit(emp);
          }}
        />
      )}

      {/* Edit Form Modal */}
      {selectedEmployeeForEdit && (
        <AdminEmployeeFormModal
          isOpen={Boolean(selectedEmployeeForEdit)}
          employee={selectedEmployeeForEdit}
          onClose={() => setSelectedEmployeeForEdit(null)}
          onSave={(data) => {
            if (onUpdateEmployee) {
              onUpdateEmployee(selectedEmployeeForEdit.id, data);
            }
            setSelectedEmployeeForEdit(null);
          }}
          isSaving={isProcessing}
        />
      )}

      {/* Deactivate / Reactivate Confirmation Dialog */}
      {selectedEmployeeForDeactivate && (
        <AdminEmployeeDeactivateDialog
          isOpen={Boolean(selectedEmployeeForDeactivate)}
          employee={selectedEmployeeForDeactivate}
          onClose={() => setSelectedEmployeeForDeactivate(null)}
          onConfirm={(emp, newStatus) => {
            if (onStatusChange) {
              onStatusChange(emp.id, newStatus);
            }
            setSelectedEmployeeForDeactivate(null);
          }}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default AdminEmployeeTable;
