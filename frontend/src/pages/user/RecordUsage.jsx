import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ClipboardEdit,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  FileText,
  TrendingDown,
  Info,
  PackageCheck
} from 'lucide-react';
import { CARTRIDGE_OPTIONS } from '../../constants/cartridgeOptions';

export const RecordUsage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedPoId = queryParams.get('poId');

  // Form State
  const [cartridge, setCartridge] = useState('');
  const [callUpPO, setCallUpPO] = useState(preselectedPoId || '');
  const [poDate, setPoDate] = useState('');
  const [poQuantity, setPoQuantity] = useState('');
  const [alreadyExecuted, setAlreadyExecuted] = useState(0);
  const [quantityToExecute, setQuantityToExecute] = useState('');
  const [executionDate, setExecutionDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');

  // UI / Status States
  const [errors, setErrors] = useState({});
  const [successNotice, setSuccessNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Remaining quantity calculated dynamically
  const remainingQuantity = poQuantity ? Math.max(0, Number(poQuantity) - Number(alreadyExecuted)) : null;

  // Handle Cartridge Change
  const handleCartridgeChange = (e) => {
    const selected = e.target.value;
    setCartridge(selected);
    setCallUpPO('');
    setPoDate('');
    setPoQuantity('');
    setAlreadyExecuted(0);
    setQuantityToExecute('');
    setErrors((prev) => ({ ...prev, cartridge: '', callUpPO: '' }));
    setSuccessNotice(null);
  };

  // Handle PO Selection Change (prepared for future API-driven selection)
  const handlePOChange = (e) => {
    const selectedPO = e.target.value;
    setCallUpPO(selectedPO);
    setSuccessNotice(null);
    setErrors((prev) => ({ ...prev, callUpPO: '', quantityToExecute: '' }));

    if (selectedPO) {
      // In frontend demonstration state: when user selects a demo PO
      // Future: Real data populated from GET /api/user/assigned-pos/:id
      setPoDate('2026-08-17');
      setPoQuantity(100);
      setAlreadyExecuted(20);
    } else {
      setPoDate('');
      setPoQuantity('');
      setAlreadyExecuted(0);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!cartridge) {
      newErrors.cartridge = 'Please select a cartridge.';
    }

    if (!callUpPO) {
      newErrors.callUpPO = 'Please select a Call-Up PO / Work Order.';
    }

    if (!quantityToExecute || isNaN(quantityToExecute)) {
      newErrors.quantityToExecute = 'Quantity to execute is required and must be a valid number.';
    } else {
      const numQty = Number(quantityToExecute);
      if (numQty <= 0) {
        newErrors.quantityToExecute = 'Quantity to execute must be greater than 0.';
      } else if (remainingQuantity !== null && numQty > remainingQuantity) {
        newErrors.quantityToExecute = `Quantity cannot exceed remaining PO quantity (${remainingQuantity} units).`;
      }
    }

    if (!executionDate) {
      newErrors.executionDate = 'Execution date is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler (Frontend validation only, no fake DB call)
  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessNotice(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate clean frontend confirmation without API
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessNotice({
        message: 'Usage entry validated successfully.',
        details: `Recorded ${quantityToExecute} units against ${callUpPO || 'Call-Up PO'} for ${cartridge}. (Frontend confirmation only — backend integration pending)`
      });
      setQuantityToExecute('');
      setRemarks('');
    }, 300);
  };

  // Reset Handler
  const handleReset = () => {
    setCartridge('');
    setCallUpPO('');
    setPoDate('');
    setPoQuantity('');
    setAlreadyExecuted(0);
    setQuantityToExecute('');
    setExecutionDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setErrors({});
    setSuccessNotice(null);
  };

  return (
    <div className="procurement-page-container">
      {/* Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 className="page-title-text">Record Cartridge Usage</h1>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: '#ECFDF5',
                color: '#047857',
                fontWeight: '800',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #A7F3D0'
              }}
            >
              STORE OPERATION
            </span>
          </div>
          <p className="page-subtitle-text">
            Record the quantity actually issued or consumed against a Call-Up PO.
          </p>
        </div>
      </header>

      {/* Success Notification Banner */}
      {successNotice && (
        <div
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}
        >
          <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#166534', margin: 0 }}>
              {successNotice.message}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#15803D', margin: '0.25rem 0 0' }}>
              {successNotice.details}
            </p>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <ClipboardEdit size={18} color="var(--iocl-navy)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
            Usage Execution Entry Form
          </h3>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.75rem 1.5rem' }} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* 1. Cartridge Dropdown */}
            <div className="form-group">
              <label htmlFor="usage-cartridge" className="form-label required">
                Cartridge
              </label>
              <select
                id="usage-cartridge"
                className={`form-input ${errors.cartridge ? 'error' : ''}`}
                value={cartridge}
                onChange={handleCartridgeChange}
              >
                <option value="">-- Select Cartridge --</option>
                {CARTRIDGE_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.cartridge && (
                <span className="form-error-message">{errors.cartridge}</span>
              )}
            </div>

            {/* 2. Call-Up PO / Work Order Dropdown */}
            <div className="form-group">
              <label htmlFor="usage-call-up-po" className="form-label required">
                Call-Up PO / Work Order
              </label>
              <select
                id="usage-call-up-po"
                className={`form-input ${errors.callUpPO ? 'error' : ''}`}
                value={callUpPO}
                onChange={handlePOChange}
                disabled={!cartridge}
              >
                <option value="">
                  {cartridge ? '-- Select Call-Up PO --' : '-- First Select Cartridge --'}
                </option>
                {cartridge && (
                  <>
                    <option value="PO-2026-001">PO-2026-001 (Assigned Qty: 100)</option>
                    <option value="PO-2026-002">PO-2026-002 (Assigned Qty: 50)</option>
                  </>
                )}
              </select>
              {errors.callUpPO && (
                <span className="form-error-message">{errors.callUpPO}</span>
              )}
            </div>
          </div>

          {/* 3. Read-Only PO Specifications */}
          <div
            style={{
              margin: '1.5rem 0',
              padding: '1.25rem',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--iocl-navy)', textTransform: 'uppercase', display: 'block', marginBottom: '0.875rem' }}>
              Selected Call-Up PO Specifications (Read-Only)
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {/* PO Date */}
              <div>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  PO Date
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', margin: '0.25rem 0 0' }}>
                  {poDate || '—'}
                </p>
              </div>

              {/* PO Quantity */}
              <div>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  PO Quantity
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: '0.25rem 0 0' }}>
                  {poQuantity ? `${poQuantity} units` : '—'}
                </p>
              </div>

              {/* Already Executed */}
              <div>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Qty Already Executed
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#EA580C', margin: '0.25rem 0 0' }}>
                  {poQuantity ? `${alreadyExecuted} units` : '—'}
                </p>
              </div>

              {/* Remaining Quantity */}
              <div>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Remaining Quantity
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '800', color: '#059669', margin: '0.25rem 0 0' }}>
                  {remainingQuantity !== null ? `${remainingQuantity} units` : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Quantity Visual Flow Card */}
          {remainingQuantity !== null && (
            <div
              style={{
                marginBottom: '1.5rem',
                padding: '1rem 1.25rem',
                backgroundColor: '#EFF6FF',
                borderRadius: '8px',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <span style={{ fontWeight: '700', color: '#1E40AF' }}>PO Qty: {poQuantity}</span>
                <span style={{ color: '#93C5FD' }}>→</span>
                <span style={{ fontWeight: '700', color: '#EA580C' }}>Executed: {alreadyExecuted}</span>
                <span style={{ color: '#93C5FD' }}>→</span>
                <span style={{ fontWeight: '800', color: '#047857' }}>Remaining: {remainingQuantity}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#1E40AF' }}>
                Max allocatable: <strong>{remainingQuantity}</strong> units
              </span>
            </div>
          )}

          {/* 5. Editable Execution Input Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {/* Quantity to Execute */}
            <div className="form-group">
              <label htmlFor="usage-quantity" className="form-label required">
                Quantity to Execute
              </label>
              <input
                id="usage-quantity"
                type="number"
                min="1"
                max={remainingQuantity !== null ? remainingQuantity : undefined}
                className={`form-input ${errors.quantityToExecute ? 'error' : ''}`}
                placeholder="e.g. 10"
                value={quantityToExecute}
                onChange={(e) => {
                  setQuantityToExecute(e.target.value);
                  if (errors.quantityToExecute) setErrors((prev) => ({ ...prev, quantityToExecute: '' }));
                }}
              />
              {errors.quantityToExecute && (
                <span className="form-error-message">{errors.quantityToExecute}</span>
              )}
            </div>

            {/* Execution Date */}
            <div className="form-group">
              <label htmlFor="usage-date" className="form-label required">
                Execution Date
              </label>
              <input
                id="usage-date"
                type="date"
                className={`form-input ${errors.executionDate ? 'error' : ''}`}
                value={executionDate}
                onChange={(e) => {
                  setExecutionDate(e.target.value);
                  if (errors.executionDate) setErrors((prev) => ({ ...prev, executionDate: '' }));
                }}
              />
              {errors.executionDate && (
                <span className="form-error-message">{errors.executionDate}</span>
              )}
            </div>
          </div>

          {/* 6. Remarks */}
          <div className="form-group" style={{ marginTop: '1.25rem' }}>
            <label htmlFor="usage-remarks" className="form-label">
              Remarks (Optional)
            </label>
            <textarea
              id="usage-remarks"
              rows={3}
              className="form-input"
              placeholder="Enter any relevant issuance or store execution remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* 7. Action Buttons */}
          <div
            style={{
              marginTop: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.875rem',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '1.25rem'
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                padding: '0.625rem 1.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <PackageCheck size={16} />
              <span>Record Usage</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
