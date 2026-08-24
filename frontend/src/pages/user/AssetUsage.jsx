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
  RefreshCw,
  Search,
  Building,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAssets } from '../../services/assetService';
import { getActiveCartridges } from '../../services/cartridgeService';
import { recordAssetUsage, getUserUsageHistory, searchBeneficiaries } from '../../services/assetUsageService';

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
  'Human Resources',
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

  // Beneficiary Employee Search & Master Selection State
  const [beneficiarySearchQuery, setBeneficiarySearchQuery] = useState('');
  const [beneficiarySearchResults, setBeneficiarySearchResults] = useState([]);
  const [isSearchingBeneficiary, setIsSearchingBeneficiary] = useState(false);
  const [showBeneficiaryDropdown, setShowBeneficiaryDropdown] = useState(false);
  const [selectedMasterEmployee, setSelectedMasterEmployee] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Section 2: Beneficiary Details
    beneficiaryEmployeeNo: '',
    beneficiaryEmployeeName: '',
    beneficiaryDepartment: '',
    beneficiarySeatOrCabinNo: '',
    beneficiaryLocation: 'Head Office',
    beneficiaryEmail: '',

    // Section 3: Asset & Cartridge Selection
    printerId: '',
    printerType: 'Black & White',
    cartridgeId: '',
    colour: '',

    // Section 4: Usage Details
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

  // Load Real Assets, Cartridges, and User Usage History on Mount and on Window Focus
  useEffect(() => {
    fetchMasterData();
    fetchUserUsageHistory();

    // Auto-refresh stock on window focus so admin PO updates are immediately seen
    const handleFocus = () => {
      fetchMasterData();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
        if (!cartRes.success) {
          setMasterDataError(cartRes.message || 'Unable to load current store inventory.');
        }
      }
    } catch (err) {
      setMasterDataError('Unable to connect to backend server for inventory data.');
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

  // Search Beneficiary Employees from Backend
  const handleSearchBeneficiaries = async (query) => {
    setBeneficiarySearchQuery(query);
    if (!query || query.trim().length < 1) {
      setBeneficiarySearchResults([]);
      setShowBeneficiaryDropdown(false);
      return;
    }

    setIsSearchingBeneficiary(true);
    try {
      const res = await searchBeneficiaries(query);
      if (res.success && Array.isArray(res.data)) {
        setBeneficiarySearchResults(res.data);
        setShowBeneficiaryDropdown(true);
      } else {
        setBeneficiarySearchResults([]);
        setShowBeneficiaryDropdown(true);
      }
    } catch {
      setBeneficiarySearchResults([]);
    } finally {
      setIsSearchingBeneficiary(false);
    }
  };

  // Select a beneficiary from employee directory (Option 1)
  const handleSelectBeneficiary = (emp) => {
    setSelectedMasterEmployee(emp);
    setFormData((prev) => ({
      ...prev,
      beneficiaryEmployeeNo: emp.employeeNo || '',
      beneficiaryEmployeeName: emp.employeeName || '',
      beneficiaryDepartment: emp.department || prev.beneficiaryDepartment || 'Operations',
      beneficiaryLocation: emp.location || prev.beneficiaryLocation || 'Head Office',
      beneficiaryEmail: emp.email || prev.beneficiaryEmail || ''
    }));

    setBeneficiarySearchQuery('');
    setShowBeneficiaryDropdown(false);

    // Clear validation errors for beneficiary fields
    setErrors((prev) => {
      const next = { ...prev };
      delete next.beneficiaryEmployeeNo;
      delete next.beneficiaryEmployeeName;
      delete next.beneficiaryDepartment;
      delete next.beneficiaryLocation;
      delete next.beneficiaryEmail;
      return next;
    });
  };

  // Clear selected beneficiary / Switch to manual entry (Option 2)
  const handleClearBeneficiarySelection = () => {
    setSelectedMasterEmployee(null);
    setFormData((prev) => ({
      ...prev,
      beneficiaryEmployeeNo: '',
      beneficiaryEmployeeName: '',
      beneficiaryDepartment: '',
      beneficiarySeatOrCabinNo: '',
      beneficiaryLocation: 'Head Office',
      beneficiaryEmail: ''
    }));
    setBeneficiarySearchQuery('');
    setShowBeneficiaryDropdown(false);
  };

  // Handle Input Changes with Automatic Printer Type & Colour Rules
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // When engineer selects a printer, auto-detect printer type and compatible cartridge
      if (field === 'printerId') {
        const selectedAsset = printers.find((p) => String(p.id) === String(value));
        if (selectedAsset) {
          const isColor = selectedAsset.printerType === 'COLOR' ||
            (selectedAsset.modelName && selectedAsset.modelName.toLowerCase().includes('color'));
          updated.printerType = isColor ? 'Color' : 'Black & White';
          if (!isColor) {
            updated.colour = '';
          }

          // If asset has an associated cartridge ID, auto-select it
          if (selectedAsset.cartridgeId) {
            updated.cartridgeId = String(selectedAsset.cartridgeId);
          } else if (selectedAsset.cartridge?.id) {
            updated.cartridgeId = String(selectedAsset.cartridge.id);
          } else if (selectedAsset.compatibleCartridge) {
            const matchedCart = cartridges.find(
              (c) => c.partNumber?.toLowerCase() === selectedAsset.compatibleCartridge?.toLowerCase()
            );
            if (matchedCart) {
              updated.cartridgeId = String(matchedCart.id);
            }
          }
        }
      }

      // If engineer toggles printer type to Black & White, clear colour
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

    // Beneficiary Validations
    if (!formData.beneficiaryEmployeeNo || !formData.beneficiaryEmployeeNo.trim()) {
      newErrors.beneficiaryEmployeeNo = 'Beneficiary Employee No. is required.';
    }

    if (!formData.beneficiaryEmployeeName || !formData.beneficiaryEmployeeName.trim()) {
      newErrors.beneficiaryEmployeeName = 'Beneficiary Employee Name is required.';
    }

    if (!formData.beneficiaryDepartment || !formData.beneficiaryDepartment.trim()) {
      newErrors.beneficiaryDepartment = 'Please select a beneficiary department.';
    }

    if (!formData.beneficiarySeatOrCabinNo || !formData.beneficiarySeatOrCabinNo.trim()) {
      newErrors.beneficiarySeatOrCabinNo = 'Seat or cabin number is required.';
    }

    if (!formData.beneficiaryLocation || !formData.beneficiaryLocation.trim()) {
      newErrors.beneficiaryLocation = 'Please select an office/location.';
    }

    if (!formData.beneficiaryEmail || !formData.beneficiaryEmail.trim()) {
      newErrors.beneficiaryEmail = 'Beneficiary email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.beneficiaryEmail.trim())) {
      newErrors.beneficiaryEmail = 'Please enter a valid beneficiary email address.';
    }

    // Asset & Cartridge Validations
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

    // Usage Details Validations
    if (!formData.quantityUsed || formData.quantityUsed.toString().trim() === '') {
      newErrors.quantityUsed = 'Quantity used is required.';
    } else {
      const num = Number(formData.quantityUsed);
      if (isNaN(num) || !Number.isInteger(num) || num <= 0) {
        newErrors.quantityUsed = 'Quantity used must be a positive whole number.';
      } else if (num > 1000) {
        newErrors.quantityUsed = 'Quantity used cannot exceed 1000 units.';
      } else if (formData.cartridgeId) {
        const selectedCart = cartridges.find((c) => c.id?.toString() === formData.cartridgeId.toString() || c.partNumber === formData.cartridgeId);
        if (selectedCart && selectedCart.storeQuantity !== undefined) {
          const availableStock = Number(selectedCart.storeQuantity) || 0;
          if (num > availableStock) {
            newErrors.quantityUsed = `Insufficient store stock. Available quantity: ${availableStock}.`;
          }
        }
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
      beneficiaryEmployeeNo: formData.beneficiaryEmployeeNo.trim(),
      beneficiaryEmployeeName: formData.beneficiaryEmployeeName.trim(),
      beneficiaryDepartment: formData.beneficiaryDepartment.trim(),
      beneficiarySeatOrCabinNo: formData.beneficiarySeatOrCabinNo.trim(),
      beneficiaryLocation: formData.beneficiaryLocation.trim(),
      beneficiaryEmail: formData.beneficiaryEmail.trim(),
      printerId: formData.printerId.trim(),
      printerType: formData.printerType,
      cartridgeId: formData.cartridgeId.trim(),
      colour: formData.printerType === 'Color' ? formData.colour.trim() : null,
      quantityUsed: parseInt(formData.quantityUsed, 10),
      usageDate: formData.usageDate,
      remarks: formData.remarks?.trim() || null,
      workOrderReference: formData.workOrderReference?.trim() || null
    };

    try {
      const result = await recordAssetUsage(payload);

      if (result.success && result.data) {
        setSubmitSuccess({
          message: 'Asset usage recorded successfully.',
          data: result.data
        });

        // Reset transaction-specific and beneficiary fields
        setFormData({
          beneficiaryEmployeeNo: '',
          beneficiaryEmployeeName: '',
          beneficiaryDepartment: '',
          beneficiarySeatOrCabinNo: '',
          beneficiaryLocation: 'Head Office',
          beneficiaryEmail: '',
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

        // Refresh usage history and master data from PostgreSQL
        fetchUserUsageHistory();
        fetchMasterData();
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
      beneficiaryEmployeeNo: '',
      beneficiaryEmployeeName: '',
      beneficiaryDepartment: '',
      beneficiarySeatOrCabinNo: '',
      beneficiaryLocation: 'Head Office',
      beneficiaryEmail: '',
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

  const engineerName = user?.fullName || user?.name || user?.username || 'Authenticated Engineer';
  const engineerEmpNo = user?.employeeId || user?.employeeNo || user?.username || 'ENG-USER';

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
              TECHNICAL / ENGINEER PORTAL
            </span>
          </div>
          <p className="page-subtitle-text" style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--iocl-navy)' }}>
            Record Consumable Usage for Employee / Cabin
          </p>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: '0.25rem 0 0' }}>
            Submit real consumable consumption records to update central inventory, Rate Contract execution, and the Procurement Register.
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
            <span>Authenticated Engineer Tracking</span>
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
                Usage record has been persisted and Store Inventory quantity has been deducted.
              </p>

              {/* Transaction Summary Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                  <strong>Recorded By:</strong> {submitSuccess.data.recordedByEmployeeName || engineerName} ({submitSuccess.data.recordedByEmployeeNo || engineerEmpNo})
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                  <strong>Usage For:</strong> {submitSuccess.data.beneficiaryEmployeeName} ({submitSuccess.data.beneficiaryEmployeeNo}) - Cabin: {submitSuccess.data.beneficiarySeatOrCabinNo}
                </span>
                {submitSuccess.data.beneficiaryEmail && (
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#FFFFFF', color: '#1E293B', padding: '0.25rem 0.625rem', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                    <strong>Email:</strong> {submitSuccess.data.beneficiaryEmail}
                  </span>
                )}
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
              SECTION 1: RECORDED BY (Authenticated Engineer - READ ONLY)
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
              <UserCheck size={18} color="var(--iocl-navy)" />
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
                1. RECORDED BY (Authenticated Engineer)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: 'auto', fontWeight: '600' }}>
                Authoritative from Login Session (Read-Only)
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
                backgroundColor: '#F8FAFC',
                padding: '1.25rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0'
              }}
            >
              {/* Engineer Name (Read-Only) */}
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
                  <span>Engineer Name:</span>
                </label>
                <input
                  type="text"
                  value={engineerName}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              {/* Engineer Employee No. (Read-Only) */}
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
                  <span>Engineer Employee No:</span>
                </label>
                <input
                  type="text"
                  value={engineerEmpNo}
                  disabled
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#475569',
                    fontWeight: '600',
                    cursor: 'not-allowed'
                  }}
                />
              </div>
            </div>
          </div>

          {/* ============================================================
              SECTION 2: USAGE BENEFICIARY / TARGET EMPLOYEE DETAILS
              ============================================================ */}
          <div style={{ marginBottom: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                paddingBottom: '0.75rem',
                marginBottom: '1.25rem',
                borderBottom: '2px solid #F1F5F9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                  2. USAGE BENEFICIARY (Target Employee & Cabin)
                </h3>
              </div>

              {/* Status Indicator: Auto-fill vs Manual */}
              {selectedMasterEmployee ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      backgroundColor: '#F0FDF4',
                      color: '#166534',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      border: '1px solid #BBF7D0',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <CheckCircle2 size={12} />
                    <span>Auto-filled from Employee Master</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleClearBeneficiarySelection}
                    style={{
                      fontSize: '0.6875rem',
                      color: '#DC2626',
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: '4px',
                      padding: '0.2rem 0.5rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                    title="Clear auto-filled employee and enter details manually"
                  >
                    Clear / Enter Manually
                  </button>
                </div>
              ) : (
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#64748B',
                    backgroundColor: '#F8FAFC',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #E2E8F0',
                    fontWeight: '600'
                  }}
                >
                  Option 1: Search Master | Option 2: Enter Manually
                </span>
              )}
            </div>

            {/* Beneficiary Search Bar (Option 1) */}
            <div style={{ marginBottom: '1.25rem', position: 'relative' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '700',
                  color: '#334155',
                  marginBottom: '0.375rem'
                }}
              >
                <Search size={14} color="var(--iocl-navy)" />
                <span>Search Employee Master (Option 1: Search & Auto-Fill)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={beneficiarySearchQuery}
                  onChange={(e) => handleSearchBeneficiaries(e.target.value)}
                  onFocus={() => {
                    if (beneficiarySearchQuery.trim().length > 0) {
                      setShowBeneficiaryDropdown(true);
                    }
                  }}
                  placeholder="Type employee name, employee ID, department, or email to search..."
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                <Search
                  size={16}
                  color="#94A3B8"
                  style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                />
                {isSearchingBeneficiary && (
                  <Loader2
                    size={16}
                    className="spinner text-navy"
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                )}
              </div>

              {/* Dropdown search results */}
              {showBeneficiaryDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 30,
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
                    marginTop: '0.25rem',
                    maxHeight: '260px',
                    overflowY: 'auto'
                  }}
                >
                  {beneficiarySearchResults.length > 0 ? (
                    beneficiarySearchResults.map((emp) => (
                      <div
                        key={emp.id || emp.employeeNo}
                        onClick={() => handleSelectBeneficiary(emp)}
                        style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid #F1F5F9',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background-color 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                      >
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: '700', color: '#1E293B' }}>
                            {emp.employeeName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.15rem' }}>
                            Emp ID: <strong>{emp.employeeNo}</strong> · Dept: {emp.department || '—'} · Location: {emp.location || '—'}
                          </div>
                          {emp.email && (
                            <div style={{ fontSize: '0.6875rem', color: '#0284C7', marginTop: '0.1rem' }}>
                              {emp.email}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            backgroundColor: '#EFF6FF',
                            color: '#1E40AF',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '4px',
                            fontWeight: '700',
                            border: '1px solid #BFDBFE'
                          }}
                        >
                          Auto-Fill
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#64748B' }}>
                      <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1E293B', margin: '0 0 0.25rem' }}>
                        No employee found for "{beneficiarySearchQuery}"
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.5rem' }}>
                        Option 2: You can enter the beneficiary details manually in the fields below.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBeneficiaryDropdown(false);
                          const el = document.getElementById('field-beneficiaryEmployeeNo');
                          if (el) el.focus();
                        }}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: 'var(--iocl-navy)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.35rem 0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Enter Details Manually Below
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {/* Field: Beneficiary Employee No. */}
              <div className="form-group">
                <label
                  htmlFor="field-beneficiaryEmployeeNo"
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
                  <span>Beneficiary Employee No.</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-beneficiaryEmployeeNo"
                  type="text"
                  value={formData.beneficiaryEmployeeNo}
                  onChange={(e) => handleInputChange('beneficiaryEmployeeNo', e.target.value)}
                  placeholder="e.g. EMP001"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.beneficiaryEmployeeNo ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    boxShadow: errors.beneficiaryEmployeeNo ? '0 0 0 1px #DC2626' : 'none'
                  }}
                />
                {errors.beneficiaryEmployeeNo && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.beneficiaryEmployeeNo}
                  </span>
                )}
              </div>

              {/* Field: Beneficiary Employee Name */}
              <div className="form-group">
                <label
                  htmlFor="field-beneficiaryEmployeeName"
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
                  <span>Beneficiary Employee Name</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-beneficiaryEmployeeName"
                  type="text"
                  value={formData.beneficiaryEmployeeName}
                  onChange={(e) => handleInputChange('beneficiaryEmployeeName', e.target.value)}
                  placeholder="e.g. Anjali Varshney"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.beneficiaryEmployeeName ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    boxShadow: errors.beneficiaryEmployeeName ? '0 0 0 1px #DC2626' : 'none'
                  }}
                />
                {errors.beneficiaryEmployeeName && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.beneficiaryEmployeeName}
                  </span>
                )}
              </div>

              {/* Field: Beneficiary Department */}
              <div className="form-group">
                <label
                  htmlFor="field-beneficiaryDepartment"
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
                  <span>Beneficiary Department</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  id="field-beneficiaryDepartment"
                  value={formData.beneficiaryDepartment}
                  onChange={(e) => handleInputChange('beneficiaryDepartment', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.beneficiaryDepartment ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: formData.beneficiaryDepartment ? '#1E293B' : '#94A3B8',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">Select Department...</option>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                {errors.beneficiaryDepartment && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.beneficiaryDepartment}
                  </span>
                )}
              </div>

              {/* Field: Seat / Cabin No. */}
              <div className="form-group">
                <label
                  htmlFor="field-beneficiarySeatOrCabinNo"
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
                  <span>Seat / Cabin No.</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-beneficiarySeatOrCabinNo"
                  type="text"
                  value={formData.beneficiarySeatOrCabinNo}
                  onChange={(e) => handleInputChange('beneficiarySeatOrCabinNo', e.target.value)}
                  placeholder="e.g. A-204, Floor 2"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.beneficiarySeatOrCabinNo ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    boxShadow: errors.beneficiarySeatOrCabinNo ? '0 0 0 1px #DC2626' : 'none'
                  }}
                />
                {errors.beneficiarySeatOrCabinNo && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.beneficiarySeatOrCabinNo}
                  </span>
                )}
              </div>

              {/* Field: Beneficiary Office / Location */}
              <div className="form-group">
                <label
                  htmlFor="field-beneficiaryLocation"
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
                  id="field-beneficiaryLocation"
                  value={formData.beneficiaryLocation}
                  onChange={(e) => handleInputChange('beneficiaryLocation', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.beneficiaryLocation ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  {LOCATION_OPTIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                {errors.beneficiaryLocation && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.beneficiaryLocation}
                  </span>
                )}
              </div>

              {/* Field: Beneficiary Email */}
              <div className="form-group">
                <label
                  htmlFor="field-beneficiaryEmail"
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
                  <span>Beneficiary Email</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-beneficiaryEmail"
                  type="email"
                  value={formData.beneficiaryEmail}
                  onChange={(e) => handleInputChange('beneficiaryEmail', e.target.value)}
                  placeholder="e.g. anjali@example.com"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.beneficiaryEmail ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    boxShadow: errors.beneficiaryEmail ? '0 0 0 1px #DC2626' : 'none'
                  }}
                />
                {errors.beneficiaryEmail && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.beneficiaryEmail}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================
              SECTION 3: ASSET / CONSUMABLE
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
                3. Asset & Consumable Cartridge Selection
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}
            >
              {/* Field: Printer */}
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
                  <span>Assigned Printer</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  id="field-printerId"
                  value={formData.printerId}
                  onChange={(e) => handleInputChange('printerId', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.printerId ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: formData.printerId ? '#1E293B' : '#94A3B8',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">Select Printer / Device...</option>
                  {printers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.modelName} (SN: {p.serialNumber || 'N/A'}) - {p.printerType || 'B&W'}
                    </option>
                  ))}
                </select>
                {errors.printerId && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.printerId}
                  </span>
                )}
              </div>

              {/* Field: Printer Type (Auto-detected / Display) */}
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
                  <span>Printer Type</span>
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    height: '42px'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: '800',
                      color: formData.printerType === 'Color' ? '#D946EF' : '#1E293B',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    {formData.printerType === 'Color' ? '🎨 COLOR PRINTER' : '🖨️ BLACK & WHITE (MONO)'}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: '#64748B', marginLeft: 'auto' }}>
                    (Auto-detected)
                  </span>
                </div>
              </div>

              {/* Field: Cartridge Selection */}
              <div className="form-group">
                <label
                  htmlFor="field-cartridgeId"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8125rem',
                    fontWeight: '700',
                    color: '#334155',
                    marginBottom: '0.375rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span>Consumable Cartridge / Part No.</span>
                    <span style={{ color: '#DC2626' }}>*</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchMasterData}
                    disabled={isLoadingMasterData}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284C7',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: 0
                    }}
                    title="Refresh store inventory from server"
                  >
                    <RefreshCw size={12} className={isLoadingMasterData ? 'animate-spin' : ''} />
                    {isLoadingMasterData ? 'Refreshing...' : 'Refresh Stock'}
                  </button>
                </label>
                <select
                  id="field-cartridgeId"
                  value={formData.cartridgeId}
                  onChange={(e) => handleInputChange('cartridgeId', e.target.value)}
                  disabled={isLoadingMasterData}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.cartridgeId ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: formData.cartridgeId ? '#1E293B' : '#94A3B8',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="">
                    {isLoadingMasterData ? 'Loading store stock from server...' : 'Select Cartridge Part Number...'}
                  </option>
                  {cartridges.map((c) => {
                    const stockLabel = isLoadingMasterData
                      ? 'Loading stock...'
                      : c.storeQuantity != null
                      ? `Store Stock: ${c.storeQuantity} units`
                      : 'Stock unavailable';
                    return (
                      <option key={c.id} value={c.id}>
                        {c.partNumber} — {c.cartridgeName} ({stockLabel})
                      </option>
                    );
                  })}
                </select>
                {formData.cartridgeId && (() => {
                  const selected = cartridges.find((c) => c.id?.toString() === formData.cartridgeId.toString() || c.partNumber === formData.cartridgeId);
                  if (isLoadingMasterData) {
                    return (
                      <div style={{ marginTop: '0.375rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '500' }}>
                          ⏳ Loading live store stock...
                        </span>
                      </div>
                    );
                  }
                  if (masterDataError) {
                    return (
                      <div style={{ marginTop: '0.375rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#DC2626', fontWeight: '600' }}>
                          ⚠️ {masterDataError}
                        </span>
                      </div>
                    );
                  }
                  const stock = selected?.storeQuantity != null ? selected.storeQuantity : 0;
                  return (
                    <div style={{ marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: stock > 0 ? '#EFF6FF' : '#FEF2F2',
                          color: stock > 0 ? '#1E40AF' : '#DC2626',
                          border: stock > 0 ? '1px solid #BFDBFE' : '1px solid #FECACA'
                        }}
                      >
                        📦 Available Store Inventory: <strong>{stock}</strong> units
                      </span>
                    </div>
                  );
                })()}
                {errors.cartridgeId && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.cartridgeId}
                  </span>
                )}
              </div>

              {/* Field: Colour (Mandatory if Color, Hidden if Black & White) */}
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
                    <span>Cartridge Colour</span>
                    <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {COLOUR_OPTIONS.map((c) => {
                      const isSelected = formData.colour === c.value;
                      return (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => handleInputChange('colour', c.value)}
                          style={{
                            padding: '0.5rem 0.25rem',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #D4001F' : '1px solid #CBD5E1',
                            backgroundColor: isSelected ? '#FEF2F2' : '#FFFFFF',
                            color: isSelected ? '#D4001F' : '#334155',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span
                            style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              backgroundColor: c.hex,
                              border: '1px solid #CBD5E1'
                            }}
                          />
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.colour && (
                    <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                      {errors.colour}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================
              SECTION 4: USAGE DETAILS
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
                4. Usage Details & Tracking
              </h3>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem'
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
                  <span>Quantity Used (Units)</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-quantityUsed"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.quantityUsed}
                  onChange={(e) => handleInputChange('quantityUsed', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.quantityUsed ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF',
                    fontWeight: '700'
                  }}
                />
                {errors.quantityUsed && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.quantityUsed}
                  </span>
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
                  <span>Usage Date</span>
                  <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="field-usageDate"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.usageDate}
                  onChange={(e) => handleInputChange('usageDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: errors.usageDate ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF'
                  }}
                />
                {errors.usageDate && (
                  <span style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '0.25rem', display: 'block', fontWeight: '500' }}>
                    {errors.usageDate}
                  </span>
                )}
              </div>

              {/* Field: Work Order Reference */}
              <div className="form-group">
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
                  <span>Work Order / Reference No.</span>
                </label>
                <input
                  id="field-workOrderReference"
                  type="text"
                  value={formData.workOrderReference}
                  onChange={(e) => handleInputChange('workOrderReference', e.target.value)}
                  placeholder="e.g. WO-2026-AUG-04"
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: '#1E293B',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            {/* Field: Remarks */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
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
                <span>Remarks / Justification</span>
              </label>
              <textarea
                id="field-remarks"
                rows="3"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="e.g. Previous cartridge empty. Replaced with genuine OEM unit for cabin printer."
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  color: '#1E293B',
                  backgroundColor: '#FFFFFF',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '1rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #E2E8F0',
              flexWrap: 'wrap'
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.625rem 1.25rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <RotateCcw size={16} />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isLoadingMasterData}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.625rem 1.5rem',
                backgroundColor: isSubmitting ? '#94A3B8' : '#D4001F',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '700',
                color: '#FFFFFF',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(212,0,31,0.25)',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#BA001A')}
              onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#D4001F')}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner text-white" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <ClipboardEdit size={16} />
                  <span>RECORD ASSET USAGE</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 5. Recent Usages Recorded by Current Engineer */}
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
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} color="var(--iocl-navy)" />
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '800', color: 'var(--iocl-navy)', margin: 0 }}>
              Recent Transactions Recorded by You
            </h3>
          </div>

          <button
            type="button"
            onClick={fetchUserUsageHistory}
            disabled={isLoadingHistory}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={12} className={isLoadingHistory ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Usage Records Table or Empty State */}
        {isLoadingHistory ? (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
            <Loader2 size={24} className="spinner text-navy" style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontSize: '0.8125rem', fontWeight: 500 }}>Loading usage records...</p>
          </div>
        ) : recentUsages.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>USAGE DATE</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>USAGE FOR (BENEFICIARY)</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CABIN / LOCATION</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CARTRIDGE / PART NO.</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>COLOUR</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>QTY</th>
                  <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>WORK ORDER</th>
                </tr>
              </thead>
              <tbody>
                {recentUsages.slice(0, 10).map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', color: '#64748B' }}>
                      #{u.id}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#1E293B' }}>
                      {u.usageDate}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ fontWeight: '700', color: '#1E293B' }}>
                        {u.beneficiaryEmployeeName || u.employeeName}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748B' }}>
                        Emp No: {u.beneficiaryEmployeeNo || u.employeeNo} ({u.beneficiaryDepartment || u.department})
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                      {u.beneficiarySeatOrCabinNo || u.seatOrCabinNo} · {u.beneficiaryLocation || u.location}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: 'var(--iocl-navy)' }}>
                      {u.partNumber || u.cartridgeName}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      {u.colour ? (
                        <span
                          style={{
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            fontWeight: '700',
                            backgroundColor: u.colour === 'BLACK' ? '#F1F5F9' : u.colour === 'CYAN' ? '#ECFEFF' : u.colour === 'MAGENTA' ? '#FDF4FF' : '#FEFCE8',
                            color: u.colour === 'BLACK' ? '#0F172A' : u.colour === 'CYAN' ? '#0891B2' : u.colour === 'MAGENTA' ? '#C026D3' : '#CA8A04',
                            border: '1px solid currentColor'
                          }}
                        >
                          {u.colour}
                        </span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: '#D4001F' }}>
                      {u.quantityUsed}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748B' }}>
                      {u.workOrderReference || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem'
              }}
            >
              <Inbox size={22} />
            </div>
            <h4 style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
              No Usage Records Recorded Yet
            </h4>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', margin: 0 }}>
              Transactions recorded by you for beneficiary employees will appear here in chronological order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
