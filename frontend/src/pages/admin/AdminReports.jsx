import React, { useState, useEffect, useCallback } from 'react';
import {
  FileBarChart2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Info,
  X
} from 'lucide-react';
import { ReportTypeSelector } from '../../components/admin/reports/ReportTypeSelector';
import { ReportSummaryCards } from '../../components/admin/reports/ReportSummaryCards';
import { ReportFilters } from '../../components/admin/reports/ReportFilters';
import { ReportActionBar } from '../../components/admin/reports/ReportActionBar';
import { ReportTable } from '../../components/admin/reports/ReportTable';
import {
  getReportData,
  getReportSummary,
  exportReportExcel,
  exportReportCsv
} from '../../services/reportService';

export const AdminReports = () => {
  // 1. Report Type Selection State (Default: ASSET_USAGE)
  const [selectedReportType, setSelectedReportType] = useState('ASSET_USAGE');

  // 2. Dynamic Filter State
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    partNumber: '',
    engineer: '',
    beneficiary: '',
    employeeNumber: '',
    department: 'ALL',
    designation: 'ALL',
    status: 'ALL',
    location: 'ALL',
    colour: 'ALL',
    supplier: '',
    rateContract: '',
    poNumber: '',
    transactionType: 'ALL',
    direction: 'ALL'
  });

  // 3. Data & KPI State
  const [reportData, setReportData] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  // 4. Pagination & Sorting State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('desc');

  // 5. Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Reset filters when changing report type
  const handleSelectReportType = (typeId) => {
    setSelectedReportType(typeId);
    setPage(0);
    setError(null);
    setReportData([]);
    setSummaryMetrics(null);
    setFilters({
      fromDate: '',
      toDate: '',
      partNumber: '',
      engineer: '',
      beneficiary: '',
      employeeNumber: '',
      department: 'ALL',
      designation: 'ALL',
      status: 'ALL',
      location: 'ALL',
      colour: 'ALL',
      supplier: '',
      rateContract: '',
      poNumber: '',
      transactionType: 'ALL',
      direction: 'ALL'
    });
  };

  // Fetch Report Data & Summary (API-ready)
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [dataRes, summaryRes] = await Promise.all([
        getReportData(selectedReportType, filters, page, size, sortBy, sortDir),
        getReportSummary(selectedReportType, filters)
      ]);

      if (dataRes.success && dataRes.data) {
        setReportData(dataRes.data.content || []);
        setTotalElements(dataRes.data.totalElements || 0);
        setTotalPages(dataRes.data.totalPages || 0);
      } else {
        setReportData([]);
        setTotalElements(0);
        setTotalPages(0);
        if (!dataRes.success && dataRes.status !== 404) {
          setError(dataRes.message || 'Failed to fetch report data.');
        }
      }

      if (summaryRes.success && summaryRes.data) {
        setSummaryMetrics(summaryRes.data);
      } else {
        setSummaryMetrics(null);
      }
    } catch (err) {
      setError('Unable to load report data from backend server.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedReportType, filters, page, size, sortBy, sortDir]);

  // Initial load
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Handle Filter Change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle Apply Filters
  const handleApplyFilters = () => {
    setPage(0);
    fetchReport();
    showToast('Filters applied to report preview.', 'info');
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setFilters({
      fromDate: '',
      toDate: '',
      partNumber: '',
      engineer: '',
      beneficiary: '',
      employeeNumber: '',
      department: 'ALL',
      designation: 'ALL',
      status: 'ALL',
      location: 'ALL',
      colour: 'ALL',
      supplier: '',
      rateContract: '',
      poNumber: '',
      transactionType: 'ALL',
      direction: 'ALL'
    });
    setPage(0);
    showToast('All filters have been reset.', 'info');
  };

  // Handle Generate Report Button
  const handleGenerateReport = () => {
    setPage(0);
    fetchReport();
    showToast('Generating report preview with selected parameters...', 'info');
  };

  // Handle Export to Excel
  const handleExportExcel = async () => {
    setIsExporting(true);
    showToast('Preparing Excel workbook download...', 'info');
    try {
      const res = await exportReportExcel(selectedReportType, filters);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message || 'Excel export endpoint will be connected during backend integration stage.', 'info');
      }
    } catch (err) {
      showToast('Error initializing Excel export.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Export to CSV
  const handleExportCsv = async () => {
    setIsExporting(true);
    showToast('Preparing CSV download...', 'info');
    try {
      const res = await exportReportCsv(selectedReportType, filters);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message || 'CSV export endpoint will be connected during backend integration stage.', 'info');
      }
    } catch (err) {
      showToast('Error exporting CSV.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle Print Preview
  const handlePrint = () => {
    window.print();
  };

  // Handle Sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(0);
  };

  return (
    <div className="procurement-page-container">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`toast-notification toast-${toast.type}`}
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '8px',
            background: toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : 'var(--iocl-navy)',
            color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          {toast.type === 'success' && <CheckCircle2 size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: '6px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <header className="page-header-block mb-6">
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
            <FileBarChart2 size={22} />
          </div>
          <div className="page-title-group">
            <h1 className="page-title-text" style={{ fontSize: '1.25rem' }}>REPORTS & EXPORT</h1>
            <p className="page-subtitle-text">
              Generate, review and export operational reports across consumables, inventory, rate contracts and employees
            </p>
          </div>
        </div>
      </header>

      {/* 1. Report Type Selector Cards */}
      <ReportTypeSelector
        selectedReportType={selectedReportType}
        onSelectReportType={handleSelectReportType}
      />

      {/* 2. Dynamic Summary Cards */}
      <ReportSummaryCards
        reportType={selectedReportType}
        summary={summaryMetrics}
        loading={isLoading}
      />

      {/* 3. Dynamic Filter Panel */}
      <ReportFilters
        reportType={selectedReportType}
        filters={filters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Action Bar (Generate, Export Excel, CSV, Print, Refresh) */}
      <ReportActionBar
        reportType={selectedReportType}
        filters={filters}
        onGenerateReport={handleGenerateReport}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        onPrint={handlePrint}
        onRefresh={fetchReport}
        loading={isLoading}
        exporting={isExporting}
      />

      {/* 5. Dynamic Report Preview Table */}
      <ReportTable
        reportType={selectedReportType}
        data={reportData}
        loading={isLoading}
        error={error}
        page={page}
        size={size}
        totalElements={totalElements}
        totalPages={totalPages}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        onPageChange={(newPage) => setPage(newPage)}
        onSizeChange={(newSize) => {
          setSize(newSize);
          setPage(0);
        }}
        onRetry={fetchReport}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default AdminReports;
