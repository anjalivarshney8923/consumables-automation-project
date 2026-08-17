import React, { useState, useEffect, useCallback } from 'react';
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
  FileCheck,
  RefreshCw,
  Loader2,
  Database
} from 'lucide-react';
import { getActiveCartridges } from '../../services/cartridgeService';
import { registerAsset } from '../../services/assetService';

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
  const [apiError, setApiError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Cartridge Master Data State from PostgreSQL
  const [cartridges, setCartridges] = useState([]);
  const [cartridgesLoading, setCartridgesLoading] = useState(true);
  const [cartridgesError, setCartridgesError] = useState(null);

  // Load real cartridges from backend
  const loadCartridgeMaster = useCallback(async () => {
    setCartridgesLoading(true);
    setCartridgesError(null);
    const res = await getActiveCartridges();
    if (res.success && res.data) {
      setCartridges(res.data);
    } else {
      setCartridgesError(res.message || 'Failed to load cartridge master data.');
    }
    setCartridgesLoading(false);
  }, []);

  useEffect(() => {
    loadCartridgeMaster();
  }, [loadCartridgeMaster]);

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

    // Dismiss banners if user modifies form
    if (successMessage) {
      setSuccessMessage(null);
    }
    if (apiError) {
      setApiError(null);
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

  // Submit Handler: Real HTTP POST to Spring Boot Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      modelName: formData.modelName.trim(),
      serialNumber: formData.serialNumber.trim().toUpperCase(),
      department: formData.department.trim(),
      compatibleCartridge: formData.cartridgePartNumber.trim(),
      printerType: formData.printerType === 'Color' ? 'COLOR' : 'BLACK_AND_WHITE',
      status: formData.status.toUpperCase().replace(/ /g, '_')
    };

    const res = await registerAsset(payload);
    setIsSubmitting(false);

    if (res.success && res.data) {
      setValidatedAsset(res.data);
      setSuccessMessage('Asset registered successfully.');
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setApiError(res.message || 'Failed to register asset. Please try again.');
      if (res.status === 409) {
        setErrors((prev) => ({
          ...prev,
          serialNumber: `An asset with serial number "${payload.serialNumber}" already exists.`
        }));
      } else if (res.errors) {
        setErrors(res.errors);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset Handler
  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setValidatedAsset(null);
    setSuccessMessage(null);
    setApiError(null);
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
                Onboard a new printer asset into the central PostgreSQL fleet registry
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

      {/* 2. Success Persistence Notification Banner */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#166534', margin: 0 }}>
                    {successMessage}
                  </h3>
                  {validatedAsset.id && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        backgroundColor: '#DCFCE7',
                        color: '#15803D',
                        fontWeight: '700',
                        padding: '0.125rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #86EFAC'
                      }}
                    >
                      Database ID #{validatedAsset.id}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#15803D', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                  The printer asset has been validated and permanently persisted in the PostgreSQL database.
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
                    <strong>Cartridge:</strong> {validatedAsset.cartridgeName || validatedAsset.cartridgePartNumber || validatedAsset.compatibleCartridge}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                    <strong>Type:</strong> {validatedAsset.printerType === 'COLOR' ? 'Color' : 'Black & White'}
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

      {/* 3. Error Banner */}
      {apiError && (
        <div
          className="mb-6"
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 2px 4px rgba(220, 38, 38, 0.05)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#991B1B' }}>
              {apiError}
            </span>
          </div>
        </div>
      )}

      {/* 4. Main Form Card */}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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

            {/* Field D: COMPATIBLE CARTRIDGE (Loaded dynamically from PostgreSQL) */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label
                  htmlFor="cartridgePartNumber"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: 'var(--iocl-navy)',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    margin: 0
                  }}
                >
                  <Layers size={15} color="#64748B" />
                  <span>COMPATIBLE CARTRIDGE</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>

                {cartridgesLoading && (
                  <span style={{ fontSize: '0.6875rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Loader2 size={11} className="animate-spin" /> Loading master...
                  </span>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  id="cartridgePartNumber"
                  name="cartridgePartNumber"
                  value={formData.cartridgePartNumber}
                  onChange={(e) => handleInputChange('cartridgePartNumber', e.target.value)}
                  disabled={isSubmitting || cartridgesLoading}
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
                    cursor: cartridgesLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  <option value="">
                    {cartridgesLoading ? 'Loading master records...' : '— Select Cartridge Master —'}
                  </option>
                  {cartridges.map((c) => (
                    <option key={c.id || c.partNumber} value={c.partNumber}>
                      {c.cartridgeName} ({c.partNumber})
                    </option>
                  ))}
                </select>
              </div>

              {cartridgesError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem' }}>
                  <span>{cartridgesError}</span>
                  <button
                    type="button"
                    onClick={loadCartridgeMaster}
                    style={{ background: 'none', border: 'none', color: '#1E40AF', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem', padding: 0 }}
                  >
                    Retry
                  </button>
                </div>
              )}

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
                  disabled={isSubmitting}
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
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
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
                  disabled={isSubmitting}
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
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
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
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
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
              disabled={isSubmitting}
              style={{
                padding: '0.625rem 1.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isSubmitting ? '#94A3B8' : '#C53030', // IndianOil Red
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: isSubmitting ? 'none' : '0 4px 6px -1px rgba(197, 48, 48, 0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <PlusCircle size={18} />
                  <span>Register Asset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 5. Information Callout: Fleet Lifecycle Notice */}
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
            Registering a printer asset onboards its unique serial number into the central IOCL PostgreSQL registry. Consumable replenishment and rate contracts remain independently tracked under the Procurement Register and Threshold modules.
          </p>
        </div>
      </div>
    </div>
  );
};
