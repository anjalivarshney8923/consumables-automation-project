import React, { useState } from 'react';
import {
  Search,
  Calendar,
  X,
  RotateCcw,
  SlidersHorizontal,
  Building,
  MapPin,
  Package,
  User,
  ShieldCheck,
  Check,
  ChevronDown
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

export const AdminAssetUsageFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedCartridgeId = 'ALL',
  onCartridgeChange,
  cartridgeOptions = [],
  fromDate = '',
  onFromDateChange,
  toDate = '',
  onToDateChange,
  selectedDepartment = 'ALL',
  onDepartmentChange,
  selectedLocation = '',
  onLocationChange,
  engineerSearch = '',
  onEngineerSearchChange,
  beneficiarySearch = '',
  onBeneficiarySearchChange,
  sortBy = 'LATEST',
  onSortByChange,
  onResetFilters,
  totalResults = 0
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = Boolean(
    searchTerm ||
    (selectedCartridgeId && selectedCartridgeId !== 'ALL') ||
    fromDate ||
    toDate ||
    (selectedDepartment && selectedDepartment !== 'ALL' && selectedDepartment !== 'All Departments') ||
    selectedLocation ||
    engineerSearch ||
    beneficiarySearch ||
    sortBy !== 'LATEST'
  );

  const handleDatePreset = (preset) => {
    const today = new Date();
    const toDateStr = today.toISOString().slice(0, 10);

    if (preset === 'TODAY') {
      onFromDateChange(toDateStr);
      onToDateChange(toDateStr);
    } else if (preset === 'THIS_WEEK') {
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      onFromDateChange(monday.toISOString().slice(0, 10));
      onToDateChange(toDateStr);
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      onFromDateChange(firstDay.toISOString().slice(0, 10));
      onToDateChange(toDateStr);
    } else if (preset === 'ALL_TIME') {
      onFromDateChange('');
      onToDateChange('');
    }
  };

  return (
    <div className="procurement-filters-card mb-6">
      {/* Search Bar Row */}
      <div className="filters-top-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-field"
            placeholder="Search engineer, beneficiary, employee no., part number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search Asset Usage"
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filter-actions-group">
          <button
            type="button"
            className="btn-refresh"
            onClick={() => setShowAdvanced((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: showAdvanced ? 'var(--bg-surface-alt)' : '#FFFFFF'
            }}
          >
            <SlidersHorizontal size={14} />
            <span>{showAdvanced ? 'Fewer Filters' : 'More Filters'}</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-clear-all"
              onClick={onResetFilters}
              title="Reset all search filters"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Filter Grid Row */}
      <div
        className="filters-bottom-row"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          paddingTop: '0.875rem'
        }}
      >
        {/* Asset / Part Number */}
        <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <label className="filter-label">Asset / Part Number</label>
          <select
            className="filter-select"
            style={{ width: '100%', height: '38px' }}
            value={selectedCartridgeId}
            onChange={(e) => onCartridgeChange(e.target.value)}
          >
            <option value="ALL">All Assets / Part Numbers</option>
            {cartridgeOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.partNumber} &mdash; {item.cartridgeName}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <label className="filter-label">Department</label>
          <select
            className="filter-select"
            style={{ width: '100%', height: '38px' }}
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
          >
            {DEPARTMENT_OPTIONS.map((dept) => (
              <option key={dept} value={dept === 'All Departments' ? 'ALL' : dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <label className="filter-label">Sort Order</label>
          <select
            className="filter-select"
            style={{ width: '100%', height: '38px' }}
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="LATEST">Latest First (Default)</option>
            <option value="OLDEST">Oldest First</option>
            <option value="QTY_HIGH">Quantity (High to Low)</option>
            <option value="QTY_LOW">Quantity (Low to High)</option>
            <option value="ENGINEER_AZ">Engineer Name (A–Z)</option>
            <option value="BENEFICIARY_AZ">Beneficiary (A–Z)</option>
            <option value="PART_NUMBER">Part Number (A–Z)</option>
          </select>
        </div>

        {/* From Date */}
        <div className="filter-date-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <label className="filter-label">From Date</label>
          <input
            type="date"
            className="filter-date-input"
            style={{ width: '100%', height: '38px' }}
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
          />
        </div>

        {/* To Date */}
        <div className="filter-date-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <label className="filter-label">To Date</label>
          <input
            type="date"
            className="filter-date-input"
            style={{ width: '100%', height: '38px' }}
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
          />
        </div>
      </div>

      {/* Advanced Expandable Filter Row */}
      {showAdvanced && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            paddingTop: '0.875rem',
            borderTop: '1px dashed var(--border-subtle)'
          }}
        >
          {/* Specific Engineer Filter */}
          <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <label className="filter-label">Engineer / Maintenance Staff</label>
            <input
              type="text"
              className="search-field"
              style={{ height: '38px', padding: '0.5rem 0.75rem' }}
              placeholder="Name or Emp No..."
              value={engineerSearch}
              onChange={(e) => onEngineerSearchChange(e.target.value)}
            />
          </div>

          {/* Specific Beneficiary Filter */}
          <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <label className="filter-label">Beneficiary Employee</label>
            <input
              type="text"
              className="search-field"
              style={{ height: '38px', padding: '0.5rem 0.75rem' }}
              placeholder="Beneficiary or Emp No..."
              value={beneficiarySearch}
              onChange={(e) => onBeneficiarySearchChange(e.target.value)}
            />
          </div>

          {/* Location Filter */}
          <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <label className="filter-label">Location / Office</label>
            <input
              type="text"
              className="search-field"
              style={{ height: '38px', padding: '0.5rem 0.75rem' }}
              placeholder="e.g. Refinery, Admin Block..."
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>

          {/* Quick Date Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', gridColumn: '1 / -1' }}>
            <span className="filter-label">Quick Date Presets</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-preset"
                onClick={() => handleDatePreset('TODAY')}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: '#FFFFFF', cursor: 'pointer' }}
              >
                Today
              </button>
              <button
                type="button"
                className="btn-preset"
                onClick={() => handleDatePreset('THIS_WEEK')}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: '#FFFFFF', cursor: 'pointer' }}
              >
                This Week
              </button>
              <button
                type="button"
                className="btn-preset"
                onClick={() => handleDatePreset('THIS_MONTH')}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: '#FFFFFF', cursor: 'pointer' }}
              >
                This Month
              </button>
              <button
                type="button"
                className="btn-preset"
                onClick={() => handleDatePreset('ALL_TIME')}
                style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-medium)', background: '#FFFFFF', cursor: 'pointer' }}
              >
                All Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssetUsageFilters;
