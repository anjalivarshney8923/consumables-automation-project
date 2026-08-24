import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  AlertOctagon,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Calculator,
  Save,
  RefreshCw,
  Flame,
  Filter
} from 'lucide-react';
import { getTenderingAlerts, updateTenderingThreshold } from '../../services/alertService';
import { CalculationBreakdownModal } from '../../components/alerts/CalculationBreakdownModal';

export const TenderingAlerts = () => {
  // Live state from PostgreSQL Database
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Track threshold modifications per row: { [cartridgeId]: number }
  const [editedThresholds, setEditedThresholds] = useState({});
  // Track save status per row: { [cartridgeId]: { saving: boolean, success: boolean, error?: string } }
  const [saveStatus, setSaveStatus] = useState({});

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'URGENT' | 'ADEQUATE'
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT' | 'DEFICIT' | 'PART_NUMBER'

  // Modal inspection state
  const [selectedCalculationItem, setSelectedCalculationItem] = useState(null);

  // Fetch real Alert 2 records from Spring Boot backend (GET /api/alerts/tendering)
  const fetchTenderingData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const res = await getTenderingAlerts();
    if (res.success && res.data) {
      setRecords(res.data);
      // Initialize edit values from DB data
      const initialEdits = {};
      res.data.forEach((item) => {
        initialEdits[item.cartridgeId] = item.tenderingThreshold;
      });
      setEditedThresholds(initialEdits);
    } else {
      setError(res.message || 'Failed to load tendering alerts.');
    }

    setLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchTenderingData();
  }, [fetchTenderingData]);

  // Handle local threshold input change
  const handleThresholdInputChange = (cartridgeId, value) => {
    const parsed = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0);
    setEditedThresholds((prev) => ({
      ...prev,
      [cartridgeId]: parsed
    }));
  };

  // Save modified threshold to PostgreSQL via PUT /api/thresholds/{cartridgeId}
  const handleSaveThreshold = async (cartridgeId) => {
    const newVal = editedThresholds[cartridgeId];
    if (newVal === '' || newVal === undefined || isNaN(newVal) || newVal < 0) {
      setSaveStatus((prev) => ({
        ...prev,
        [cartridgeId]: { saving: false, success: false, error: 'Please enter a valid non-negative integer' }
      }));
      return;
    }

    setSaveStatus((prev) => ({
      ...prev,
      [cartridgeId]: { saving: true, success: false, error: null }
    }));

    const res = await updateTenderingThreshold(cartridgeId, newVal);
    if (res.success) {
      // Re-fetch fresh database records to reflect backend alert recalculation
      await fetchTenderingData(true);
      setSaveStatus((prev) => ({
        ...prev,
        [cartridgeId]: { saving: false, success: true, error: null }
      }));

      setTimeout(() => {
        setSaveStatus((prev) => ({
          ...prev,
          [cartridgeId]: { ...prev[cartridgeId], success: false }
        }));
      }, 3000);
    } else {
      setSaveStatus((prev) => ({
        ...prev,
        [cartridgeId]: { saving: false, success: false, error: res.message || 'Failed to save threshold' }
      }));
    }
  };

  // Dynamically evaluated records based on backend response
  const evaluatedRecords = useMemo(() => {
    return records.map((item) => {
      const storeQty = Number(item.storeNetAvailableQuantity) || 0;
      const rcQty = Number(item.rateContractNetAvailableQuantity) || 0;
      const combinedQty = item.combinedNetAvailableQuantity !== undefined 
        ? Number(item.combinedNetAvailableQuantity) 
        : storeQty + rcQty;
      const threshold = Number(item.tenderingThreshold) || 0;
      const difference = item.difference !== undefined 
        ? Number(item.difference) 
        : combinedQty - threshold;
      const isUrgent = item.isUrgent !== undefined 
        ? Boolean(item.isUrgent) 
        : combinedQty < threshold;

      return {
        ...item,
        id: item.cartridgeId,
        storeQty,
        rcQty,
        combinedQty,
        threshold,
        difference,
        isUrgent,
        statusText: isUrgent ? 'URGENT — TENDERING REQUIRED' : 'Adequate'
      };
    });
  }, [records]);

  // Dynamic KPI Metrics across evaluated PostgreSQL records
  const totalItems = evaluatedRecords.length;
  const tenderingRequiredCount = evaluatedRecords.filter((r) => r.isUrgent).length;
  const adequateCount = evaluatedRecords.filter((r) => !r.isUrgent).length;
  const urgentAlertsCount = tenderingRequiredCount;

  // Filter and search application
  const filteredRecords = useMemo(() => {
    let result = evaluatedRecords.filter((item) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cartridgeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.printerModel?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'URGENT' && item.isUrgent) ||
        (filterStatus === 'ADEQUATE' && !item.isUrgent);

      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'DEFICIT') {
      result.sort((a, b) => a.difference - b.difference);
    } else if (sortBy === 'PART_NUMBER') {
      result.sort((a, b) => (a.partNumber || '').localeCompare(b.partNumber || ''));
    }

    return result;
  }, [evaluatedRecords, searchTerm, filterStatus, sortBy]);

  return (
    <div className="procurement-page-container">
      {/* Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)'
              }}
            >
              <AlertOctagon size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 className="page-title-text" style={{ margin: 0 }}>
                  Tendering Alerts
                </h1>
              </div>
              <p className="page-subtitle-text" style={{ marginTop: '0.25rem' }}>
                Urgent tendering requirements based on real inventory + RC data
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => fetchTenderingData(true)}
            disabled={isRefreshing || loading}
            style={{
              padding: '0.5rem 0.875rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: 'var(--iocl-navy)',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: isRefreshing || loading ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
            title="Refresh Tendering Alerts"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            color: '#991B1B',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchTenderingData(true)}
            style={{
              padding: '0.375rem 0.75rem',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <section aria-label="Alert 2 Summary Metrics" className="kpi-grid mb-6">
        {/* Card 1: Total Items */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Total Items</span>
            <div className="kpi-icon-container kpi-icon-navy">
              <FileSpreadsheet size={20} />
            </div>
          </div>
          <div className="kpi-card-body">
            <span className="kpi-card-value">{loading ? '--' : totalItems}</span>
          </div>
          <div className="kpi-card-footer">
            <span>Tracked Consumables</span>
          </div>
        </div>

        {/* Card 2: Tendering Required */}
        <div
          className="kpi-card"
          style={{
            borderColor: tenderingRequiredCount > 0 ? '#FECACA' : '#E2E8F0',
            backgroundColor: tenderingRequiredCount > 0 ? '#FFFBFB' : '#FFFFFF'
          }}
        >
          <div className="kpi-card-header">
            <span className="kpi-card-title" style={{ color: '#DC2626' }}>Tendering Required</span>
            <div
              className="kpi-icon-container"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}
            >
              <Flame size={20} />
            </div>
          </div>
          <div className="kpi-card-body">
            <span className="kpi-card-value" style={{ color: '#DC2626' }}>
              {loading ? '--' : tenderingRequiredCount}
            </span>
          </div>
          <div className="kpi-card-footer">
            <span style={{ fontWeight: '700', color: '#DC2626' }}>Action Required</span>
          </div>
        </div>

        {/* Card 3: Adequate Stock */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title" style={{ color: '#16A34A' }}>Adequate Stock</span>
            <div className="kpi-icon-container kpi-icon-green">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-card-body">
            <span className="kpi-card-value" style={{ color: '#16A34A' }}>
              {loading ? '--' : adequateCount}
            </span>
          </div>
          <div className="kpi-card-footer">
            <span style={{ fontWeight: '600', color: '#16A34A' }}>Healthy Quota</span>
          </div>
        </div>

        {/* Card 4: Urgent Alerts */}
        <div
          className="kpi-card"
          style={{
            borderColor: urgentAlertsCount > 0 ? '#F87171' : '#E2E8F0',
            backgroundColor: urgentAlertsCount > 0 ? '#FEF2F2' : '#FFFFFF'
          }}
        >
          <div className="kpi-card-header">
            <span className="kpi-card-title" style={{ color: '#B91C1C' }}>Urgent Alerts</span>
            <div
              className="kpi-icon-container"
              style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}
            >
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-card-body">
            <span className="kpi-card-value" style={{ color: '#B91C1C' }}>
              {loading ? '--' : urgentAlertsCount}
            </span>
          </div>
          <div className="kpi-card-footer">
            <span>Critical Deficit Items</span>
            <span style={{ fontWeight: '700', color: '#B91C1C' }}>Alert Active</span>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <div className="filter-panel-card mb-6" style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '260px', maxWidth: '420px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search by part number, cartridge, or printer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  fontSize: '0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Quick Filter Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Filter size={13} /> Filter:
            </span>

            {/* Filter: All */}
            <button
              type="button"
              onClick={() => setFilterStatus('ALL')}
              style={{
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                borderRadius: '6px',
                fontWeight: '600',
                border: '1px solid',
                borderColor: filterStatus === 'ALL' ? 'var(--iocl-navy)' : '#CBD5E1',
                backgroundColor: filterStatus === 'ALL' ? 'var(--iocl-navy)' : '#F8FAFC',
                color: filterStatus === 'ALL' ? '#FFFFFF' : '#475569',
                cursor: 'pointer'
              }}
            >
              All ({evaluatedRecords.length})
            </button>

            {/* Filter: Tendering Required / Urgent */}
            <button
              type="button"
              onClick={() => setFilterStatus('URGENT')}
              style={{
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                borderRadius: '6px',
                fontWeight: '700',
                border: '1px solid',
                borderColor: filterStatus === 'URGENT' ? '#DC2626' : '#FECACA',
                backgroundColor: filterStatus === 'URGENT' ? '#DC2626' : '#FEF2F2',
                color: filterStatus === 'URGENT' ? '#FFFFFF' : '#DC2626',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>🚨 Tendering Required ({tenderingRequiredCount})</span>
            </button>

            {/* Filter: Adequate */}
            <button
              type="button"
              onClick={() => setFilterStatus('ADEQUATE')}
              style={{
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                borderRadius: '6px',
                fontWeight: '600',
                border: '1px solid',
                borderColor: filterStatus === 'ADEQUATE' ? '#16A34A' : '#BBF7D0',
                backgroundColor: filterStatus === 'ADEQUATE' ? '#16A34A' : '#F0FDF4',
                color: filterStatus === 'ADEQUATE' ? '#FFFFFF' : '#16A34A',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>✓ Adequate ({adequateCount})</span>
            </button>

            {/* Sort Toggle */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: 'var(--iocl-navy)',
                fontSize: '0.8125rem',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="DEFAULT">Sort by Default</option>
              <option value="DEFICIT">Sort by Critical Deficit</option>
              <option value="PART_NUMBER">Sort by Part Number</option>
            </select>
          </div>
        </div>
      </div>
      
      <div
        className="table-responsive-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            padding: '0.875rem 1.25rem',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} color="var(--iocl-navy)" />
            <strong style={{ fontSize: '0.875rem', color: 'var(--iocl-navy)' }}>
              Consumables Combined Inventory & Tendering Status
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
              ({filteredRecords.length} records shown)
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
            <div className="table-loader-spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: '600' }}>Loading Tendering Alerts...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#64748B' }}>
            <Search size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#1E293B' }}>No matching consumables found</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem' }}>
              Adjust search keywords or filter pills to view available items.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="procurement-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                    Part Number
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                    Cartridge / Consumable Name
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                    Printer Model
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>
                    Store Net Qty
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>
                    Net Available in RC
                  </th>
                  <th
                    style={{
                      padding: '0.875rem 1rem',
                      fontSize: '0.8125rem',
                      fontWeight: '800',
                      color: 'var(--iocl-navy)',
                      textAlign: 'right',
                      backgroundColor: '#EFF6FF'
                    }}
                  >
                    Combined Net Qty
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', minWidth: '175px' }}>
                    Tendering Threshold
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>
                    Difference
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'center', minWidth: '200px' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'center' }}>
                    Calculation
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((item) => {
                  const isUrgent = item.isUrgent;
                  const rowId = item.cartridgeId;
                  const currentEdit = editedThresholds[rowId] !== undefined ? editedThresholds[rowId] : item.threshold;
                  const isModified = currentEdit !== item.threshold;
                  const rowStatus = saveStatus[rowId] || {};
                  const isSaving = rowStatus.saving;
                  const isSavedSuccess = rowStatus.success;
                  const hasError = rowStatus.error;

                  return (
                    <tr
                      key={rowId}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: isUrgent ? '#FFF5F5' : '#FFFFFF',
                        borderLeft: isUrgent ? '4px solid #DC2626' : '4px solid #16A34A',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Part Number */}
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: 'var(--iocl-navy)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {item.partNumber}
                      </td>

                      {/* Cartridge Name */}
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1E293B', fontSize: '0.875rem' }}>
                        <div>{item.cartridgeName}</div>
                      </td>

                      {/* Printer Model */}
                      <td style={{ padding: '0.875rem 1rem', color: '#475569', fontSize: '0.8125rem' }}>
                        {item.printerModel}
                      </td>

                      {/* Store Net Qty */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '600', color: '#334155', fontSize: '0.875rem' }}>
                        {item.storeQty}
                      </td>

                      {/* Net Available in RC */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '600', color: '#334155', fontSize: '0.875rem' }}>
                        {item.rcQty}
                      </td>

                      {/* Combined Net Qty (Calculated: Store + RC) */}
                      <td
                        style={{
                          padding: '0.875rem 1rem',
                          textAlign: 'right',
                          fontWeight: '800',
                          fontSize: '1rem',
                          color: isUrgent ? '#DC2626' : 'var(--iocl-navy)',
                          backgroundColor: isUrgent ? '#FEE2E2' : '#F0FDF4'
                        }}
                        title={`Store (${item.storeQty}) + RC (${item.rcQty}) = ${item.combinedQty}`}
                      >
                        {item.combinedQty}
                      </td>

                      {/* Editable Tendering Threshold with Database Save */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={currentEdit}
                            disabled={isSaving}
                            onChange={(e) => handleThresholdInputChange(rowId, e.target.value)}
                            style={{
                              width: '68px',
                              padding: '0.3125rem 0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '700',
                              textAlign: 'center',
                              borderRadius: '6px',
                              border: isModified ? '2px solid var(--iocl-saffron)' : '1px solid #CBD5E1',
                              backgroundColor: isSaving ? '#F1F5F9' : '#FFFFFF',
                              outline: 'none'
                            }}
                            title="Edit Tendering Threshold and save"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveThreshold(rowId)}
                            disabled={!isModified || isSaving}
                            style={{
                              padding: '0.3125rem 0.5rem',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isModified ? 'var(--iocl-saffron)' : isSavedSuccess ? '#16A34A' : '#E2E8F0',
                              color: isModified || isSavedSuccess ? '#FFFFFF' : '#94A3B8',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: isModified && !isSaving ? 'pointer' : 'default',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.15s ease'
                            }}
                            title={isModified ? 'Persist new threshold' : 'Threshold is current in DB'}
                          >
                            {isSaving ? (
                              <RefreshCw size={12} className="spin-icon" />
                            ) : isSavedSuccess ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Save size={12} />
                            )}
                            <span>{isSaving ? 'Saving' : isSavedSuccess ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>
                        {hasError && (
                          <span style={{ fontSize: '0.6875rem', color: '#DC2626', display: 'block', marginTop: '0.25rem' }}>
                            {hasError}
                          </span>
                        )}
                      </td>

                      {/* Difference (Combined - Threshold) */}
                      <td
                        style={{
                          padding: '0.875rem 1rem',
                          textAlign: 'right',
                          fontWeight: '700',
                          fontSize: '0.875rem',
                          fontFamily: 'monospace',
                          color: isUrgent ? '#DC2626' : '#16A34A'
                        }}
                      >
                        {item.difference >= 0 ? `+${item.difference}` : item.difference}
                      </td>

                      {/* Urgent Alert Design & Status Badge */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {isUrgent ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              padding: '0.3125rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              backgroundColor: '#DC2626',
                              color: '#FFFFFF',
                              boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
                              letterSpacing: '0.3px',
                              textTransform: 'uppercase'
                            }}
                          >
                            <span style={{ fontSize: '0.875rem' }}>🚨</span>
                            <span>URGENT — TENDERING REQUIRED</span>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              padding: '0.3125rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              backgroundColor: '#DCFCE7',
                              color: '#16A34A',
                              border: '1px solid #BBF7D0'
                            }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Adequate</span>
                          </div>
                        )}
                      </td>

                      {/* View Calculation Interaction */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedCalculationItem(item)}
                          style={{
                            padding: '0.3125rem 0.625rem',
                            borderRadius: '6px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#FFFFFF',
                            color: 'var(--iocl-navy)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            transition: 'all 0.15s ease'
                          }}
                          title="Open full arithmetic calculation breakdown"
                        >
                          <Calculator size={13} color="var(--iocl-saffron)" />
                          <span>View Calc</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expandable Calculation Modal */}
      {selectedCalculationItem && (
        <CalculationBreakdownModal
          item={selectedCalculationItem}
          onClose={() => setSelectedCalculationItem(null)}
        />
      )}
    </div>
  );
};
