import React, { useState } from 'react';
import {
  Calendar,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Filter,
  Check,
  Building,
  MapPin,
  Briefcase,
  Printer,
  Tag,
  Package,
  Layers,
  ShoppingBag,
  FileSpreadsheet,
  X
} from 'lucide-react';

const DEPARTMENT_OPTIONS = [
  'All Departments',
  'Information Systems',
  'Operations',
  'Maintenance',
  'IT & Communications',
  'Administration',
  'Procurement',
  'Finance & Accounts',
  'Stores & Inventory',
  'Engineering Services',
  'Human Resources',
  'Health Safety & Environment'
];

const LOCATION_OPTIONS = [
  'All Locations',
  'Head Office',
  'Refinery',
  'Refinery Complex',
  'Admin Block',
  'Regional Office',
  'Terminal',
  'Depot'
];

const COLOUR_OPTIONS = [
  'All Colours',
  'BLACK',
  'CYAN',
  'MAGENTA',
  'YELLOW'
];

export const ReportFilters = ({
  reportType = 'ASSET_USAGE',
  filters = {},
  onFilterChange,
  onApplyFilters,
  onResetFilters
}) => {
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  // Date Presets Handler
  const applyDatePreset = (preset) => {
    const today = new Date();
    let fromDate = '';
    let toDate = today.toISOString().slice(0, 10);

    if (preset === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      fromDate = firstDay.toISOString().slice(0, 10);
    } else if (preset === 'LAST_30_DAYS') {
      const past30 = new Date();
      past30.setDate(today.getDate() - 30);
      fromDate = past30.toISOString().slice(0, 10);
    } else if (preset === 'YTD') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      fromDate = startOfYear.toISOString().slice(0, 10);
    } else if (preset === 'ALL') {
      fromDate = '';
      toDate = '';
    }

    onFilterChange({
      ...filters,
      fromDate,
      toDate
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (val) => val !== undefined && val !== null && val !== '' && val !== 'ALL' && val !== 'All Departments' && val !== 'All Locations' && val !== 'All Colours'
  );

  return (
    <div className="filter-card mb-6">
      {/* Header & Preset Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border-color, #E2E8F0)',
          paddingBottom: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="var(--iocl-navy, #002D62)" />
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--iocl-navy)', margin: 0 }}>
            REPORT FILTERS & PARAMETERS
          </h3>
        </div>

        {/* Date Presets (relevant for date-filtered reports) */}
        {(reportType === 'ASSET_USAGE' || reportType === 'PROCUREMENT' || reportType === 'CALL_UP_PO' || reportType === 'STOCK_HISTORY') && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Presets:</span>
            <button
              type="button"
              className="btn-preset"
              onClick={() => applyDatePreset('THIS_MONTH')}
              style={{ padding: '3px 8px', fontSize: '0.6875rem', borderRadius: '4px', border: '1px solid var(--border-color, #CBD5E1)', background: '#FFFFFF', cursor: 'pointer' }}
            >
              This Month
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={() => applyDatePreset('LAST_30_DAYS')}
              style={{ padding: '3px 8px', fontSize: '0.6875rem', borderRadius: '4px', border: '1px solid var(--border-color, #CBD5E1)', background: '#FFFFFF', cursor: 'pointer' }}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={() => applyDatePreset('YTD')}
              style={{ padding: '3px 8px', fontSize: '0.6875rem', borderRadius: '4px', border: '1px solid var(--border-color, #CBD5E1)', background: '#FFFFFF', cursor: 'pointer' }}
            >
              Year-to-Date
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={() => applyDatePreset('ALL')}
              style={{ padding: '3px 8px', fontSize: '0.6875rem', borderRadius: '4px', border: '1px solid var(--border-color, #CBD5E1)', background: '#FFFFFF', cursor: 'pointer' }}
            >
              All Dates
            </button>
          </div>
        )}
      </div>

      {/* Grid of Dynamic Form Inputs */}
      <div
        className="filter-fields-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          alignItems: 'flex-end'
        }}
      >
        {/* COMMON DATE PICKERS */}
        {(reportType === 'ASSET_USAGE' || reportType === 'PROCUREMENT' || reportType === 'CALL_UP_PO' || reportType === 'STOCK_HISTORY') && (
          <>
            <div className="filter-field-group">
              <label className="filter-field-label">
                <Calendar size={13} style={{ marginRight: '4px' }} /> From Date
              </label>
              <input
                type="date"
                className="filter-search-input"
                value={filters.fromDate || ''}
                onChange={(e) => handleChange('fromDate', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">
                <Calendar size={13} style={{ marginRight: '4px' }} /> To Date
              </label>
              <input
                type="date"
                className="filter-search-input"
                value={filters.toDate || ''}
                onChange={(e) => handleChange('toDate', e.target.value)}
              />
            </div>
          </>
        )}

        {/* 1. ASSET USAGE SPECIFIC FILTERS */}
        {reportType === 'ASSET_USAGE' && (
          <>
            <div className="filter-field-group">
              <label className="filter-field-label">Part Number / Cartridge</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. 070-BLK, W2041X..."
                value={filters.partNumber || ''}
                onChange={(e) => handleChange('partNumber', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Engineer Name / No.</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. Sagar Varshney, ENG1001..."
                value={filters.engineer || ''}
                onChange={(e) => handleChange('engineer', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Beneficiary / Emp No.</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. Anjali, 93917..."
                value={filters.beneficiary || ''}
                onChange={(e) => handleChange('beneficiary', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Department</label>
              <select
                className="filter-select"
                value={filters.department || 'ALL'}
                onChange={(e) => handleChange('department', e.target.value)}
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept === 'All Departments' ? 'ALL' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Location / Complex</label>
              <select
                className="filter-select"
                value={filters.location || 'ALL'}
                onChange={(e) => handleChange('location', e.target.value)}
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc === 'All Locations' ? 'ALL' : loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Colour</label>
              <select
                className="filter-select"
                value={filters.colour || 'ALL'}
                onChange={(e) => handleChange('colour', e.target.value)}
              >
                {COLOUR_OPTIONS.map((c) => (
                  <option key={c} value={c === 'All Colours' ? 'ALL' : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 2. STORE INVENTORY SPECIFIC FILTERS */}
        {reportType === 'STORE_INVENTORY' && (
          <>
            <div className="filter-field-group">
              <label className="filter-field-label">Part Number</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. 070-BLK, W2040X..."
                value={filters.partNumber || ''}
                onChange={(e) => handleChange('partNumber', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Stock Status</label>
              <select
                className="filter-select"
                value={filters.status || 'ALL'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ALL">All Stock Levels</option>
                <option value="AVAILABLE">Normal Available</option>
                <option value="LOW_STOCK">Low Stock (Below Threshold)</option>
                <option value="OUT_OF_STOCK">Out of Stock (Zero)</option>
              </select>
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Location / Store Room</label>
              <select
                className="filter-select"
                value={filters.location || 'ALL'}
                onChange={(e) => handleChange('location', e.target.value)}
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc === 'All Locations' ? 'ALL' : loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 3. PROCUREMENT / RATE CONTRACT SPECIFIC FILTERS */}
        {reportType === 'PROCUREMENT' && (
          <>
            <div className="filter-field-group">
              <label className="filter-field-label">Rate Contract Number</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. RC-2026-001..."
                value={filters.rateContract || ''}
                onChange={(e) => handleChange('rateContract', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Part Number</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. 070-BLK, W2041X..."
                value={filters.partNumber || ''}
                onChange={(e) => handleChange('partNumber', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Vendor / Supplier</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="Vendor name..."
                value={filters.supplier || ''}
                onChange={(e) => handleChange('supplier', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Agreement Status</label>
              <select
                className="filter-select"
                value={filters.status || 'ALL'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </>
        )}

        {/* 4. CALL-UP PO SPECIFIC FILTERS */}
        {reportType === 'CALL_UP_PO' && (
          <>
            <div className="filter-field-group">
              <label className="filter-field-label">Call-Up PO Number</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. PO-2026-004..."
                value={filters.poNumber || ''}
                onChange={(e) => handleChange('poNumber', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Rate Contract Ref</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="Rate contract number..."
                value={filters.rateContract || ''}
                onChange={(e) => handleChange('rateContract', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Execution Status</label>
              <select
                className="filter-select"
                value={filters.status || 'ALL'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ALL">All PO Statuses</option>
                <option value="PLACED">Placed</option>
                <option value="PARTIALLY_EXECUTED">Partially Executed</option>
                <option value="COMPLETED">Fully Completed</option>
              </select>
            </div>
          </>
        )}

        {/* 5. EMPLOYEE REPORT SPECIFIC FILTERS */}
        {reportType === 'EMPLOYEE' && (
          <>
            <div className="filter-field-group">
              <label className="filter-field-label">Employee Number / Name</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. 93917 or Rajesh Kumar..."
                value={filters.employeeNumber || filters.name || ''}
                onChange={(e) => {
                  handleChange('employeeNumber', e.target.value);
                  handleChange('name', e.target.value);
                }}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Department</label>
              <select
                className="filter-select"
                value={filters.department || 'ALL'}
                onChange={(e) => handleChange('department', e.target.value)}
              >
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept} value={dept === 'All Departments' ? 'ALL' : dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Status</label>
              <select
                className="filter-select"
                value={filters.status || 'ALL'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Location / Complex</label>
              <select
                className="filter-select"
                value={filters.location || 'ALL'}
                onChange={(e) => handleChange('location', e.target.value)}
              >
                {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc === 'All Locations' ? 'ALL' : loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* 6. STOCK MOVEMENT SPECIFIC FILTERS */}
        {reportType === 'STOCK_HISTORY' && (
          <>
            <div className="filter-field-group">
              <label className="filter-field-label">Part Number</label>
              <input
                type="text"
                className="filter-search-input"
                placeholder="e.g. 070-BLK..."
                value={filters.partNumber || ''}
                onChange={(e) => handleChange('partNumber', e.target.value)}
              />
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Transaction Type</label>
              <select
                className="filter-select"
                value={filters.transactionType || 'ALL'}
                onChange={(e) => handleChange('transactionType', e.target.value)}
              >
                <option value="ALL">All Transaction Types</option>
                <option value="USAGE">Consumable Usage (Outward)</option>
                <option value="PURCHASE_RECEIPT">PO Goods Receipt (Inward)</option>
                <option value="ADJUSTMENT">Stock Adjustment</option>
              </select>
            </div>

            <div className="filter-field-group">
              <label className="filter-field-label">Movement Direction</label>
              <select
                className="filter-select"
                value={filters.direction || 'ALL'}
                onChange={(e) => handleChange('direction', e.target.value)}
              >
                <option value="ALL">All Directions</option>
                <option value="IN">Inward (Stock In)</option>
                <option value="OUT">Outward (Stock Out)</option>
              </select>
            </div>
          </>
        )}

        {/* Action Buttons: Apply Filters & Reset */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: '220px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onApplyFilters}
            style={{
              flex: '1',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: 'var(--iocl-navy, #002D62)',
              color: '#FFFFFF',
              border: 'none',
              height: '38px'
            }}
          >
            <Check size={14} />
            <span>Apply Filters</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-filter-reset"
              onClick={onResetFilters}
              title="Reset all filters"
              style={{ height: '38px' }}
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
