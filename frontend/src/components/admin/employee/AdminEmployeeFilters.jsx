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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
    <div className="filter-card mb-6">
      {/* Primary Toolbar */}
      <div className="filter-primary-row">
        {/* Search Bar */}
        <div className="filter-search-box" style={{ flex: '1 1 340px' }}>
          <Search size={18} className="filter-search-icon" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Search employee no, name, email, designation, room/cabin..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search Employees"
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

        {/* Department Filter */}
        <div className="filter-select-group" style={{ minWidth: '190px' }}>
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

        {/* Status Filter */}
        <div className="filter-select-group" style={{ minWidth: '140px' }}>
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
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
            <option value="EMP_NO_ASC">Emp No. (Ascending)</option>
            <option value="EMP_NO_DESC">Emp No. (Descending)</option>
            <option value="NAME_AZ">Name (A–Z)</option>
            <option value="NAME_ZA">Name (Z–A)</option>
            <option value="DEPARTMENT">Department</option>
            <option value="DESIGNATION">Designation</option>
            <option value="STATUS">Status</option>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Designation Filter */}
          <div className="filter-field-group">
            <label className="filter-field-label">
              <Briefcase size={13} style={{ marginRight: '4px' }} /> Designation
            </label>
            <input
              type="text"
              className="filter-search-input"
              placeholder="e.g. Chief Manager, Engineer..."
              value={designationSearch}
              onChange={(e) => onDesignationChange(e.target.value)}
            />
          </div>

          {/* Location Filter */}
          <div className="filter-field-group">
            <label className="filter-field-label">
              <MapPin size={13} style={{ marginRight: '4px' }} /> Location / Office
            </label>
            <select
              className="filter-select"
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
          <div className="filter-field-group">
            <label className="filter-field-label">
              <Tag size={13} style={{ marginRight: '4px' }} /> Grade / GD
            </label>
            <input
              type="text"
              className="filter-search-input"
              placeholder="e.g. Grade A, E, F..."
              value={gdSearch}
              onChange={(e) => onGdChange(e.target.value)}
            />
          </div>

          {/* Printer Model / Serial Filter */}
          <div className="filter-field-group">
            <label className="filter-field-label">
              <Printer size={13} style={{ marginRight: '4px' }} /> Printer / Serial No.
            </label>
            <input
              type="text"
              className="filter-search-input"
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
