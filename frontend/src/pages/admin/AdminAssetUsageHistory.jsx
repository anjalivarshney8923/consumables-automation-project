import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ClipboardList,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  getAdminAssetUsageHistory,
  getAdminAssetUsageSummary,
  exportAdminAssetUsageHistory
} from '../../services/assetUsageHistoryService';
import { getActiveCartridges } from '../../services/cartridgeService';
import { AdminAssetUsageSummaryCards } from '../../components/admin/usage/AdminAssetUsageSummaryCards';
import { AdminAssetUsageFilters } from '../../components/admin/usage/AdminAssetUsageFilters';
import { AdminAssetUsageTable } from '../../components/admin/usage/AdminAssetUsageTable';

export const AdminAssetUsageHistory = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data states
  const [records, setRecords] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [cartridgeOptions, setCartridgeOptions] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCartridgeId, setSelectedCartridgeId] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [engineerSearch, setEngineerSearch] = useState('');
  const [beneficiarySearch, setBeneficiarySearch] = useState('');
  const [sortBy, setSortBy] = useState('LATEST');

  // Load cartridge master options for dropdown
  useEffect(() => {
    let isMounted = true;
    const loadCartridges = async () => {
      try {
        const res = await getActiveCartridges();
        if (isMounted && res.success && Array.isArray(res.data)) {
          setCartridgeOptions(res.data);
        }
      } catch {
        // Silently continue if unavailable
      }
    };
    loadCartridges();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Usage History & Summary from API
  const fetchData = useCallback(async (isUserRefresh = false) => {
    if (isUserRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Map sort string to backend parameters
      let sortByField = 'usageDate';
      let sortDir = 'desc';

      if (sortBy === 'OLDEST') {
        sortByField = 'usageDate';
        sortDir = 'asc';
      } else if (sortBy === 'QTY_HIGH') {
        sortByField = 'quantityUsed';
        sortDir = 'desc';
      } else if (sortBy === 'QTY_LOW') {
        sortByField = 'quantityUsed';
        sortDir = 'asc';
      } else if (sortBy === 'ENGINEER_AZ') {
        sortByField = 'recordedByEmployeeName';
        sortDir = 'asc';
      } else if (sortBy === 'BENEFICIARY_AZ') {
        sortByField = 'beneficiaryEmployeeName';
        sortDir = 'asc';
      } else if (sortBy === 'PART_NUMBER') {
        sortByField = 'partNumber';
        sortDir = 'asc';
      }

      // Fetch history and summary in parallel
      const [historyRes, summaryRes] = await Promise.all([
        getAdminAssetUsageHistory({
          search: searchTerm || undefined,
          cartridgeId: selectedCartridgeId !== 'ALL' ? selectedCartridgeId : undefined,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
          location: selectedLocation || undefined,
          engineer: engineerSearch || undefined,
          beneficiary: beneficiarySearch || undefined,
          page: currentPage - 1, // 0-indexed for backend
          size: pageSize,
          sortBy: sortByField,
          sortDir: sortDir
        }),
        getAdminAssetUsageSummary()
      ]);

      if (historyRes.success) {
        const data = historyRes.data;
        if (Array.isArray(data)) {
          setRecords(data);
          setTotalElements(data.length);
          setTotalPages(Math.ceil(data.length / pageSize) || 1);
        } else if (data && typeof data === 'object') {
          setRecords(Array.isArray(data.content) ? data.content : []);
          setTotalElements(Number(data.totalElements || data.totalRecords || 0));
          setTotalPages(Number(data.totalPages || 1));
        } else {
          setRecords([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      } else {
        setError(historyRes.message || 'Unable to load asset usage history.');
        setRecords([]);
      }

      if (summaryRes.success && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching asset usage data.');
      setRecords([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [
    searchTerm,
    selectedCartridgeId,
    fromDate,
    toDate,
    selectedDepartment,
    selectedLocation,
    engineerSearch,
    beneficiarySearch,
    currentPage,
    pageSize,
    sortBy
  ]);

  // Execute fetch on dependency changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset pagination to page 1 on filter changes
  const handleFilterChange = (setter) => (val) => {
    setter(val);
    setCurrentPage(1);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCartridgeId('ALL');
    setFromDate('');
    setToDate('');
    setSelectedDepartment('ALL');
    setSelectedLocation('');
    setEngineerSearch('');
    setBeneficiarySearch('');
    setSortBy('LATEST');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Export action
  const handleExport = async (format = 'csv') => {
    setIsExporting(true);
    try {
      await exportAdminAssetUsageHistory({
        search: searchTerm,
        fromDate,
        toDate
      }, format);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="procurement-page-container">
      {/* ================================================================= */}
      {/* 1. PAGE HEADER                                                    */}
      {/* ================================================================= */}
      <header className="page-header-block mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--iocl-red, #B71C1C) 0%, #D32F2F 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(183, 28, 28, 0.25)',
              flexShrink: 0
            }}
          >
            <ClipboardList size={22} />
          </div>
          <div className="page-title-group">
            <h1 className="page-title-text" style={{ fontSize: '1.25rem' }}>ASSET USAGE HISTORY</h1>
            <p className="page-subtitle-text">
              View asset consumption recorded by engineers and beneficiaries
            </p>
          </div>
        </div>

        <div className="page-header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Export Button */}
          <button
            type="button"
            className="btn-refresh"
            onClick={() => handleExport('csv')}
            disabled={isExporting || loading}
            title="Export usage records to CSV"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Download size={15} />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            className="btn-header-primary"
            onClick={() => fetchData(true)}
            disabled={isRefreshing || loading}
            title="Refresh usage history from server"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: 'var(--iocl-red, #B71C1C)',
              color: '#FFFFFF',
              border: 'none',
              boxShadow: '0 2px 6px rgba(183, 28, 28, 0.25)'
            }}
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. SUMMARY KPI CARDS                                              */}
      {/* ================================================================= */}
      <AdminAssetUsageSummaryCards
        summary={summaryData}
        loading={loading}
      />

      {/* ================================================================= */}
      {/* 3. FILTERS TOOLBAR                                                */}
      {/* ================================================================= */}
      <AdminAssetUsageFilters
        searchTerm={searchTerm}
        onSearchChange={handleFilterChange(setSearchTerm)}
        selectedCartridgeId={selectedCartridgeId}
        onCartridgeChange={handleFilterChange(setSelectedCartridgeId)}
        cartridgeOptions={cartridgeOptions}
        fromDate={fromDate}
        onFromDateChange={handleFilterChange(setFromDate)}
        toDate={toDate}
        onToDateChange={handleFilterChange(setToDate)}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={handleFilterChange(setSelectedDepartment)}
        selectedLocation={selectedLocation}
        onLocationChange={handleFilterChange(setSelectedLocation)}
        engineerSearch={engineerSearch}
        onEngineerSearchChange={handleFilterChange(setEngineerSearch)}
        beneficiarySearch={beneficiarySearch}
        onBeneficiarySearchChange={handleFilterChange(setBeneficiarySearch)}
        sortBy={sortBy}
        onSortByChange={handleFilterChange(setSortBy)}
        onResetFilters={handleResetFilters}
        totalResults={totalElements}
      />

      {/* ================================================================= */}
      {/* 4. MAIN ASSET USAGE HISTORY TABLE                                 */}
      {/* ================================================================= */}
      <AdminAssetUsageTable
        records={records}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        onRetry={() => fetchData(true)}
        onClearFilters={handleResetFilters}
      />
    </div>
  );
};

export default AdminAssetUsageHistory;
