import React, { useState } from 'react';
import {
  Search,
  X,
  RotateCcw,
  SlidersHorizontal,
  Building,
  MapPin,
  Briefcase,
  Printer,
  ShieldCheck,
  Tag
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

export const AdminEmployeeFilters = ({
  searchTerm = '',
  onSearchChange,
  selectedDepartment = 'ALL',
  onDepartmentChange,
  selectedStatus = 'ALL',
  onStatusChange,
  selectedLocation = 'ALL',
  onLocationChange,
  designationSearch = '',
  onDesignationChange,
  gdSearch = '',
  onGdChange,
  printerSearch = '',
  onPrinterSearchChange,
  sortBy = 'EMP_NO_ASC',
  onSortByChange,
  onResetFilters,
  totalResults = 0
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters = Boolean(
    searchTerm ||
    (selectedDepartment && selectedDepartment !== 'ALL' && selectedDepartment !== 'All Departments') ||
    (selectedStatus && selectedStatus !== 'ALL') ||
    (selectedLocation && selectedLocation !== 'ALL' && selectedLocation !== 'All Locations') ||
    designationSearch ||
    gdSearch ||
    printerSearch ||
    sortBy !== 'EMP_NO_ASC'
  );

  return (
    <div className="procurement-filters-card mb-6">
      {/* Search Bar Row */}
      <div className="filters-top-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-field"
            placeholder="Search by employee number, name, email or department..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search Employees"
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
        {/* Department Filter */}
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

        {/* Status Filter */}
        <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <label className="filter-label">Status</label>
          <select
            className="filter-select"
            style={{ width: '100%', height: '38px' }}
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>

        {/* Sort Order Dropdown */}
        <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          <label className="filter-label">Sort Order</label>
          <select
            className="filter-select"
            style={{ width: '100%', height: '38px' }}
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
          >
            <option value="EMP_NO_ASC">Emp No. (Ascending)</option>
            <option value="EMP_NO_DESC">Emp No. (Descending)</option>
            <option value="NAME_AZ">Name (A–Z)</option>
            <option value="NAME_ZA">Name (Z–A)</option>
            <option value="DEPARTMENT">Department</option>
            <option value="DESIGNATION">Designation</option>
            <option value="STATUS">Status</option>
          </select>
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
          {/* Designation Filter */}
          <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <label className="filter-label">Designation</label>
            <input
              type="text"
              className="search-field"
              style={{ height: '38px', padding: '0.5rem 0.75rem' }}
              placeholder="e.g. Chief Manager, Engineer..."
              value={designationSearch}
              onChange={(e) => onDesignationChange(e.target.value)}
            />
          </div>

          {/* Location Filter */}
          <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <label className="filter-label">Location / Office</label>
            <select
              className="filter-select"
              style={{ width: '100%', height: '38px' }}
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
            >
              {LOCATION_OPTIONS.map((loc) => (
                <option key={loc} value={loc === 'All Locations' ? 'ALL' : loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Grade / GD Filter */}
          <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <label className="filter-label">Grade / GD</label>
            <input
              type="text"
              className="search-field"
              style={{ height: '38px', padding: '0.5rem 0.75rem' }}
              placeholder="e.g. Grade A, E, F..."
              value={gdSearch}
              onChange={(e) => onGdChange(e.target.value)}
            />
          </div>

          {/* Printer Model / Serial Filter */}
          <div className="filter-select-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <label className="filter-label">Printer / Serial No.</label>
            <input
              type="text"
              className="search-field"
              style={{ height: '38px', padding: '0.5rem 0.75rem' }}
              placeholder="Printer model or serial..."
              value={printerSearch}
              onChange={(e) => onPrinterSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEmployeeFilters;
