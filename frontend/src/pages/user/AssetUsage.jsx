import React, { useState, useEffect, useRef } from 'react';
import {
  ClipboardEdit,
  User,
  MapPin,
  Printer,
  Package,
  Palette,
  Hash,
  Calendar,
  FileText,
  ClipboardList,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Inbox,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAssets } from '../../services/assetService';
import { getActiveCartridges } from '../../services/cartridgeService';
import { recordAssetUsage, getUserUsageHistory } from '../../services/assetUsageService';

// Standard Department Master Options
const DEPARTMENT_OPTIONS = [
  'Operations',
  'Maintenance',
  'IT',
  'Administration',
  'Procurement',
  'Finance',
  'Stores',
  'Engineering',
  'Other'
];

// Standard Location Master Options
const LOCATION_OPTIONS = [
  'Head Office',
  'Regional Office',
  'Refinery',
  'Terminal',
  'Depot',
  'Other'
];

// Colour Palette Options for Color Printers
const COLOUR_OPTIONS = [
  { label: 'Black', value: 'BLACK', hex: '#0F172A' },
  { label: 'Cyan', value: 'CYAN', hex: '#06B6D4' },
  { label: 'Magenta', value: 'MAGENTA', hex: '#D946EF' },
  { label: 'Yellow', value: 'YELLOW', hex: '#EAB308' }
];

export const AssetUsage = () => {
  const { user } = useAuth();
  const formRef = useRef(null);

  // Reference Master Data from Backend
  const [printers, setPrinters] = useState([]);
  const [cartridges, setCartridges] = useState([]);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);
  const [masterDataError, setMasterDataError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    employeeNo: '',
    employeeName: '',
    department: '',
    seatOrCabinNo: '',
    location: '',
    printerId: '',
    printerType: 'Black & White',
    cartridgeId: '',
    colour: '',
    quantityUsed: '1',
    usageDate: new Date().toISOString().split('T')[0],
    remarks: '',
    workOrderReference: ''
  });

  // UI States
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // User Usage History from PostgreSQL
  const [recentUsages, setRecentUsages] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Load Real Assets, Cartridges, and User Usage History on Mount
  useEffect(() => {
    fetchMasterData();
    fetchUserUsageHistory();
  }, []);

  // Pre-fill user profile info from AuthContext
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        employeeNo: user.employeeId || user.employeeNo || user.username || '',
        employeeName: user.fullName || user.name || '',
        department: prev.department || (DEPARTMENT_OPTIONS.includes(user.department) ? user.department : (user.department || '')),
        location: prev.location || (LOCATION_OPTIONS.includes(user.location) ? user.location : (user.location || ''))
      }));
    }
  }, [user]);

  const fetchMasterData = async () => {
    setIsLoadingMasterData(true);
    setMasterDataError(null);
    try {
      const [assetRes, cartRes] = await Promise.all([
        getAssets('', 'ACTIVE'),
        getActiveCartridges()
      ]);

      if (assetRes.success && Array.isArray(assetRes.data)) {
        setPrinters(assetRes.data);
      } else {
        setPrinters([]);
      }

      if (cartRes.success && Array.isArray(cartRes.data)) {
        setCartridges(cartRes.data);
      } else {
        setCartridges([]);
      }
    } catch (err) {
      setMasterDataError('Failed to load master assets and cartridge catalog.');
    } finally {
      setIsLoadingMasterData(false);
    }
  };

  const fetchUserUsageHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getUserUsageHistory();
      if (res.success && Array.isArray(res.data)) {
        setRecentUsages(res.data);
      } else {
        setRecentUsages([]);
      }
    } catch {
      setRecentUsages([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle Input Changes with Automatic Printer Type & Colour Rules
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // When user selects a printer, auto-detect printer type from backend asset record
      if (field === 'printerId') {
        const selectedAsset = printers.find((p) => String(p.id) === String(value));
        if (selectedAsset) {
          const isColor = selectedAsset.printerType === 'COLOR' ||
            (selectedAsset.modelName && selectedAsset.modelName.toLowerCase().includes('color'));
          updated.printerType = isColor ? 'Color' : 'Black & White';
          if (!isColor) {
            updated.colour = '';
          }

          // If asset has a compatible cartridge, auto-suggest if available in cartridge list
          if (selectedAsset.compatibleCartridge && !prev.cartridgeId) {
            const matchedCart = cartridges.find(
              (c) => c.partNumber?.toLowerCase() === selectedAsset.compatibleCartridge?.toLowerCase()
            );
            if (matchedCart) {
              updated.cartridgeId = String(matchedCart.id);
            }
          }
        }
      }

      // If user toggles printer type to Black & White, clear colour
      if (field === 'printerType' && value === 'Black & White') {
        updated.colour = '';
      }

      return updated;
    });

    // Clear validation error for field
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (field === 'printerType' && value === 'Black & White') {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.colour;
        return next;
      });
    }

    if (submitError) setSubmitError(null);
    if (submitSuccess) setSubmitSuccess(null);
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.seatOrCabinNo || !formData.seatOrCabinNo.trim()) {
      newErrors.seatOrCabinNo = 'Seat or cabin number is required.';
    }

    if (!formData.location || !formData.location.trim()) {
      newErrors.location = 'Please select a location.';
    }

    if (!formData.printerId || !formData.printerId.trim()) {
      newErrors.printerId = 'Please select an assigned printer.';
    }

    if (!formData.cartridgeId || !formData.cartridgeId.trim()) {
      newErrors.cartridgeId = 'Please select a consumable cartridge.';
    }

    if (formData.printerType === 'Color') {
      if (!formData.colour || !formData.colour.trim()) {
        newErrors.colour = 'Please select a colour for the color printer.';
      }
    }

    if (!formData.quantityUsed || formData.quantityUsed.toString().trim() === '') {
      newErrors.quantityUsed = 'Quantity used is required.';
    } else {
      const num = Number(formData.quantityUsed);
      if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        newErrors.quantityUsed = 'Quantity used must be a positive whole number.';
      } else if (num > 1000) {
        newErrors.quantityUsed = 'Quantity used cannot exceed 1000 units.';
      }
    }

    if (!formData.usageDate || !formData.usageDate.trim()) {
      newErrors.usageDate = 'Usage date is required.';
    } else {
      const selected = new Date(formData.usageDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selected > today) {
        newErrors.usageDate = 'Usage date cannot be in the future.';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstField = Object.keys(newErrors)[0];
      const elem = document.getElementById(`field-${firstField}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elem.focus();
      }
      return false;
    }

    return true;
  };

  // Submit Handler: Real POST /api/user/asset-usage API Call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    const payload = {
      seatOrCabinNo: formData.seatOrCabinNo.trim(),
      location: formData.location.trim(),
      printerId: formData.printerId.trim(),
      printerType: formData.printerType,
      cartridgeId: formData.cartridgeId.trim(),
      colour: formData.printerType === 'Color' ? formData.colour.trim() : null,
      quantityUsed: parseInt(formData.quantityUsed, 10),
      usageDate: formData.usageDate,
      remarks: formData.remarks?.trim() || null,
      workOrderReference: formData.workOrderReference?.trim() || null,
      department: formData.department?.trim() || null
    };

    try {
      const result = await recordAssetUsage(payload);

      if (result.success && result.data) {
        setSubmitSuccess({
          message: 'Asset usage recorded successfully.',
          data: result.data
        });

        // Reset transaction-specific fields while preserving user identity
        setFormData((prev) => ({
          ...prev,
          seatOrCabinNo: '',
          printerId: '',
          printerType: 'Black & White',
          cartridgeId: '',
          colour: '',
          quantityUsed: '1',
          usageDate: new Date().toISOString().split('T')[0],
          remarks: '',
          workOrderReference: ''
        }));
        setErrors({});

        // Refresh usage history from PostgreSQL
        fetchUserUsageHistory();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSubmitError(result.message || 'Unable to record asset usage. Please try again.');
      }
    } catch (err) {
      setSubmitError('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Handler
  const handleReset = () => {
    setFormData({
      employeeNo: user?.employeeId || user?.employeeNo || user?.username || '',
      employeeName: user?.fullName || user?.name || '',
      department: DEPARTMENT_OPTIONS.includes(user?.department) ? user.department : (user?.department || ''),
      seatOrCabinNo: '',
      location: LOCATION_OPTIONS.includes(user?.location) ? user.location : (user?.location || ''),
      printerId: '',
      printerType: 'Black & White',
      cartridgeId: '',
      colour: '',
      quantityUsed: '1',
      usageDate: new Date().toISOString().split('T')[0],
      remarks: '',
      workOrderReference: ''
    });
    setErrors({});
    setSubmitSuccess(null);
    setSubmitError(null);
  };

  return (
    <div className="dashboard-container">
      {/* 1. Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <h1 className="page-title-text">ASSET USAGE</h1>
            <span
              style={{
                fontSize: '0.6875rem',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                fontWeight: '800',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #BFDBFE',
                letterSpacing: '0.04em'
              }}
            >
              USER PORTAL
            </span>
          </div>
          <p className="page-subtitle-text" style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--iocl-navy)' }}>
            Record Cartridge / Consumable Usage
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0' }}>
            Submit real consumable consumption records to update the central inventory and procurement register.
          </p>
        </div>

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
            <span>Authenticated Consumption Tracking</span>
          </div>
        </div>
      </header>

      {/* 2. Success Banner */}
      {submitSuccess && (
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
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#166534', margin: 0 }}>
                {submitSuccess.message}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#15803D', marginTop: '0.25rem', marginBottom: '0.75rem' }}>
                Usage record has been persisted in PostgreSQL and central quantities have been updated.
              </p>

              {/* Transaction Summary Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                  <strong>Cartridge:</strong> {submitSuccess.data.partNumber || submitSuccess.data.cartridgeName}
                </span>
                {submitSuccess.data.colour && (
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                    <strong>Colour:</strong> {submitSuccess.data.colour}
                  </span>
                )}
                <span style={{ fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#DCFCE7', color: '#166534', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #86EFAC' }}>
                  <strong>Quantity Used:</strong> {submitSuccess.data.quantityUsed} unit(s)
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                  <strong>Usage Date:</strong> {submitSuccess.data.usageDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Error Banner */}
      {submitError && (
        <div
          className="mb-6"
          style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={22} color="#DC2626" />
            <div>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#991B1B', margin: 0 }}>
                Submission Failed
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#B91C1C', margin: '0.25rem 0 0' }}>
                {submitError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Master Data Load Error */}
      {masterDataError && (
        <div
          className="mb-6"
          style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FDE68A',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#B45309', fontSize: '0.8125rem', fontWeight: '600' }}>
            <AlertCircle size={16} />
            <span>{masterDataError}</span>
          </div>
          <button
            type="button"
            onClick={fetchMasterData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.25rem 0.625rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FCD34D',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: '#92400E',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4. Main Form Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}
      >
        {/* Card Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
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
            <ClipboardEdit size={20} color="var(--iocl-navy)" />
            <div>
              <h2 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--iocl-navy)', margin: 0 }}>
                Asset Usage Entry Form
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Complete the four sections below to record consumable consumption
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                color: '#DC2626',
                backgroundColor: '#FEF2F2',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #FECACA'
              }}
            >
              * Required Fields
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form ref={formRef} onSubmit={handleSubmit} noValidate style={{ padding: '2rem 1.75rem' }}>

          {/* ============================================================
              SECTION 1: EMPLOYEE INFORMATION
              ============================================================ */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                paddingBottom: '0.75rem',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #F1F5F9'
              }}
            >
              <User size={18} color="var(--iocl-navy)" />
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '800',
                  color: 'var(--iocl-navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0
                }}
              >
                1. Employee Information (Authenticated)
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {/* Field: Employee No. (Derived from JWT) */}
              <div className="form-group">
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>Employee No.</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeNo}
                  disabled
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    fontSize: '0.875rem',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              {/* Field: Employee Name */}
              <div className="form-group">
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>Employee Name</span>
                </label>
                <input
                  type="text"
                  value={formData.employeeName}
                  disabled
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#F8FAFC',
                    fontSize: '0.875rem',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              {/* Field: Department */}
              <div className="form-group">
                <label
                  htmlFor="field-department"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>Department</span>
                </label>
                <select
                  id="field-department"
                  name="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.875rem',
                    color: formData.department ? '#0F172A' : '#64748B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Department</option>
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ============================================================
              SECTION 2: LOCATION INFORMATION
              ============================================================ */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                paddingBottom: '0.75rem',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #F1F5F9'
              }}
            >
              <MapPin size={18} color="var(--iocl-navy)" />
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '800',
                  color: 'var(--iocl-navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0
                }}
              >
                2. Location Details
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {/* Field: Seat No. / Cabin No. */}
              <div className="form-group">
                <label
                  htmlFor="field-seatOrCabinNo"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>Seat No. / Cabin No.</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-seatOrCabinNo"
                  name="seatOrCabinNo"
                  type="text"
                  placeholder="e.g. Cabin-402 or Seat A-12"
                  value={formData.seatOrCabinNo}
                  onChange={(e) => handleInputChange('seatOrCabinNo', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.seatOrCabinNo ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.seatOrCabinNo ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
                {errors.seatOrCabinNo && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                    <AlertCircle size={13} />
                    <span>{errors.seatOrCabinNo}</span>
                  </div>
                )}
              </div>

              {/* Field: Office / Location */}
              <div className="form-group">
                <label
                  htmlFor="field-location"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>Office / Location</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  id="field-location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.location ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.location ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: formData.location ? '#0F172A' : '#64748B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Location</option>
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {errors.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                    <AlertCircle size={13} />
                    <span>{errors.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================
              SECTION 3: ASSET INFORMATION
              ============================================================ */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                paddingBottom: '0.75rem',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #F1F5F9'
              }}
            >
              <Printer size={18} color="var(--iocl-navy)" />
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '800',
                  color: 'var(--iocl-navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0
                }}
              >
                3. Asset & Consumable Information
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {/* Field: Printer Dropdown (Loaded from Backend /api/assets) */}
              <div className="form-group">
                <label
                  htmlFor="field-printerId"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>Printer / Model</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                  {isLoadingMasterData && <Loader2 size={12} className="spinner text-muted" />}
                </label>
                <select
                  id="field-printerId"
                  name="printerId"
                  value={formData.printerId}
                  onChange={(e) => handleInputChange('printerId', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.printerId ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.printerId ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: formData.printerId ? '#0F172A' : '#64748B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Printer</option>
                  {printers.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.modelName} ({asset.serialNumber || `ID: ${asset.id}`}) — {asset.printerType === 'COLOR' ? 'Color' : 'B&W'}
                    </option>
                  ))}
                </select>
                {errors.printerId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                    <AlertCircle size={13} />
                    <span>{errors.printerId}</span>
                  </div>
                )}
              </div>

              {/* Field: Printer Type (Selector / State indicator) */}
              <div className="form-group">
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <Palette size={14} color="#64748B" />
                  <span>Printer Type</span>
                </label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    height: '42px'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleInputChange('printerType', 'Black & White')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
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
                    Black & White
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange('printerType', 'Color')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      border: '2px solid',
                      borderColor: formData.printerType === 'Color' ? '#D4001F' : '#CBD5E1',
                      backgroundColor: formData.printerType === 'Color' ? '#FEF2F2' : '#FFFFFF',
                      color: formData.printerType === 'Color' ? '#D4001F' : '#64748B',
                      fontSize: '0.8125rem',
                      fontWeight: formData.printerType === 'Color' ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Color
                  </button>
                </div>
              </div>

              {/* Field: Cartridge Dropdown (Loaded from Backend /api/procurement/cartridges) */}
              <div className="form-group">
                <label
                  htmlFor="field-cartridgeId"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <Package size={14} color="#64748B" />
                  <span>Cartridge / Part Number</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                  {isLoadingMasterData && <Loader2 size={12} className="spinner text-muted" />}
                </label>
                <select
                  id="field-cartridgeId"
                  name="cartridgeId"
                  value={formData.cartridgeId}
                  onChange={(e) => handleInputChange('cartridgeId', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.cartridgeId ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.cartridgeId ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: formData.cartridgeId ? '#0F172A' : '#64748B',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select Cartridge</option>
                  {cartridges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.partNumber} — {c.cartridgeName} ({c.printerName})
                    </option>
                  ))}
                </select>
                {errors.cartridgeId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                    <AlertCircle size={13} />
                    <span>{errors.cartridgeId}</span>
                  </div>
                )}
              </div>

              {/* Conditional Field: Colour (Displayed ONLY when Printer Type is Color) */}
              {formData.printerType === 'Color' && (
                <div className="form-group" style={{ animation: 'fadeIn 0.2s ease-out' }}>
                  <label
                    htmlFor="field-colour"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.8125rem',
                      fontWeight: '700',
                      color: '#334155',
                      marginBottom: '0.375rem'
                    }}
                  >
                    <span>Colour</span>
                    <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    id="field-colour"
                    name="colour"
                    value={formData.colour}
                    onChange={(e) => handleInputChange('colour', e.target.value)}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: errors.colour ? '#DC2626' : '#CBD5E1',
                      backgroundColor: errors.colour ? '#FFF8F8' : '#FFFFFF',
                      fontSize: '0.875rem',
                      color: formData.colour ? '#0F172A' : '#64748B',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">Select Colour</option>
                    {COLOUR_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.colour && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                      <AlertCircle size={13} />
                      <span>{errors.colour}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
              SECTION 4: USAGE INFORMATION
              ============================================================ */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                paddingBottom: '0.75rem',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #F1F5F9'
              }}
            >
              <Hash size={18} color="var(--iocl-navy)" />
              <h3
                style={{
                  fontSize: '0.875rem',
                  fontWeight: '800',
                  color: 'var(--iocl-navy)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  margin: 0
                }}
              >
                4. Quantity & Usage Details
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.25rem'
              }}
            >
              {/* Field: Quantity Used */}
              <div className="form-group">
                <label
                  htmlFor="field-quantityUsed"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <span>Quantity Used</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-quantityUsed"
                  name="quantityUsed"
                  type="number"
                  min="1"
                  max="1000"
                  step="1"
                  placeholder="Enter quantity (e.g. 1)"
                  value={formData.quantityUsed}
                  onChange={(e) => handleInputChange('quantityUsed', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.quantityUsed ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.quantityUsed ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
                {errors.quantityUsed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                    <AlertCircle size={13} />
                    <span>{errors.quantityUsed}</span>
                  </div>
                )}
              </div>

              {/* Field: Usage Date */}
              <div className="form-group">
                <label
                  htmlFor="field-usageDate"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <Calendar size={14} color="#64748B" />
                  <span>Usage Date</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-usageDate"
                  name="usageDate"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.usageDate}
                  onChange={(e) => handleInputChange('usageDate', e.target.value)}
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 0.875rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: errors.usageDate ? '#DC2626' : '#CBD5E1',
                    backgroundColor: errors.usageDate ? '#FFF8F8' : '#FFFFFF',
                    fontSize: '0.875rem',
                    color: '#0F172A',
                    outline: 'none'
                  }}
                />
                {errors.usageDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                    <AlertCircle size={13} />
                    <span>{errors.usageDate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Field: Reference / Work Order No. */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="field-workOrderReference"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '0.375rem'
                }}
              >
                <ClipboardList size={14} color="#64748B" />
                <span>Reference / Work Order No. (Optional)</span>
              </label>
              <input
                id="field-workOrderReference"
                name="workOrderReference"
                type="text"
                placeholder="e.g. WO-2026-AUG-102"
                value={formData.workOrderReference}
                onChange={(e) => handleInputChange('workOrderReference', e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  outline: 'none'
                }}
              />
            </div>

            {/* Field: Purpose / Remarks */}
            <div className="form-group">
              <label
                htmlFor="field-remarks"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '0.375rem'
                }}
              >
                <FileText size={14} color="#64748B" />
                <span>Purpose / Remarks (Optional)</span>
              </label>
              <textarea
                id="field-remarks"
                name="remarks"
                rows={3}
                placeholder="Enter remarks or reason for consumption (e.g. Routine cartridge replacement due to low toner)"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  color: '#0F172A',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              borderTop: '1px solid #E2E8F0',
              paddingTop: '1.5rem',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#475569',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={15} />
              <span>Reset</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '0.625rem 1.75rem',
                backgroundColor: isSubmitting ? '#94A3B8' : '#D4001F',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '700',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 8px rgba(212, 0, 31, 0.25)',
                transition: 'background-color 0.15s ease'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  <span>Recording Usage...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Record Usage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 5. Real User Usage Records Section (from PostgreSQL) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--iocl-navy)', margin: 0 }}>
              Recent Usage Records
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>
              ({recentUsages.length} {recentUsages.length === 1 ? 'record' : 'records'} logged)
            </span>
          </div>

          <button
            type="button"
            onClick={fetchUserUsageHistory}
            disabled={isLoadingHistory}
            style={{
              padding: '0.3125rem 0.625rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <RefreshCw size={12} className={isLoadingHistory ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {isLoadingHistory ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
            <Loader2 size={24} className="spinner text-navy" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 500, margin: 0 }}>Loading usage records from database...</p>
          </div>
        ) : recentUsages.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>PRINTER</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CARTRIDGE / PART NO.</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>COLOUR</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>QTY USED</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>LOCATION</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>REFERENCE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>REMARKS</th>
                </tr>
              </thead>
              <tbody>
                {recentUsages.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1E293B' }}>
                      {item.usageDate}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                      {item.printerModel || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="font-semibold text-navy">{item.partNumber || item.cartridgeName}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {item.colour ? (
                        <span
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: '700',
                            backgroundColor: item.colour === 'BLACK' ? '#F1F5F9' : item.colour === 'CYAN' ? '#ECFEFF' : item.colour === 'MAGENTA' ? '#FDF4FF' : '#FEFCE8',
                            color: item.colour === 'BLACK' ? '#0F172A' : item.colour === 'CYAN' ? '#0891B2' : item.colour === 'MAGENTA' ? '#C026D3' : '#CA8A04',
                            border: '1px solid currentColor'
                          }}
                        >
                          {item.colour}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '700', color: '#D4001F' }}>
                      {item.quantityUsed}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748B', fontSize: '0.75rem' }}>
                      {item.location} · {item.seatOrCabinNo}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#475569' }}>
                      {item.workOrderReference || '—'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#64748B', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.remarks}>
                      {item.remarks || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            style={{
              padding: '3rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#F1F5F9',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.875rem'
              }}
            >
              <Inbox size={24} />
            </div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
              No usage records recorded yet.
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0, maxWidth: '380px', lineHeight: 1.4 }}>
              When you submit a consumable usage above, it will be persisted to PostgreSQL and displayed here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
