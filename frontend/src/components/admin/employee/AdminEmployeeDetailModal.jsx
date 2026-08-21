import React from 'react';
import {
  X,
  User,
  Hash,
  Mail,
  Building,
  Briefcase,
  MapPin,
  Printer,
  ShieldCheck,
  Tag,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const AdminEmployeeDetailModal = ({ employee, onClose, onEdit }) => {
  if (!employee) return null;

  const isActive = employee.status !== 'INACTIVE' && employee.status !== false;

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="modal-content-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div
              className="modal-icon-badge"
              style={{
                background: 'rgba(0, 45, 98, 0.1)',
                color: 'var(--iocl-navy, #002D62)'
              }}
            >
              <User size={22} />
            </div>
            <div>
              <h3 className="modal-title">Employee Details</h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Emp No: <strong style={{ color: 'var(--iocl-navy)' }}>{employee.employeeNumber || employee.employeeId || '—'}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {/* Top Banner: Employee Name & Status */}
          <div
            className="mb-5"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-secondary, #F8FAFC)',
              border: '1px solid var(--border-color, #E2E8F0)',
              borderRadius: '8px',
              padding: '1rem 1.25rem'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>
                Full Name & Designation
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--iocl-navy, #002D62)', margin: '2px 0 0 0' }}>
                {employee.employeeName || employee.fullName || '—'}
              </h2>
              {employee.designation && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {employee.designation} {employee.gd ? `(${employee.gd})` : ''}
                </span>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Directory Status
              </span>
              <span
                className="status-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: isActive ? '#ECFDF5' : '#FEF2F2',
                  color: isActive ? '#065F46' : '#991B1B',
                  border: `1px solid ${isActive ? '#A7F3D0' : '#FECACA'}`,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {isActive ? (
                  <>
                    <CheckCircle2 size={13} color="#059669" /> ACTIVE
                  </>
                ) : (
                  <>
                    <XCircle size={13} color="#DC2626" /> INACTIVE
                  </>
                )}
              </span>
            </div>
          </div>

          {/* SECTION 1: EMPLOYEE IDENTIFIERS */}
          <div className="mb-4">
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--iocl-navy)',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: '1px solid var(--border-color, #E2E8F0)',
                paddingBottom: '6px'
              }}
            >
              <ShieldCheck size={16} color="var(--iocl-navy)" /> EMPLOYEE INFORMATION
            </h4>

            <div className="details-grid">
              <div className="details-item">
                <span className="item-label">
                  <Hash size={14} /> Employee Number
                </span>
                <span className="item-value font-semibold text-navy">
                  {employee.employeeNumber || employee.employeeId || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <Building size={14} /> Department
                </span>
                <span className="item-value font-semibold">
                  {employee.department || '—'}
                </span>
              </div>

              <div className="details-item" style={{ gridColumn: 'span 2' }}>
                <span className="item-label">
                  <Mail size={14} /> Official Email
                </span>
                <span className="item-value">
                  {employee.email ? (
                    <a href={`mailto:${employee.email}`} style={{ color: 'var(--iocl-navy)', textDecoration: 'underline' }}>
                      {employee.email}
                    </a>
                  ) : '—'}
                </span>
              </div>

              {employee.gd && (
                <div className="details-item">
                  <span className="item-label">
                    <Tag size={14} /> Grade / GD
                  </span>
                  <span className="item-value">
                    {employee.gd}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: WORKPLACE LOCATION */}
          <div className="mb-4">
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#059669',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: '1px solid var(--border-color, #E2E8F0)',
                paddingBottom: '6px'
              }}
            >
              <MapPin size={16} color="#059669" /> WORKPLACE & CABIN DETAILS
            </h4>

            <div className="details-grid">
              <div className="details-item">
                <span className="item-label">
                  <MapPin size={14} /> Location / Office
                </span>
                <span className="item-value font-semibold">
                  {employee.location || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <Building size={14} /> Room / Cabin No.
                </span>
                <span className="item-value font-semibold text-navy">
                  {employee.cabinNumber || employee.roomNumber || employee.seatOrCabinNo || '—'}
                </span>
              </div>

              {employee.seatNumber && (
                <div className="details-item">
                  <span className="item-label">
                    <Tag size={14} /> Seat Number
                  </span>
                  <span className="item-value">
                    {employee.seatNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: ASSIGNED PRINTER INFORMATION */}
          <div className="mb-4">
            <h4
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: '#7C3AED',
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                borderBottom: '1px solid var(--border-color, #E2E8F0)',
                paddingBottom: '6px'
              }}
            >
              <Printer size={16} color="#7C3AED" /> ASSIGNED PRINTER & HARDWARE
            </h4>

            <div className="details-grid">
              <div className="details-item">
                <span className="item-label">
                  <Printer size={14} /> Printer Model / Name
                </span>
                <span className="item-value font-semibold">
                  {employee.printerName || employee.printerModel || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <Hash size={14} /> Printer Serial Number
                </span>
                <span className="item-value font-mono">
                  {employee.printerSerialNumber || employee.serialNumber || '—'}
                </span>
              </div>

              {employee.printerType && (
                <div className="details-item">
                  <span className="item-label">
                    <Printer size={14} /> Printer Type
                  </span>
                  <span className="item-value">
                    {employee.printerType}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: REMARKS */}
          {employee.remarks && (
            <div className="mb-2">
              <h4
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '1px solid var(--border-color, #E2E8F0)',
                  paddingBottom: '6px'
                }}
              >
                <FileText size={16} /> ADDITIONAL REMARKS
              </h4>

              <div
                style={{
                  background: 'var(--bg-secondary, #F8FAFC)',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color, #E2E8F0)'
                }}
              >
                {employee.remarks}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {onEdit && (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onClose();
                onEdit(employee);
              }}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                background: 'var(--iocl-navy, #002D62)',
                color: '#FFFFFF',
                border: 'none'
              }}
            >
              Edit Employee
            </button>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeDetailModal;
