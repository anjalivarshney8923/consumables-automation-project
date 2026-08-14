import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Search,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { getThresholds, updateThreshold } from '../../services/thresholdService';

export const ThresholdSettings = () => {
  const [thresholds, setThresholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Track modified threshold input values: { [cartridgeId]: number }
  const [editedValues, setEditedValues] = useState({});
  // Track save status per row: { [cartridgeId]: { saving: boolean, success: boolean, error?: string } }
  const [saveStatus, setSaveStatus] = useState({});

  const fetchThresholdData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const res = await getThresholds();
    if (res.success && res.data) {
      setThresholds(res.data);
      // Initialize edit values from DB data
      const initialEdits = {};
      res.data.forEach((item) => {
        initialEdits[item.cartridgeId] = item.poThreshold;
      });
      setEditedValues(initialEdits);
    } else {
      setError(res.message || 'Failed to load cartridge thresholds from database.');
    }

    setLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchThresholdData();
  }, [fetchThresholdData]);

  const handleThresholdChange = (cartridgeId, val) => {
    const parsed = val === '' ? '' : Math.max(0, parseInt(val, 10) || 0);
    setEditedValues((prev) => ({
      ...prev,
      [cartridgeId]: parsed
    }));
  };

  const handleSaveThreshold = async (cartridgeId) => {
    const val = editedValues[cartridgeId];
    if (val === '' || val === undefined || isNaN(val) || val < 0) {
      setSaveStatus((prev) => ({
        ...prev,
        [cartridgeId]: { saving: false, success: false, error: 'Please enter a valid positive integer' }
      }));
      return;
    }

    setSaveStatus((prev) => ({
      ...prev,
      [cartridgeId]: { saving: true, success: false, error: null }
    }));

    const res = await updateThreshold(cartridgeId, val);
    if (res.success && res.data) {
      // Update local state with fresh DB data
      setThresholds((prev) =>
        prev.map((item) => (item.cartridgeId === cartridgeId ? res.data : item))
      );
      setSaveStatus((prev) => ({
        ...prev,
        [cartridgeId]: { saving: false, success: true, error: null }
      }));

      // Clear success icon after 3 seconds
      setTimeout(() => {
        setSaveStatus((prev) => ({
          ...prev,
          [cartridgeId]: { ...prev[cartridgeId], success: false }
        }));
      }, 3000);
    } else {
      setSaveStatus((prev) => ({
        ...prev,
        [cartridgeId]: { saving: false, success: false, error: res.message || 'Save failed' }
      }));
    }
  };

  // Filter thresholds based on search term & status
  const filteredThresholds = thresholds.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.partNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cartridgeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.printerName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'LOW' && item.status === 'Low Availability') ||
      (filterStatus === 'ADEQUATE' && item.status === 'Adequate');

    return matchesSearch && matchesStatus;
  });

  const lowCount = thresholds.filter((t) => t.status === 'Low Availability').length;
  const adequateCount = thresholds.filter((t) => t.status === 'Adequate').length;

  return (
    <div className="procurement-page-container">
      {/* Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--iocl-navy)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sliders size={20} />
            </div>
            <div>
              <h1 className="page-title-text">SETTING THRESHOLD LIMITS</h1>
              <p className="page-subtitle-text">
                Configure PO Threshold limits for consumable cartridges. When Rate Contract Net Availability &le; PO Threshold, Alert 1 is triggered.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Summary KPI Pills */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        <div className="summary-stat-card" style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Total Cartridges</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--iocl-navy)', marginTop: '0.25rem' }}>{thresholds.length}</div>
        </div>

        <div className="summary-stat-card" style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.75rem', color: '#16A34A', textTransform: 'uppercase', fontWeight: '600' }}>Adequate Availability</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#16A34A', marginTop: '0.25rem' }}>{adequateCount}</div>
        </div>

        <div className="summary-stat-card" style={{ padding: '1rem', background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: '0.75rem', color: '#DC2626', textTransform: 'uppercase', fontWeight: '600' }}>Low Availability Alerts</span>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#DC2626', marginTop: '0.25rem' }}>{lowCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-panel-card mb-6" style={{ background: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
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
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
              All ({thresholds.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('LOW')}
              style={{
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                borderRadius: '6px',
                fontWeight: '600',
                border: '1px solid',
                borderColor: filterStatus === 'LOW' ? '#DC2626' : '#CBD5E1',
                backgroundColor: filterStatus === 'LOW' ? '#FEF2F2' : '#F8FAFC',
                color: filterStatus === 'LOW' ? '#DC2626' : '#475569',
                cursor: 'pointer'
              }}
            >
              Alerts ({lowCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('ADEQUATE')}
              style={{
                padding: '0.375rem 0.875rem',
                fontSize: '0.8125rem',
                borderRadius: '6px',
                fontWeight: '600',
                border: '1px solid',
                borderColor: filterStatus === 'ADEQUATE' ? '#16A34A' : '#CBD5E1',
                backgroundColor: filterStatus === 'ADEQUATE' ? '#F0FDF4' : '#F8FAFC',
                color: filterStatus === 'ADEQUATE' ? '#16A34A' : '#475569',
                cursor: 'pointer'
              }}
            >
              Adequate ({adequateCount})
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchThresholdData(true)}
              disabled={isRefreshing}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: 'var(--iocl-navy)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
              title="Refresh Threshold Records"
            >
              <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="table-responsive-card" style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="table-loader-spinner" style={{ margin: '0 auto 1rem' }} />
            <p>Loading Cartridge Threshold Limits from PostgreSQL...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#DC2626' }}>
            <AlertTriangle size={32} style={{ margin: '0 auto 0.5rem' }} />
            <p style={{ fontWeight: '600' }}>{error}</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fetchThresholdData(true)}
              style={{ marginTop: '1rem' }}
            >
              Retry
            </button>
          </div>
        ) : filteredThresholds.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Layers size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p style={{ fontWeight: '600' }}>No cartridge threshold records match your search criteria.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="procurement-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                    Part Number
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                    Cartridge / Consumable Name
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)' }}>
                    Printer Model
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'center' }}>
                    Printers Count
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>
                    Total RC Qty
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'right' }}>
                    Net Available in RC
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', minWidth: '180px' }}>
                    PO Threshold
                  </th>
                  <th style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', fontWeight: '700', color: 'var(--iocl-navy)', textAlign: 'center' }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredThresholds.map((item) => {
                  const isLow = item.status === 'Low Availability';
                  const rowStatus = saveStatus[item.cartridgeId] || {};
                  const isSaving = rowStatus.saving;
                  const isSuccess = rowStatus.success;
                  const hasError = rowStatus.error;
                  const currentEdit = editedValues[item.cartridgeId] ?? item.poThreshold;
                  const isModified = currentEdit !== item.poThreshold;

                  return (
                    <tr
                      key={item.cartridgeId}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        backgroundColor: isLow ? '#FFFBF6' : '#FFFFFF',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      {/* Part Number */}
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: 'var(--iocl-navy)', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {item.partNumber}
                      </td>

                      {/* Cartridge Name */}
                      <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#1E293B', fontSize: '0.875rem' }}>
                        {item.cartridgeName}
                      </td>

                      {/* Printer Model */}
                      <td style={{ padding: '0.875rem 1rem', color: '#64748B', fontSize: '0.8125rem' }}>
                        {item.printerName}
                      </td>

                      {/* Printers Count */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center', color: '#334155', fontSize: '0.875rem', fontWeight: '500' }}>
                        {item.numberOfPrinters}
                      </td>

                      {/* Total RC Quantity */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: '600', color: '#334155', fontSize: '0.875rem' }}>
                        {item.rateContractQuantity}
                      </td>

                      {/* Net Available in RC */}
                      <td
                        style={{
                          padding: '0.875rem 1rem',
                          textAlign: 'right',
                          fontWeight: '700',
                          fontSize: '0.9375rem',
                          color: isLow ? '#DC2626' : '#16A34A'
                        }}
                      >
                        {item.netAvailableQuantity}
                      </td>

                      {/* Editable PO Threshold */}
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={currentEdit}
                            onChange={(e) => handleThresholdChange(item.cartridgeId, e.target.value)}
                            disabled={isSaving}
                            style={{
                              width: '75px',
                              padding: '0.375rem 0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              textAlign: 'center',
                              borderRadius: '6px',
                              border: isModified ? '2px solid var(--iocl-saffron)' : '1px solid #CBD5E1',
                              backgroundColor: isSaving ? '#F1F5F9' : '#FFFFFF',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveThreshold(item.cartridgeId)}
                            disabled={isSaving || !isModified}
                            style={{
                              padding: '0.375rem 0.75rem',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isModified ? 'var(--iocl-saffron)' : '#E2E8F0',
                              color: isModified ? '#FFFFFF' : '#94A3B8',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              cursor: isModified ? 'pointer' : 'default',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              transition: 'all 0.15s ease'
                            }}
                            title={isModified ? 'Save PO Threshold to Database' : 'Threshold is current'}
                          >
                            {isSaving ? (
                              <RefreshCw size={12} className="spin-icon" />
                            ) : isSuccess ? (
                              <CheckCircle2 size={12} color="#16A34A" />
                            ) : (
                              <Save size={12} />
                            )}
                            <span>{isSaving ? 'Saving' : isSuccess ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>
                        {hasError && (
                          <span style={{ fontSize: '0.6875rem', color: '#DC2626', display: 'block', marginTop: '0.25rem' }}>
                            {hasError}
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                        {isLow ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: '1px solid #FECACA'
                            }}
                          >
                            <AlertTriangle size={12} />
                            Low Availability
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.25rem 0.625rem',
                              borderRadius: '9999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: '#DCFCE7',
                              color: '#16A34A',
                              border: '1px solid #BBF7D0'
                            }}
                          >
                            <CheckCircle2 size={12} />
                            Adequate
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info helper footer */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}
      >
        <Info size={18} style={{ color: 'var(--iocl-navy)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: '1.5' }}>
          <strong>How Alert 1 Works:</strong> The Spring Boot backend continuously computes{' '}
          <code>Net Available = Total Rate Contract Qty &minus; Executed Qty &minus; Call-Up POs</code>.
          Whenever <code>Net Available &le; PO Threshold</code>, an active Procurement Alert is generated in PostgreSQL and displayed in the notifications bell and admin dashboard.
        </div>
      </div>
    </div>
  );
};
