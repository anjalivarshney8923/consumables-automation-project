import React from 'react';
import {
  X,
  FileText,
  Calendar,
  User,
  ShieldCheck,
  Package,
  Printer,
  Building,
  MapPin,
  Mail,
  CheckCircle2,
  Clock,
  Layers,
  Hash
} from 'lucide-react';

export const AdminAssetUsageDetailModal = ({ usage, onClose }) => {
  if (!usage) return null;

  const usageIdDisplay = usage.usageId || (usage.id ? `USG-${String(usage.id).padStart(4, '0')}` : 'USG-AUDIT');
  const qtyUsed = Number(usage.quantityUsed || usage.quantity || usage.quantityChange) || 0;

  // Format Date & Time
  const formatDateTime = (val) => {
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
    <div className="modal-backdrop-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="modal-content-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '92%' }}
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
              <FileText size={22} />
            </div>
            <div>
              <h3 className="modal-title">Asset Usage Details</h3>
              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Audit ID: <strong style={{ color: 'var(--iocl-navy)' }}>{usageIdDisplay}</strong>
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
          {/* Top Banner: Quantity & Status */}
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
                Actual Quantity Consumed
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--iocl-navy, #002D62)' }}>
                  {qtyUsed}
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Units
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Transaction Status
              </span>
              <span
                className="status-badge"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ECFDF5',
                  color: '#065F46',
                  border: '1px solid #A7F3D0',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                <CheckCircle2 size={13} color="#059669" /> COMPLETED
              </span>
            </div>
          </div>

          {/* SECTION 1: ENGINEER INFORMATION */}
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
              <User size={16} color="var(--iocl-navy)" /> SUBMITTING ENGINEER / USER
            </h4>

            <div className="details-grid">
              <div className="details-item">
                <span className="item-label">
                  <User size={14} /> Engineer Name
                </span>
                <span className="item-value font-semibold">
                  {usage.recordedByEmployeeName || usage.engineerName || usage.performedBy || usage.userName || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <Hash size={14} /> Employee Number
                </span>
                <span className="item-value font-semibold text-navy">
                  {usage.recordedByEmployeeNo || usage.engineerEmployeeNo || usage.employeeNumber || usage.employeeId || '—'}
                </span>
              </div>

              {usage.engineerEmail && (
                <div className="details-item" style={{ gridColumn: 'span 2' }}>
                  <span className="item-label">
                    <Mail size={14} /> Engineer Email
                  </span>
                  <span className="item-value">
                    {usage.engineerEmail}
                  </span>
                </div>
              )}

              <div className="details-item">
                <span className="item-label">
                  <Calendar size={14} /> Usage Date & Time
                </span>
                <span className="item-value">
                  {formatDateTime(usage.usageDate || usage.transactionDate || usage.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: BENEFICIARY INFORMATION */}
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
              <ShieldCheck size={16} color="#059669" /> BENEFICIARY DETAILS (END USER)
            </h4>

            <div className="details-grid">
              <div className="details-item">
                <span className="item-label">
                  <User size={14} /> Beneficiary Name
                </span>
                <span className="item-value font-semibold">
                  {usage.beneficiaryEmployeeName || usage.beneficiaryName || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <Hash size={14} /> Beneficiary Emp ID
                </span>
                <span className="item-value font-semibold text-navy">
                  {usage.beneficiaryEmployeeNo || usage.employeeNo || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <Building size={14} /> Department
                </span>
                <span className="item-value font-semibold">
                  {usage.beneficiaryDepartment || usage.department || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <MapPin size={14} /> Seat / Cabin No.
                </span>
                <span className="item-value font-semibold">
                  {usage.beneficiarySeatOrCabinNo || usage.seatOrCabinNo || usage.cabinNumber || usage.seatNumber || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <MapPin size={14} /> Location / Office
                </span>
                <span className="item-value">
                  {usage.beneficiaryLocation || usage.location || '—'}
                </span>
              </div>

              {usage.beneficiaryEmail && (
                <div className="details-item">
                  <span className="item-label">
                    <Mail size={14} /> Beneficiary Email
                  </span>
                  <span className="item-value">
                    {usage.beneficiaryEmail}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 3: ASSET & CONSUMABLE INFORMATION */}
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
              <Package size={16} color="var(--iocl-navy)" /> ASSET / CONSUMABLE DETAILS
            </h4>

            <div className="details-grid">
              <div className="details-item">
                <span className="item-label">
                  <Package size={14} /> Part Number
                </span>
                <span className="item-value">
                  <span className="part-number-chip">
                    {usage.partNumber || usage.cartridgePartNumber || '—'}
                  </span>
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <Layers size={14} /> Cartridge Name
                </span>
                <span className="item-value font-semibold">
                  {usage.cartridgeName || usage.assetName || '—'}
                </span>
              </div>

              <div className="details-item">
                <span className="item-label">
                  <Printer size={14} /> Printer Model
                </span>
                <span className="item-value">
                  {usage.printerModel || usage.printerName || '—'}
                </span>
              </div>

              {usage.printerSerialNumber && (
                <div className="details-item">
                  <span className="item-label">
                    <Hash size={14} /> Printer Serial Number
                  </span>
                  <span className="item-value font-mono">
                    {usage.printerSerialNumber}
                  </span>
                </div>
              )}

              {usage.colour && (
                <div className="details-item">
                  <span className="item-label">
                    <Layers size={14} /> Colour
                  </span>
                  <span className="item-value font-semibold">
                    {usage.colour}
                  </span>
                </div>
              )}

              {usage.printerType && (
                <div className="details-item">
                  <span className="item-label">
                    <Printer size={14} /> Printer Type
                  </span>
                  <span className="item-value">
                    {usage.printerType}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 4: REMARKS & WORK ORDER REFERENCE */}
          {(usage.remarks || usage.workOrderReference) && (
            <div className="mb-2">
              <h4
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderBottom: '1px solid var(--border-color, #E2E8F0)',
                  paddingBottom: '6px'
                }}
              >
                <FileText size={16} /> REMARKS & REFERENCES
              </h4>

              {usage.workOrderReference && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>
                    Work Order Reference:
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {usage.workOrderReference}
                  </span>
                </div>
              )}

              {usage.remarks && (
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block' }}>
                    Remarks / Purpose:
                  </span>
                  <div
                    style={{
                      background: 'var(--bg-secondary, #F8FAFC)',
                      padding: '0.625rem 0.875rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color, #E2E8F0)',
                      marginTop: '4px'
                    }}
                  >
                    {usage.remarks}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            style={{
              padding: '8px 20px',
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

export default AdminAssetUsageDetailModal;
