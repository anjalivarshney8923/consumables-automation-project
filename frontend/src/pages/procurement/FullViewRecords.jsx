import React, { useState, useEffect, useCallback } from 'react';
import { ProcurementSummaryCards } from '../../components/procurement/ProcurementSummaryCards';
import { ProcurementFilters } from '../../components/procurement/ProcurementFilters';
import { ProcurementTable } from '../../components/procurement/ProcurementTable';
import { getProcurementRecords, getRateContracts } from '../../services/procurementService';
import { getActiveCartridges } from '../../services/cartridgeService';

export const FullViewRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination states from backend
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filter & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCartridge, setSelectedCartridge] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Dynamic filter dropdown options loaded from backend
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [cartridgeOptions, setCartridgeOptions] = useState([]);
  const statusOptions = ['Active', 'Partially Used', 'Completed', 'Low Availability'];

  // Load filter options from PostgreSQL master catalogs on mount
  useEffect(() => {
    let isMounted = true;
    const loadFilterMasters = async () => {
      const [cartRes, rcRes] = await Promise.all([
        getActiveCartridges(),
        getRateContracts()
      ]);

      if (isMounted) {
        if (cartRes.success && cartRes.data) {
          const carts = Array.from(new Set(cartRes.data.map(c => c.cartridgeName).filter(Boolean))).sort();
          setCartridgeOptions(carts);
        }
        if (rcRes.success && rcRes.data) {
          const sups = Array.from(new Set(rcRes.data.map(r => r.supplierName).filter(Boolean))).sort();
          setSupplierOptions(sups);
        }
      }
    };

    loadFilterMasters();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch real records from Spring Boot REST API (GET /api/procurement/full-view)
  const fetchRecords = useCallback(async (isManualRefresh = false, pageNum = currentPage) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const params = {
      search: searchTerm,
      supplier: selectedSupplier,
      cartridge: selectedCartridge,
      status: selectedStatus,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      page: pageNum - 1, // Spring Data 0-indexed page
      size: pageSize,
      sort: 'contractDate,desc'
    };

    try {
      const res = await getProcurementRecords(params);
      if (res.success && res.data) {
        setRecords(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
        setTotalPages(res.data.totalPages || 1);
      } else {
        setError(res.message || 'Unable to load procurement records.');
      }
    } catch (err) {
      setError('An unexpected error occurred while connecting.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchTerm, selectedSupplier, selectedCartridge, selectedStatus, fromDate, toDate, currentPage]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // When search or filter parameters change, reset to page 1
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleSupplierChange = (val) => {
    setSelectedSupplier(val);
    setCurrentPage(1);
  };

  const handleCartridgeChange = (val) => {
    setSelectedCartridge(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleFromDateChange = (val) => {
    setFromDate(val);
    setCurrentPage(1);
  };

  const handleToDateChange = (val) => {
    setToDate(val);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchRecords(true, currentPage);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSupplier('');
    setSelectedCartridge('');
    setSelectedStatus('');
    setFromDate('');
    setToDate('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="procurement-page-container">
      {/* 3. Page Header */}
      <header className="page-header-block mb-6">
        <div className="page-title-group">
          <h1 className="page-title-text">FULL VIEW OF RECORDS</h1>
          <p className="page-subtitle-text">
            View and monitor complete procurement, rate contract, and call-up PO records
          </p>
        </div>
      </header>

      {/* 13. Summary Cards based on live PostgreSQL dataset */}
      <ProcurementSummaryCards records={records} />

      {/* 9, 10 & 11. Search & Filters Bar connected to Spring Boot Backend */}
      <ProcurementFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedSupplier={selectedSupplier}
        onSupplierChange={handleSupplierChange}
        selectedCartridge={selectedCartridge}
        onCartridgeChange={handleCartridgeChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        suppliers={supplierOptions}
        cartridges={cartridgeOptions}
        statuses={statusOptions}
        onRefresh={handleRefresh}
        onClearFilters={handleClearFilters}
        isRefreshing={isRefreshing}
      />

      {/* 6, 14 & 15. Real Procurement Table with Server-Side Pagination */}
      <ProcurementTable
        records={records}
        loading={loading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
};
