import React from 'react';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

export const AdminEmployeeDeactivateDialog = ({
  isOpen,
  employee,
  onClose,
  onConfirm,
  isProcessing = false
}) => {
  if (!isOpen || !employee) return null;

  const isCurrentlyActive = employee.status !== 'INACTIVE' && employee.status !== false;
  const actionText = isCurrentlyActive ? 'Deactivate' : 'Reactivate';

  return (
    <div className="modal-backdrop-overlay" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="modal-content-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '92%' }}
      >
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
          <div className="modal-title-group">
            <div
              className="modal-icon-badge"
              style={{
                background: isCurrentlyActive ? '#FEF2F2' : '#ECFDF5',
                color: isCurrentlyActive ? '#DC2626' : '#059669'
              }}
            >
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="modal-title" style={{ color: isCurrentlyActive ? '#DC2626' : '#059669' }}>
                {actionText} Employee?
              </h3>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '1rem 1.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Are you sure you want to {actionText.toLowerCase()} <strong>{employee.employeeName || employee.fullName}</strong> (Emp No: <strong>{employee.employeeNumber || employee.employeeId}</strong>)?
          </p>

          <div
            style={{
              background: 'var(--bg-secondary, #F8FAFC)',
              border: '1px solid var(--border-color, #E2E8F0)',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)'
            }}
          >
            {isCurrentlyActive ? (
              <span>
                <strong>Note:</strong> Deactivating an employee prevents them from being selected for future Asset Usage transactions, while preserving all historical audit records.
              </span>
            ) : (
              <span>
                <strong>Note:</strong> Reactivating will make this employee available again in the Beneficiary Search directory for Asset Usage.
              </span>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '0.75rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn-primary"
            onClick={() => onConfirm(employee, isCurrentlyActive ? 'INACTIVE' : 'ACTIVE')}
            disabled={isProcessing}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              background: isCurrentlyActive ? '#DC2626' : '#059669',
              color: '#FFFFFF',
              border: 'none'
            }}
          >
            {isProcessing ? 'Processing...' : `Confirm ${actionText}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEmployeeDeactivateDialog;
