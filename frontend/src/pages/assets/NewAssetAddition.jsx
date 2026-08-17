import React, { useState } from 'react';
import {
  Printer,
  Hash,
  Building2,
  Package,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  PlusCircle,
  Sparkles,
  Info,
  ShieldCheck,
  Palette,
  FileCheck
} from 'lucide-react';
import { CARTRIDGE_OPTIONS } from '../../constants/cartridgeOptions';

const DEPARTMENT_OPTIONS = [
  'IT Department',
  'Procurement Cell',
  'Finance Wing',
  'HR & Administration',
  'Operations Wing',
  'Executive Office',
  'Marketing Division',
  'Legal & Compliance',
  'Accounts Wing',
  'CAD Section'
];

const INITIAL_FORM_STATE = {
  modelName: '',
  serialNumber: '',
  department: '',
  cartridgePartNumber: '',
  printerType: 'Black & White',
  status: 'Active'
};

export const NewAssetAddition = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [validatedAsset, setValidatedAsset] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Field change handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null
      }));
    }

    // Dismiss existing success banner if user edits
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    // 1. Model Name
    if (!formData.modelName || !formData.modelName.trim()) {
      newErrors.modelName = 'Model name is required.';
    } else if (formData.modelName.trim().length < 2) {
      newErrors.modelName = 'Model name must be at least 2 characters.';
    }

    // 2. Serial Number
    if (!formData.serialNumber || !formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required.';
    } else if (formData.serialNumber.trim().length < 3) {
      newErrors.serialNumber = 'Serial number must be at least 3 characters.';
    }

    // 3. Department / Location
    if (!formData.department || !formData.department.trim()) {
      newErrors.department = 'Please select a department.';
    }

    // 4. Compatible Cartridge
    if (!formData.cartridgePartNumber || !formData.cartridgePartNumber.trim()) {
      newErrors.cartridgePartNumber = 'Please select a compatible cartridge.';
    }

    // 5. Printer Type
    if (!formData.printerType || !formData.printerType.trim()) {
      newErrors.printerType = 'Please select printer type.';
    }

    // 6. Initial Status
    if (!formData.status || !formData.status.trim()) {
      newErrors.status = 'Please select asset status.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler (Frontend Validation only)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const cleanData = {
        modelName: formData.modelName.trim(),
        serialNumber: formData.serialNumber.trim().toUpperCase(),
        department: formData.department.trim(),
        cartridgePartNumber: formData.cartridgePartNumber.trim(),
        printerType: formData.printerType.trim(),
        status: formData.status.trim(),
        registeredAt: new Date().toISOString()
      };

      setValidatedAsset(cleanData);
      setSuccessMessage('Asset details validated successfully.');

      // Scroll top smoothly to reveal notification
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset Handler
  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setValidatedAsset(null);
    setSuccessMessage(null);
  };

  return (
    <div className="procurement-page-container">
      {/* 1. Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--iocl-navy)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px -2px rgba(11, 37, 69, 0.25)'
              }}
            >
              <Package size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 className="page-title-text" style={{ margin: 0 }}>
                  New Asset Addition
                </h1>
                <span
                  style={{
                    fontSize: '0.6875rem',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    fontWeight: '800',
                    padding: '0.125rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  ASSET ONBOARDING
                </span>
              </div>
              <p className="page-subtitle-text" style={{ marginTop: '0.25rem' }}>
                Onboard a new printer asset into the fleet registry
              </p>
            </div>
          </div>
        </div>

        {/* Action button header badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.4375rem 0.875rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#475569',
              fontWeight: '600'
            }}
          >
            <ShieldCheck size={16} color="var(--iocl-saffron)" />
            <span>Fleet Inventory Registry</span>
          </div>
        </div>
      </header>

      {/* 2. Success Validation Notification Banner */}
      {successMessage && validatedAsset && (
        <div
          className="mb-6"
          style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.08)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#166534', margin: 0 }}>
                  {successMessage}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#15803D', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                  All required printer asset specifications have been verified against frontend rules and are ready for fleet registry integration.
                </p>

                {/* Validated Asset Summary Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                    <strong>Model:</strong> {validatedAsset.modelName}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                    <strong>Serial:</strong> <span style={{ fontFamily: 'monospace' }}>{validatedAsset.serialNumber}</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                    <strong>Dept:</strong> {validatedAsset.department}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                    <strong>Cartridge:</strong> {validatedAsset.cartridgePartNumber}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                    <strong>Type:</strong> {validatedAsset.printerType}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #86EFAC' }}>
                    <strong>Status:</strong> {validatedAsset.status}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '0.375rem 0.75rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #86EFAC',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#166534',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem'
              }}
            >
              <PlusCircle size={14} />
              <span>Register Another Asset</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Form Card */}
      <div
        className="form-card mb-6"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden'
        }}
      >
        {/* Form Card Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <FileCheck size={20} color="var(--iocl-navy)" />
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
                Printer Asset Registration Form
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Fill in the asset technical details below. All fields marked with * are required.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: '700', color: '#DC2626', backgroundColor: '#FEF2F2', padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #FECACA' }}>
              * Required Fields
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate style={{ padding: '1.75rem 1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem 1.75rem'
            }}
          >
            {/* Field A: MODEL NAME */}
            <div className="form-group">
              <label
                htmlFor="modelName"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  marginBottom: '0.375rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                <Printer size={15} color="#64748B" />
                <span>MODEL NAME</span>
                <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="modelName"
                  name="modelName"
                  type="text"
                  placeholder="e.g. HP LaserJet Pro M404n"
                  value={formData.modelName}
                  onChange={(e) => handleInputChange('modelName', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.modelName ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.modelName ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                />
              </div>
              {errors.modelName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                  <AlertCircle size={13} />
                  <span>{errors.modelName}</span>
                </div>
              )}
            </div>

            {/* Field B: SERIAL NUMBER */}
            <div className="form-group">
              <label
                htmlFor="serialNumber"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  marginBottom: '0.375rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                <Hash size={15} color="#64748B" />
                <span>SERIAL NUMBER</span>
                <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="serialNumber"
                  name="serialNumber"
                  type="text"
                  placeholder="e.g. VNB3K12345"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.serialNumber ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.serialNumber ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    color: '#0F172A',
                    outline: 'none',
                    transition: 'border-color 0.15s ease'
                  }}
                />
              </div>
              {errors.serialNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                  <AlertCircle size={13} />
                  <span>{errors.serialNumber}</span>
                </div>
              )}
            </div>

            {/* Field C: DEPARTMENT / LOCATION */}
            <div className="form-group">
              <label
                htmlFor="department"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  marginBottom: '0.375rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                <Building2 size={15} color="#64748B" />
                <span>DEPARTMENT / LOCATION</span>
                <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.department ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.department ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: formData.department ? '#0F172A' : '#64748B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">— Select Department —</option>
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                  <AlertCircle size={13} />
                  <span>{errors.department}</span>
                </div>
              )}
            </div>

            {/* Field D: COMPATIBLE CARTRIDGE */}
            <div className="form-group">
              <label
                htmlFor="cartridgePartNumber"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  marginBottom: '0.375rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                <Layers size={15} color="#64748B" />
                <span>COMPATIBLE CARTRIDGE</span>
                <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="cartridgePartNumber"
                  name="cartridgePartNumber"
                  value={formData.cartridgePartNumber}
                  onChange={(e) => handleInputChange('cartridgePartNumber', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.cartridgePartNumber ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.cartridgePartNumber ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: formData.cartridgePartNumber ? '#0F172A' : '#64748B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">— Select Cartridge —</option>
                  {CARTRIDGE_OPTIONS.map((cartridge) => (
                    <option key={cartridge} value={cartridge}>
                      {cartridge}
                    </option>
                  ))}
                </select>
              </div>
              {errors.cartridgePartNumber && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                  <AlertCircle size={13} />
                  <span>{errors.cartridgePartNumber}</span>
                </div>
              )}
            </div>

            {/* Field E: PRINTER TYPE */}
            <div className="form-group">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  marginBottom: '0.375rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                <Palette size={15} color="#64748B" />
                <span>PRINTER TYPE</span>
                <span style={{ color: '#DC2626' }}>*</span>
              </label>
              
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  height: '42px'
                }}
              >
                {/* Option 1: Black & White */}
                <button
                  type="button"
                  onClick={() => handleInputChange('printerType', 'Black & White')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: formData.printerType === 'Black & White' ? 'var(--iocl-navy)' : '#CBD5E1',
                    backgroundColor: formData.printerType === 'Black & White' ? '#F1F5F9' : '#FFFFFF',
                    color: formData.printerType === 'Black & White' ? 'var(--iocl-navy)' : '#64748B',
                    fontSize: '0.8125rem',
                    fontWeight: formData.printerType === 'Black & White' ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: '#0F172A',
                      display: 'inline-block'
                    }}
                  />
                  <span>Black & White</span>
                </button>

                {/* Option 2: Color */}
                <button
                  type="button"
                  onClick={() => handleInputChange('printerType', 'Color')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: formData.printerType === 'Color' ? 'var(--iocl-saffron)' : '#CBD5E1',
                    backgroundColor: formData.printerType === 'Color' ? '#FFF7ED' : '#FFFFFF',
                    color: formData.printerType === 'Color' ? '#C2410C' : '#64748B',
                    fontSize: '0.8125rem',
                    fontWeight: formData.printerType === 'Color' ? '700' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #EF4444 0%, #3B82F6 50%, #10B981 100%)',
                      display: 'inline-block'
                    }}
                  />
                  <span>Color</span>
                </button>
              </div>

              {errors.printerType && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                  <AlertCircle size={13} />
                  <span>{errors.printerType}</span>
                </div>
              )}
            </div>

            {/* Field F: INITIAL STATUS */}
            <div className="form-group">
              <label
                htmlFor="status"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: 'var(--iocl-navy)',
                  marginBottom: '0.375rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                <Activity size={15} color="#64748B" />
                <span>INITIAL STATUS</span>
                <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.status ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.status ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {errors.status && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                  <AlertCircle size={13} />
                  <span>{errors.status}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div
            style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.875rem',
              flexWrap: 'wrap'
            }}
          >
            {/* Secondary Action: Reset */}
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>

            {/* Primary Action: Register Asset */}
            <button
              type="submit"
              style={{
                padding: '0.625rem 1.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#C53030', // IndianOil Red primary action
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(197, 48, 48, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <PlusCircle size={18} />
              <span>Register Asset</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Information Callout: Architecture & Lifecycle */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#FFF7ED',
            color: 'var(--iocl-saffron)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Info size={18} />
        </div>
        <div>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1E293B', margin: 0 }}>
            Asset Onboarding & Fleet Lifecycle Notice
          </h4>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem', marginBottom: 0, lineHeight: '1.4' }}>
            Registering a printer asset onboards its unique serial number into the central IOCL fleet. Consumable replenishment and rate contracts remain independently tracked under the Procurement Register and Threshold modules.
          </p>
        </div>
      </div>
    </div>
  );
};
