import React from 'react';
import {
  Calendar,
  Filter,
  Check,
  RotateCcw
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

  const isDateEnabledReport =
    reportType === 'ASSET_USAGE' ||
    reportType === 'PROCUREMENT' ||
    reportType === 'CALL_UP_PO' ||
    reportType === 'STOCK_HISTORY';

  return (
    <div className="report-filters-card mb-6">
      {/* Header & Presets Bar */}
      <div className="report-filters-header">
        <div className="report-filters-title-group">
          <Filter size={15} color="var(--iocl-red, #B71C1C)" />
          <h3 className="report-filters-title">
            REPORT FILTERS & PARAMETERS
          </h3>
        </div>

        {/* Date Presets */}
        {isDateEnabledReport && (
          <div className="report-presets-bar">
            <span className="report-presets-label">Presets:</span>
            <button
              type="button"
              className="report-preset-btn"
              onClick={() => applyDatePreset('THIS_MONTH')}
            >
              This Month
            </button>
            <button
              type="button"
              className="report-preset-btn"
              onClick={() => applyDatePreset('LAST_30_DAYS')}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              className="report-preset-btn"
              onClick={() => applyDatePreset('YTD')}
            >
              Year-to-Date
            </button>
            <button
              type="button"
              className="report-preset-btn"
              onClick={() => applyDatePreset('ALL')}
            >
              All Dates
            </button>
          </div>
        )}
      </div>

      {/* Grid of Clean, Independent Filter Fields */}
      <div className="report-filters-grid">
        {/* COMMON DATE PICKERS FOR DATE-CAPABLE REPORTS */}
        {isDateEnabledReport && (
          <>
            {/* Field 1: From Date */}
            <div className="report-filter-field">
              <label className="report-filter-label" htmlFor="report-filter-from-date">
                <Calendar size={13} /> From Date
              </label>
              <input
                id="report-filter-from-date"
                type="date"
                className="report-filter-input"
                value={filters.fromDate || ''}
                onChange={(e) => handleChange('fromDate', e.target.value)}
              />
            </div>

            {/* Field 2: To Date */}
            <div className="report-filter-field">
              <label className="report-filter-label" htmlFor="report-filter-to-date">
                <Calendar size={13} /> To Date
              </label>
              <input
                id="report-filter-to-date"
                type="date"
                className="report-filter-input"
                value={filters.toDate || ''}
                onChange={(e) => handleChange('toDate', e.target.value)}
              />
            </div>
          </>
        )}

        {/* 1. ASSET USAGE REPORT FILTERS */}
        {reportType === 'ASSET_USAGE' && (
          <>
            {/* Field 3: Part Number / Cartridge */}
            <div className="report-filter-field">
              <label className="report-filter-label">Part Number / Cartridge</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. 070-BLK, W2041X..."
                value={filters.partNumber || ''}
                onChange={(e) => handleChange('partNumber', e.target.value)}
              />
            </div>

            {/* Field 4: Engineer Name / No. */}
            <div className="report-filter-field">
              <label className="report-filter-label">Engineer Name / No.</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. Sagar Varshney, ENG..."
                value={filters.engineer || ''}
                onChange={(e) => handleChange('engineer', e.target.value)}
              />
            </div>

            {/* Field 5: Beneficiary / Emp No. */}
            <div className="report-filter-field">
              <label className="report-filter-label">Beneficiary / Emp No.</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. Anjali, 93917..."
                value={filters.beneficiary || ''}
                onChange={(e) => handleChange('beneficiary', e.target.value)}
              />
            </div>

            {/* Field 6 (Row 2, Col 1): Department */}
            <div className="report-filter-field">
              <label className="report-filter-label">Department</label>
              <select
                className="report-filter-select"
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

            {/* Field 7 (Row 2, Col 2): Location / Complex */}
            <div className="report-filter-field">
              <label className="report-filter-label">Location / Complex</label>
              <select
                className="report-filter-select"
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

            {/* Field 8 (Row 2, Col 3): Colour */}
            <div className="report-filter-field">
              <label className="report-filter-label">Colour</label>
              <select
                className="report-filter-select"
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

        {/* 2. STORE INVENTORY REPORT FILTERS */}
        {reportType === 'STORE_INVENTORY' && (
          <>
            <div className="report-filter-field">
              <label className="report-filter-label">Part Number / Cartridge</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. 070-BLK, W2040X..."
                value={filters.partNumber || ''}
                onChange={(e) => handleChange('partNumber', e.target.value)}
              />
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Stock Status</label>
              <select
                className="report-filter-select"
                value={filters.status || 'ALL'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ALL">All Stock Levels</option>
                <option value="AVAILABLE">Normal Available</option>
                <option value="LOW_STOCK">Low Stock (Below Threshold)</option>
                <option value="OUT_OF_STOCK">Out of Stock (Zero)</option>
              </select>
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Location / Store Room</label>
              <select
                className="report-filter-select"
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

        {/* 3. PROCUREMENT / RATE CONTRACT REPORT FILTERS */}
        {reportType === 'PROCUREMENT' && (
          <>
            <div className="report-filter-field">
              <label className="report-filter-label">Rate Contract Number</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. RC-2026-001..."
                value={filters.rateContract || ''}
                onChange={(e) => handleChange('rateContract', e.target.value)}
              />
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Part Number / Cartridge</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. 070-BLK, W2041X..."
                value={filters.partNumber || ''}
                onChange={(e) => handleChange('partNumber', e.target.value)}
              />
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Vendor / Supplier</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="Vendor name..."
                value={filters.supplier || ''}
                onChange={(e) => handleChange('supplier', e.target.value)}
              />
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Agreement Status</label>
              <select
                className="report-filter-select"
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

        {/* 4. CALL-UP PO REPORT FILTERS */}
        {reportType === 'CALL_UP_PO' && (
          <>
            <div className="report-filter-field">
              <label className="report-filter-label">Call-Up PO Number</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. PO-2026-004..."
                value={filters.poNumber || ''}
                onChange={(e) => handleChange('poNumber', e.target.value)}
              />
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Rate Contract Ref</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="Rate contract number..."
                value={filters.rateContract || ''}
                onChange={(e) => handleChange('rateContract', e.target.value)}
              />
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Execution Status</label>
              <select
                className="report-filter-select"
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

        {/* 5. EMPLOYEE REPORT FILTERS */}
        {reportType === 'EMPLOYEE' && (
          <>
            <div className="report-filter-field">
              <label className="report-filter-label">Employee Number / Name</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. 93917 or Rajesh..."
                value={filters.employeeNumber || filters.name || ''}
                onChange={(e) => {
                  handleChange('employeeNumber', e.target.value);
                  handleChange('name', e.target.value);
                }}
              />
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Department</label>
              <select
                className="report-filter-select"
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

            <div className="report-filter-field">
              <label className="report-filter-label">Status</label>
              <select
                className="report-filter-select"
                value={filters.status || 'ALL'}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Location / Complex</label>
              <select
                className="report-filter-select"
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

        {/* 6. STOCK MOVEMENT REPORT FILTERS */}
        {reportType === 'STOCK_HISTORY' && (
          <>
            <div className="report-filter-field">
              <label className="report-filter-label">Part Number</label>
              <input
                type="text"
                className="report-filter-input"
                placeholder="e.g. 070-BLK..."
                value={filters.partNumber || ''}
                onChange={(e) => handleChange('partNumber', e.target.value)}
              />
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Transaction Type</label>
              <select
                className="report-filter-select"
                value={filters.transactionType || 'ALL'}
                onChange={(e) => handleChange('transactionType', e.target.value)}
              >
                <option value="ALL">All Transaction Types</option>
                <option value="USAGE">Consumable Usage (Outward)</option>
                <option value="PURCHASE_RECEIPT">PO Goods Receipt (Inward)</option>
                <option value="ADJUSTMENT">Stock Adjustment</option>
              </select>
            </div>

            <div className="report-filter-field">
              <label className="report-filter-label">Movement Direction</label>
              <select
                className="report-filter-select"
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

        {/* Filter Action Column: Apply Filters & Reset Buttons */}
        <div className="report-filter-field">
          <label className="report-filter-label" style={{ visibility: 'hidden' }}>
            Action
          </label>
          <div className="report-filter-actions">
            <button
              type="button"
              className="report-btn-apply"
              onClick={onApplyFilters}
            >
              <Check size={14} />
              <span>Apply Filters</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                className="report-btn-reset"
                onClick={onResetFilters}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportFilters;
