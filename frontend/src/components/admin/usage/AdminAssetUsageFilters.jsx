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
  ArrowUpDown
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  // Quick Date Preset helper
  const handleQuickDatePreset = (preset) => {
    const today = new Date();
    const toDateStr = today.toISOString().slice(0, 10);

    if (preset === 'TODAY') {
      onFromDateChange(toDateStr);
      onToDateChange(toDateStr);
    } else if (preset === 'THIS_WEEK') {
      const dayOfWeek = today.getDay(); // 0 is Sunday
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
    <div className="filter-card mb-6">
      {/* Primary Toolbar */}
      <div className="filter-primary-row">
        {/* Search Bar */}
        <div className="filter-search-box" style={{ flex: '1 1 340px' }}>
          <Search size={18} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search engineer, beneficiary, employee no., part number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search Asset Usage History"
          />
          {searchTerm && (
            <button
              type="button"
              className="filter-clear-icon-btn"
              onClick={() => onSearchChange('')}
              aria-label="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Part Number / Cartridge Filter */}
        <div className="filter-select-group" style={{ minWidth: '220px' }}>
          <select
            className="filter-select"
            value={selectedCartridgeId}
            onChange={(e) => onCartridgeChange(e.target.value)}
            aria-label="Filter by Asset / Part Number"
          >
            <option value="ALL">All Assets / Part Numbers</option>
            {cartridgeOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.partNumber} — {item.cartridgeName}
              </option>
            ))}
          </select>
        </div>

        {/* Department Filter */}
        <div className="filter-select-group" style={{ minWidth: '180px' }}>
          <select
            className="filter-select"
            value={selectedDepartment}
            onChange={(e) => onDepartmentChange(e.target.value)}
            aria-label="Filter by Department"
          >
            {DEPARTMENT_OPTIONS.map((dept) => (
              <option key={dept} value={dept === 'All Departments' ? 'ALL' : dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order Dropdown */}
        <div className="filter-select-group" style={{ minWidth: '170px' }}>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            aria-label="Sort Order"
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

        {/* Toggle Advanced Filters */}
        <button
          type="button"
          className={`btn-filter-toggle ${showAdvancedFilters ? 'active' : ''}`}
          onClick={() => setShowAdvancedFilters((prev) => !prev)}
          aria-expanded={showAdvancedFilters}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {hasActiveFilters && <span className="filter-active-dot" />}
        </button>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            className="btn-filter-reset"
            onClick={onResetFilters}
            title="Reset all filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Drawer */}
      {showAdvancedFilters && (
        <div
          className="filter-advanced-panel mt-4 pt-4"
          style={{
            borderTop: '1px solid var(--border-color, #E2E8F0)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Specific Engineer Filter */}
          <div className="filter-field-group">
            <label className="filter-field-label">
              <User size={13} style={{ marginRight: '4px' }} /> Engineer / Maintenance Staff
            </label>
            <input
              type="text"
              className="filter-search-input"
              placeholder="Name or Emp No..."
              value={engineerSearch}
              onChange={(e) => onEngineerSearchChange(e.target.value)}
            />
          </div>

          {/* Specific Beneficiary Filter */}
          <div className="filter-field-group">
            <label className="filter-field-label">
              <ShieldCheck size={13} style={{ marginRight: '4px' }} /> Beneficiary Employee
            </label>
            <input
              type="text"
              className="filter-search-input"
              placeholder="Beneficiary or Emp No..."
              value={beneficiarySearch}
              onChange={(e) => onBeneficiarySearchChange(e.target.value)}
            />
          </div>

          {/* Location Filter */}
          <div className="filter-field-group">
            <label className="filter-field-label">
              <MapPin size={13} style={{ marginRight: '4px' }} /> Location / Office
            </label>
            <input
              type="text"
              className="filter-search-input"
              placeholder="e.g. Refinery, Admin Block..."
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
            />
          </div>

          {/* Date Range: From Date */}
          <div className="filter-field-group">
            <label className="filter-field-label">
              <Calendar size={13} style={{ marginRight: '4px' }} /> From Date
            </label>
            <input
              type="date"
              className="filter-input-date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
            />
          </div>

          {/* Date Range: To Date */}
          <div className="filter-field-group">
            <label className="filter-field-label">
              <Calendar size={13} style={{ marginRight: '4px' }} /> To Date
            </label>
            <input
              type="date"
              className="filter-input-date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
            />
          </div>

          {/* Quick Date Presets */}
          <div className="filter-field-group" style={{ gridColumn: '1 / -1' }}>
            <label className="filter-field-label" style={{ marginBottom: '6px' }}>
              Quick Date Presets
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-date-preset"
                onClick={() => handleQuickDatePreset('TODAY')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color, #CBD5E1)',
                  background: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                Today
              </button>
              <button
                type="button"
                className="btn-date-preset"
                onClick={() => handleQuickDatePreset('THIS_WEEK')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color, #CBD5E1)',
                  background: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                This Week
              </button>
              <button
                type="button"
                className="btn-date-preset"
                onClick={() => handleQuickDatePreset('THIS_MONTH')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color, #CBD5E1)',
                  background: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                This Month
              </button>
              <button
                type="button"
                className="btn-date-preset"
                onClick={() => handleQuickDatePreset('ALL_TIME')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color, #CBD5E1)',
                  background: '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
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
