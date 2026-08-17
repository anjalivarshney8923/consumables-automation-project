import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
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
  Info,
  ShieldCheck,
  Palette,
  FileCheck,
  ArrowLeft,
  Edit3,
  Check,
  X,
  Clock,
  Calendar,
  AlertTriangle,
  FileText,
  Boxes,
  Loader2,
  RefreshCw,
  Database
} from 'lucide-react';
import { getAssets, updateAsset } from '../../services/assetService';
import { getActiveCartridges } from '../../services/cartridgeService';

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

export const UpdateAsset = () => {
  // Search and list state from PostgreSQL
  const [searchQuery, setSearchQuery] = useState('');
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState(null);

  // Cartridge master data state from PostgreSQL
  const [cartridges, setCartridges] = useState([]);
  const [cartridgesLoading, setCartridgesLoading] = useState(true);
  const [cartridgesError, setCartridgesError] = useState(null);

  // Selected asset state
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [originalAsset, setOriginalAsset] = useState(null);

  // Form edit state
  const [formData, setFormData] = useState({
    modelName: '',
    serialNumber: '',
    department: '',
    cartridgePartNumber: '',
    printerType: 'Black & White',
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

  // UI status banners & submission state
  const [successMessage, setSuccessMessage] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Load active cartridges from backend
  const loadCartridges = useCallback(async () => {
    setCartridgesLoading(true);
    setCartridgesError(null);
    const res = await getActiveCartridges();
    if (res.success && res.data) {
      setCartridges(res.data);
    } else {
      setCartridgesError(res.message || 'Failed to load cartridge master records.');
    }
    setCartridgesLoading(false);
  }, []);

  // 2. Load assets from backend with optional search filter
  const loadAssets = useCallback(async (query = '') => {
    setAssetsLoading(true);
    setAssetsError(null);
    const res = await getAssets(query);
    if (res.success && res.data) {
      setAssets(res.data);
    } else {
      setAssetsError(res.message || 'Failed to load assets from database.');
    }
    setAssetsLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadCartridges();
    loadAssets();
  }, [loadCartridges, loadAssets]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    loadAssets(searchQuery.trim());
  };

  // Handle Clear Search
  const handleClearSearch = () => {
    setSearchQuery('');
    loadAssets('');
  };

  // Select an asset for viewing/editing
  const handleSelectAsset = (asset) => {
    const formattedPrinterType =
      asset.printerType === 'COLOR' ? 'Color' : 'Black & White';

    let formattedStatus = 'Active';
    if (asset.status === 'UNDER_MAINTENANCE' || asset.status === 'Under Maintenance') {
      formattedStatus = 'Under Maintenance';
    } else if (asset.status === 'INACTIVE' || asset.status === 'Inactive') {
      formattedStatus = 'Inactive';
    }

    const cartridgeRef =
      asset.cartridgePartNumber || asset.compatibleCartridge || '';

    const baselineData = {
      id: asset.id,
      modelName: asset.modelName || '',
      serialNumber: asset.serialNumber || '',
      department: asset.department || '',
      cartridgePartNumber: cartridgeRef,
      cartridgeName: asset.cartridgeName || '',
      printerType: formattedPrinterType,
      status: formattedStatus,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt
    };

    setSelectedAsset(baselineData);
    setOriginalAsset(baselineData);
    setFormData({
      modelName: baselineData.modelName,
      serialNumber: baselineData.serialNumber,
      department: baselineData.department,
      cartridgePartNumber: baselineData.cartridgePartNumber,
      printerType: baselineData.printerType,
      status: baselineData.status
    });
    setErrors({});
    setSuccessMessage(null);
    setApiError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Back to Search
  const handleBackToSearch = () => {
    setSelectedAsset(null);
    setOriginalAsset(null);
    setFormData({
      modelName: '',
      serialNumber: '',
      department: '',
      cartridgePartNumber: '',
      printerType: 'Black & White',
      status: 'Active'
    });
    setErrors({});
    setSuccessMessage(null);
    setApiError(null);
    setIsConfirmModalOpen(false);
    loadAssets(searchQuery.trim());
  };

  // Field change handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null
      }));
    }

    if (successMessage) {
      setSuccessMessage(null);
    }
    if (apiError) {
      setApiError(null);
    }
  };

  // Change Detection: Compare current form values with baseline values
  const detectedChanges = useMemo(() => {
    if (!originalAsset) return [];
    const changes = [];

    if (formData.modelName.trim() !== originalAsset.modelName) {
      changes.push({
        field: 'Model Name',
        oldVal: originalAsset.modelName,
        newVal: formData.modelName.trim()
      });
    }

    if (formData.serialNumber.trim().toUpperCase() !== originalAsset.serialNumber.toUpperCase()) {
      changes.push({
        field: 'Serial Number',
        oldVal: originalAsset.serialNumber,
        newVal: formData.serialNumber.trim().toUpperCase()
      });
    }

    if (formData.department !== originalAsset.department) {
      changes.push({
        field: 'Department / Location',
        oldVal: originalAsset.department,
        newVal: formData.department
      });
    }

    if (formData.cartridgePartNumber !== originalAsset.cartridgePartNumber) {
      changes.push({
        field: 'Compatible Cartridge',
        oldVal: originalAsset.cartridgePartNumber,
        newVal: formData.cartridgePartNumber
      });
    }

    if (formData.printerType !== originalAsset.printerType) {
      changes.push({
        field: 'Printer Type',
        oldVal: originalAsset.printerType,
        newVal: formData.printerType
      });
    }

    if (formData.status !== originalAsset.status) {
      changes.push({
        field: 'Asset Status',
        oldVal: originalAsset.status,
        newVal: formData.status
      });
    }

    return changes;
  }, [formData, originalAsset]);

  const hasUnsavedChanges = detectedChanges.length > 0;

  // Form Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.modelName || !formData.modelName.trim()) {
      newErrors.modelName = 'Model name is required.';
    } else if (formData.modelName.trim().length < 2) {
      newErrors.modelName = 'Model name must be at least 2 characters.';
    }

    if (!formData.serialNumber || !formData.serialNumber.trim()) {
      newErrors.serialNumber = 'Serial number is required.';
    } else if (formData.serialNumber.trim().length < 3) {
      newErrors.serialNumber = 'Serial number must be at least 3 characters.';
    }

    if (!formData.department || !formData.department.trim()) {
      newErrors.department = 'Please select a department.';
    }

    if (!formData.cartridgePartNumber || !formData.cartridgePartNumber.trim()) {
      newErrors.cartridgePartNumber = 'Please select a compatible cartridge.';
    }

    if (!formData.printerType || !formData.printerType.trim()) {
      newErrors.printerType = 'Please select printer type.';
    }

    if (!formData.status || !formData.status.trim()) {
      newErrors.status = 'Please select asset status.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Trigger Confirmation Modal
  const handleUpdateClick = (e) => {
    e.preventDefault();
    if (!hasUnsavedChanges || isSaving) return;

    if (validateForm()) {
      setIsConfirmModalOpen(true);
    }
  };

  // Real HTTP PUT request to Spring Boot backend
  const handleConfirmUpdate = async () => {
    setIsConfirmModalOpen(false);
    setIsSaving(true);
    setApiError(null);

    const payload = {
      modelName: formData.modelName.trim(),
      serialNumber: formData.serialNumber.trim().toUpperCase(),
      department: formData.department.trim(),
      compatibleCartridge: formData.cartridgePartNumber.trim(),
      printerType: formData.printerType === 'Color' ? 'COLOR' : 'BLACK_AND_WHITE',
      status: formData.status.toUpperCase().replace(/ /g, '_')
    };

    const res = await updateAsset(selectedAsset.id, payload);
    setIsSaving(false);

    if (res.success && res.data) {
      const updated = res.data;
      const formattedPrinterType =
        updated.printerType === 'COLOR' ? 'Color' : 'Black & White';

      let formattedStatus = 'Active';
      if (updated.status === 'UNDER_MAINTENANCE') {
        formattedStatus = 'Under Maintenance';
      } else if (updated.status === 'INACTIVE') {
        formattedStatus = 'Inactive';
      }

      const updatedBaseline = {
        id: updated.id,
        modelName: updated.modelName,
        serialNumber: updated.serialNumber,
        department: updated.department,
        cartridgePartNumber: updated.cartridgePartNumber || updated.compatibleCartridge,
        cartridgeName: updated.cartridgeName || '',
        printerType: formattedPrinterType,
        status: formattedStatus,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt
      };

      setSelectedAsset(updatedBaseline);
      setOriginalAsset(updatedBaseline);
      setFormData({
        modelName: updatedBaseline.modelName,
        serialNumber: updatedBaseline.serialNumber,
        department: updatedBaseline.department,
        cartridgePartNumber: updatedBaseline.cartridgePartNumber,
        printerType: updatedBaseline.printerType,
        status: updatedBaseline.status
      });

      setSuccessMessage('Asset updated successfully.');
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setApiError(res.message || 'Failed to update asset.');
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

  // Reset Changes to baseline
  const handleResetChanges = () => {
    if (originalAsset) {
      setFormData({
        modelName: originalAsset.modelName,
        serialNumber: originalAsset.serialNumber,
        department: originalAsset.department,
        cartridgePartNumber: originalAsset.cartridgePartNumber,
        printerType: originalAsset.printerType,
        status: originalAsset.status
      });
      setErrors({});
      setSuccessMessage(null);
      setApiError(null);
    }
  };

  // Helper for status badge styling
  const renderStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              padding: '0.25rem 0.625rem',
              borderRadius: '6px',
              border: '1px solid #86EFAC',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
            Active
          </span>
        );
      case 'UNDER MAINTENANCE':
      case 'UNDER_MAINTENANCE':
        return (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: '#FEF3C7',
              color: '#B45309',
              padding: '0.25rem 0.625rem',
              borderRadius: '6px',
              border: '1px solid #FCD34D',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D97706' }} />
            Under Maintenance
          </span>
        );
      case 'INACTIVE':
      default:
        return (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              backgroundColor: '#F1F5F9',
              color: '#475569',
              padding: '0.25rem 0.625rem',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#64748B' }} />
            Inactive
          </span>
        );
    }
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
              <Boxes size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 className="page-title-text" style={{ margin: 0 }}>
                  Update / Change in Asset
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
                  ASSET MODIFICATION
                </span>
              </div>
              <p className="page-subtitle-text" style={{ marginTop: '0.25rem' }}>
                Search and update registered printer asset specifications in PostgreSQL
              </p>
            </div>
          </div>
        </div>

        {/* Action button header badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {selectedAsset && (
            <button
              type="button"
              onClick={handleBackToSearch}
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
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Search</span>
            </button>
          )}

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
            <span>Fleet Asset Registry</span>
          </div>
        </div>
      </header>

      {/* 2. Success Persistence Notification Banner */}
      {successMessage && (
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
                  {selectedAsset?.id && (
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
                      Database ID #{selectedAsset.id}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#15803D', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                  The printer asset specifications have been successfully modified and permanently persisted in PostgreSQL.
                </p>
                {selectedAsset?.updatedAt && (
                  <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>
                    Last Updated: {new Date(selectedAsset.updatedAt).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleBackToSearch}
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
              <Search size={14} />
              <span>Search Another Asset</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. API Error Banner */}
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

      {/* =================================================================== */}
      {/* STAGE 1: FIND ASSET (When no asset is selected)                     */}
      {/* =================================================================== */}
      {!selectedAsset && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Find Asset Search Card */}
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
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Search size={20} color="var(--iocl-navy)" />
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
                    Find Asset
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Search registered printer assets in PostgreSQL by Serial Number, Model Name or Department
                  </span>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 320px' }}>
                  <Search
                    size={18}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Search by Serial Number, Model Name or Department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      height: '44px',
                      paddingLeft: '2.75rem',
                      paddingRight: '2rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Clear Search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={assetsLoading}
                  style={{
                    padding: '0 1.25rem',
                    height: '44px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--iocl-navy)',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: assetsLoading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {assetsLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                  <span>{assetsLoading ? 'Searching...' : 'Search'}</span>
                </button>

                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    style={{
                      padding: '0 1rem',
                      height: '44px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem'
                    }}
                  >
                    <RotateCcw size={15} />
                    <span>Reset</span>
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Search Results Table Card */}
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
                padding: '1rem 1.5rem',
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
                <Printer size={18} color="var(--iocl-navy)" />
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                  Registered Assets ({assets.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => loadAssets(searchQuery.trim())}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1E40AF',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <RefreshCw size={12} className={assetsLoading ? 'animate-spin' : ''} />
                <span>Refresh List</span>
              </button>
            </div>

            {/* Results Table */}
            {assetsLoading ? (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: '#64748B' }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>Loading registered assets from database...</p>
              </div>
            ) : assetsError ? (
              <div style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: '#DC2626' }}>
                <AlertCircle size={24} style={{ margin: '0 auto 0.5rem' }} />
                <p style={{ fontSize: '0.875rem', fontWeight: '600', margin: '0 0 0.75rem' }}>{assetsError}</p>
                <button
                  type="button"
                  onClick={() => loadAssets(searchQuery.trim())}
                  style={{
                    padding: '0.375rem 0.75rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Retry Connection
                </button>
              </div>
            ) : assets.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #CBD5E1' }}>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>ASSET ID</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>SERIAL NUMBER</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>MODEL NAME</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>DEPARTMENT / LOCATION</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>CARTRIDGE</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>TYPE</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>STATUS</th>
                      <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assets.map((asset, idx) => (
                      <tr
                        key={asset.id}
                        style={{
                          borderBottom: '1px solid #E2E8F0',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: '#1E40AF' }}>
                          #{asset.id}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: '600', color: '#0F172A' }}>
                          {asset.serialNumber}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1E293B' }}>
                          {asset.modelName}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>
                          {asset.department}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', color: '#475569' }}>
                          <span style={{ backgroundColor: '#F1F5F9', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                            {asset.cartridgePartNumber || asset.compatibleCartridge}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: asset.printerType === 'COLOR' ? '#C2410C' : '#334155',
                              backgroundColor: asset.printerType === 'COLOR' ? '#FFF7ED' : '#F1F5F9',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              border: `1px solid ${asset.printerType === 'COLOR' ? '#FED7AA' : '#E2E8F0'}`
                            }}
                          >
                            {asset.printerType === 'COLOR' ? 'Color' : 'Black & White'}
                          </span>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {renderStatusBadge(asset.status)}
                        </td>
                        <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                          <button
                            type="button"
                            onClick={() => handleSelectAsset(asset)}
                            style={{
                              padding: '0.375rem 0.75rem',
                              backgroundColor: '#EFF6FF',
                              border: '1px solid #BFDBFE',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              color: '#1E40AF',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Edit3 size={13} />
                            <span>View / Edit</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* No Results Empty State */
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
                    margin: '0 auto 1rem'
                  }}
                >
                  <Search size={24} />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B', margin: '0 0 0.25rem' }}>
                  No matching asset found
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748B', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                  {searchQuery
                    ? `No registered assets matched your query "${searchQuery}". Please check the serial number or model name.`
                    : 'No printer assets have been registered yet in PostgreSQL. Register assets using the New Asset Addition module.'}
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Search Filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STAGE 2 & 3: CURRENT ASSET DETAILS & EDIT FORM (When asset selected)*/}
      {/* =================================================================== */}
      {selectedAsset && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* STAGE 2: Current Asset Details (Read-only Card) */}
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
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <FileText size={20} color="var(--iocl-navy)" />
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
                    Current Asset Details (Database Record)
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Reference specifications before applying modifications
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    backgroundColor: '#EFF6FF',
                    color: '#1E40AF',
                    fontWeight: '700',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '6px',
                    border: '1px solid #BFDBFE'
                  }}
                >
                  Database ID #{selectedAsset.id}
                </span>
                {renderStatusBadge(selectedAsset.status)}
              </div>
            </div>

            {/* Read-only Specs Grid */}
            <div
              style={{
                padding: '1.5rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem',
                backgroundColor: '#FAFAFA'
              }}
            >
              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Model Name
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {selectedAsset.modelName}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Serial Number
                </span>
                <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', fontWeight: '700', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {selectedAsset.serialNumber}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Department / Location
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {selectedAsset.department}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Compatible Cartridge
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {selectedAsset.cartridgeName ? `${selectedAsset.cartridgeName} (${selectedAsset.cartridgePartNumber})` : selectedAsset.cartridgePartNumber}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Printer Type
                </span>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0F172A', margin: '0.25rem 0 0' }}>
                  {selectedAsset.printerType}
                </p>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '0.6875rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>
                  Registered On
                </span>
                <p style={{ fontSize: '0.75rem', color: '#64748B', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} />
                  <span>{selectedAsset.createdAt ? new Date(selectedAsset.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* STAGE 3: Edit / Update Asset Form */}
          <div
            className="form-card"
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
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Edit3 size={20} color="var(--iocl-navy)" />
                <div>
                  <h2 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
                    Update Asset Information
                  </h2>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Edit the fields below to update specifications for asset #{selectedAsset.id}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {hasUnsavedChanges ? (
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: '700',
                      color: '#C2410C',
                      backgroundColor: '#FFF7ED',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #FED7AA',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EA580C' }} />
                    {detectedChanges.length} Unsaved Change{detectedChanges.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    No changes detected
                  </span>
                )}
              </div>
            </div>

            <form onSubmit={handleUpdateClick} noValidate style={{ padding: '1.75rem 1.5rem' }}>
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
                    htmlFor="editModelName"
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
                  <input
                    id="editModelName"
                    name="editModelName"
                    type="text"
                    value={formData.modelName}
                    onChange={(e) => handleInputChange('modelName', e.target.value)}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: errors.modelName ? '#DC2626' : formData.modelName !== originalAsset.modelName ? 'var(--iocl-saffron)' : '#CBD5E1',
                      backgroundColor: errors.modelName ? '#FFF8F8' : formData.modelName !== originalAsset.modelName ? '#FFFDF7' : '#FFFFFF',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
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
                    htmlFor="editSerialNumber"
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
                  <input
                    id="editSerialNumber"
                    name="editSerialNumber"
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: errors.serialNumber ? '#DC2626' : formData.serialNumber !== originalAsset.serialNumber ? 'var(--iocl-saffron)' : '#CBD5E1',
                      backgroundColor: errors.serialNumber ? '#FFF8F8' : formData.serialNumber !== originalAsset.serialNumber ? '#FFFDF7' : '#FFFFFF',
                      fontSize: '0.875rem',
                      fontFamily: 'monospace',
                      color: '#0F172A',
                      outline: 'none'
                    }}
                  />
                  <span style={{ fontSize: '0.6875rem', color: '#64748B', marginTop: '0.25rem', display: 'block' }}>
                    Serial number must remain unique.
                  </span>
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
                    htmlFor="editDepartment"
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
                  <select
                    id="editDepartment"
                    name="editDepartment"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: errors.department ? '#DC2626' : formData.department !== originalAsset.department ? 'var(--iocl-saffron)' : '#CBD5E1',
                      backgroundColor: errors.department ? '#FFF8F8' : formData.department !== originalAsset.department ? '#FFFDF7' : '#FFFFFF',
                      fontSize: '0.875rem',
                      color: '#0F172A',
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
                  {errors.department && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                      <AlertCircle size={13} />
                      <span>{errors.department}</span>
                    </div>
                  )}
                </div>

                {/* Field D: COMPATIBLE CARTRIDGE (Loaded from PostgreSQL) */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <label
                      htmlFor="editCartridge"
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

                  <select
                    id="editCartridge"
                    name="editCartridge"
                    value={formData.cartridgePartNumber}
                    onChange={(e) => handleInputChange('cartridgePartNumber', e.target.value)}
                    disabled={isSaving || cartridgesLoading}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: errors.cartridgePartNumber ? '#DC2626' : formData.cartridgePartNumber !== originalAsset.cartridgePartNumber ? 'var(--iocl-saffron)' : '#CBD5E1',
                      backgroundColor: errors.cartridgePartNumber ? '#FFF8F8' : formData.cartridgePartNumber !== originalAsset.cartridgePartNumber ? '#FFFDF7' : '#FFFFFF',
                      fontSize: '0.875rem',
                      color: '#0F172A',
                      outline: 'none',
                      cursor: cartridgesLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <option value="">
                      {cartridgesLoading ? 'Loading cartridges...' : '— Select Cartridge Master —'}
                    </option>
                    {cartridges.map((c) => (
                      <option key={c.id || c.partNumber} value={c.partNumber}>
                        {c.cartridgeName} ({c.partNumber})
                      </option>
                    ))}
                  </select>

                  {cartridgesError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem' }}>
                      <span>{cartridgesError}</span>
                      <button
                        type="button"
                        onClick={loadCartridges}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', height: '42px' }}>
                    <button
                      type="button"
                      onClick={() => handleInputChange('printerType', 'Black & White')}
                      disabled={isSaving}
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
                        cursor: isSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#0F172A', display: 'inline-block' }} />
                      <span>Black & White</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInputChange('printerType', 'Color')}
                      disabled={isSaving}
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
                        cursor: isSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'linear-gradient(135deg, #EF4444 0%, #3B82F6 50%, #10B981 100%)', display: 'inline-block' }} />
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

                {/* Field F: ASSET STATUS */}
                <div className="form-group">
                  <label
                    htmlFor="editStatus"
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
                    <span>ASSET STATUS</span>
                    <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <select
                    id="editStatus"
                    name="editStatus"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={isSaving}
                    style={{
                      width: '100%',
                      height: '42px',
                      padding: '0 0.875rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: errors.status ? '#DC2626' : formData.status !== originalAsset.status ? 'var(--iocl-saffron)' : '#CBD5E1',
                      backgroundColor: errors.status ? '#FFF8F8' : formData.status !== originalAsset.status ? '#FFFDF7' : '#FFFFFF',
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
                  {errors.status && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem', color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>
                      <AlertCircle size={13} />
                      <span>{errors.status}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* UNSAVED CHANGES SUMMARY BOX */}
              {hasUnsavedChanges && (
                <div
                  style={{
                    marginTop: '1.75rem',
                    padding: '1.25rem',
                    backgroundColor: '#FFFDF5',
                    borderRadius: '8px',
                    border: '1px solid #FDE68A'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <AlertTriangle size={16} color="#D97706" />
                    <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#92400E' }}>
                      Summary of Unsaved Changes
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {detectedChanges.map((change) => (
                      <div
                        key={change.field}
                        style={{
                          fontSize: '0.8125rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <span style={{ fontWeight: '700', color: '#475569', minWidth: '180px' }}>
                          {change.field}:
                        </span>
                        <span style={{ color: '#DC2626', textDecoration: 'line-through' }}>
                          {change.oldVal}
                        </span>
                        <span style={{ color: '#64748B', fontWeight: '700' }}>&rarr;</span>
                        <span style={{ color: '#16A34A', fontWeight: '700' }}>
                          {change.newVal}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div
                style={{
                  marginTop: '2rem',
                  paddingTop: '1.5rem',
                  borderTop: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.875rem',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  onClick={handleBackToSearch}
                  disabled={isSaving}
                  style={{
                    padding: '0.625rem 1.25rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <ArrowLeft size={16} />
                  <span>Cancel / Back to Search</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Reset Changes Button */}
                  <button
                    type="button"
                    onClick={handleResetChanges}
                    disabled={!hasUnsavedChanges || isSaving}
                    style={{
                      padding: '0.625rem 1.25rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: hasUnsavedChanges && !isSaving ? '#475569' : '#94A3B8',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <RotateCcw size={16} />
                    <span>Reset Changes</span>
                  </button>

                  {/* Primary Action: Save Changes */}
                  <button
                    type="submit"
                    disabled={!hasUnsavedChanges || isSaving}
                    style={{
                      padding: '0.625rem 1.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: hasUnsavedChanges && !isSaving ? '#C53030' : '#CBD5E1',
                      color: '#FFFFFF',
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      cursor: hasUnsavedChanges && !isSaving ? 'pointer' : 'not-allowed',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: hasUnsavedChanges && !isSaving ? '0 4px 6px -1px rgba(197, 48, 48, 0.25)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. CONFIRMATION MODAL                                               */}
      {/* =================================================================== */}
      {isConfirmModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
            backdropFilter: 'blur(2px)'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              overflow: 'hidden',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#F8FAFC'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit3 size={18} color="var(--iocl-navy)" />
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--iocl-navy)', margin: 0 }}>
                  Confirm Asset Update
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !isSaving && setIsConfirmModalOpen(false)}
                disabled={isSaving}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#334155', margin: '0 0 1rem' }}>
                You are about to save the following changes to PostgreSQL for printer asset{' '}
                <strong>#{selectedAsset?.id} ({originalAsset?.serialNumber})</strong>:
              </p>

              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '1.25rem'
                }}
              >
                {detectedChanges.map((change) => (
                  <div key={change.field} style={{ fontSize: '0.8125rem' }}>
                    <span style={{ fontWeight: '700', color: '#1E293B' }}>{change.field}: </span>
                    <span style={{ color: '#DC2626', textDecoration: 'line-through' }}>{change.oldVal}</span>
                    <span style={{ color: '#64748B', fontWeight: '700', margin: '0 0.375rem' }}>&rarr;</span>
                    <span style={{ color: '#16A34A', fontWeight: '700' }}>{change.newVal}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem'
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  disabled={isSaving}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpdate}
                  disabled={isSaving}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#C53030',
                    color: '#FFFFFF',
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 4px rgba(197, 48, 48, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.375rem'
                  }}
                >
                  {isSaving ? <Loader2 size={15} className="animate-spin" /> : null}
                  <span>{isSaving ? 'Saving to Database...' : 'Confirm & Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
