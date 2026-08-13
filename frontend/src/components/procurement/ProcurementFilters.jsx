import React from 'react';
import { Search, RefreshCw, XCircle, Calendar, Filter } from 'lucide-react';

export const ProcurementFilters = ({
  searchTerm,
  onSearchChange,
  selectedSupplier,
  onSupplierChange,
  selectedCartridge,
  onCartridgeChange,
  selectedStatus,
  onStatusChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  suppliers = [],
  cartridges = [],
  statuses = [],
  onRefresh,
  onClearFilters,
  isRefreshing
}) => {
  const hasActiveFilters =
    searchTerm ||
    selectedSupplier ||
    selectedCartridge ||
    selectedStatus ||
    fromDate ||
    toDate;

  return (
    <div className="procurement-filters-card mb-6">
      {/* Search Row */}
      <div className="filters-top-row">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-field"
            placeholder="Search by supplier, cartridge, part number, printer..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>

        <div className="filter-actions-group">
          <button
            type="button"
            className="btn-refresh"
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Refresh procurement records"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-clear-all"
              onClick={onClearFilters}
              title="Reset all search filters"
            >
              <XCircle size={15} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="filters-bottom-row">
        <div className="filter-select-group">
          <label className="filter-label" htmlFor="supplier-filter">
            Supplier:
          </label>
          <select
            id="supplier-filter"
            className="filter-select"
            value={selectedSupplier}
            onChange={(e) => onSupplierChange(e.target.value)}
          >
            <option value="">All Suppliers</option>
            {suppliers.map((sup) => (
              <option key={sup} value={sup}>
                {sup}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label" htmlFor="cartridge-filter">
            Cartridge:
          </label>
          <select
            id="cartridge-filter"
            className="filter-select"
            value={selectedCartridge}
            onChange={(e) => onCartridgeChange(e.target.value)}
          >
            <option value="">All Cartridges</option>
            {cartridges.map((cart) => (
              <option key={cart} value={cart}>
                {cart}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-select-group">
          <label className="filter-label" htmlFor="status-filter">
            Status:
          </label>
          <select
            id="status-filter"
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All Statuses</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Date Filters */}
        <div className="filter-date-group">
          <label className="filter-label" htmlFor="from-date">
            From:
          </label>
          <div className="date-input-wrapper">
            <input
              id="from-date"
              type="date"
              className="filter-date-input"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-date-group">
          <label className="filter-label" htmlFor="to-date">
            To:
          </label>
          <div className="date-input-wrapper">
            <input
              id="to-date"
              type="date"
              className="filter-date-input"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
