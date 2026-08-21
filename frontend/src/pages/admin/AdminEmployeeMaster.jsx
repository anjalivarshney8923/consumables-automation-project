import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  getEmployees,
  getEmployeeSummary,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus
} from '../../services/employeeService';
import { AdminEmployeeSummaryCards } from '../../components/admin/employee/AdminEmployeeSummaryCards';
import { AdminEmployeeFilters } from '../../components/admin/employee/AdminEmployeeFilters';
import { AdminEmployeeTable } from '../../components/admin/employee/AdminEmployeeTable';
import { AdminEmployeeFormModal } from '../../components/admin/employee/AdminEmployeeFormModal';

export const AdminEmployeeMaster = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data states
  const [employees, setEmployees] = useState([]);
  const [summaryData, setSummaryData] = useState({});

  // UI states
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null); // { type: 'success'|'info'|'error', message: '' }

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedLocation, setSelectedLocation] = useState('ALL');
  const [designationSearch, setDesignationSearch] = useState('');
  const [gdSearch, setGdSearch] = useState('');
  const [printerSearch, setPrinterSearch] = useState('');
  const [sortBy, setSortBy] = useState('EMP_NO_ASC');

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => {
        setFeedbackToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  // Fetch Employees & Summary from service
  const fetchData = useCallback(async (isUserRefresh = false) => {
    if (isUserRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // Map sort string to backend parameters
      let sortByField = 'employeeId';
      let sortDir = 'asc';

      if (sortBy === 'EMP_NO_DESC') {
        sortByField = 'employeeId';
        sortDir = 'desc';
      } else if (sortBy === 'NAME_AZ') {
        sortByField = 'fullName';
        sortDir = 'asc';
      } else if (sortBy === 'NAME_ZA') {
        sortByField = 'fullName';
        sortDir = 'desc';
      } else if (sortBy === 'DEPARTMENT') {
        sortByField = 'department';
        sortDir = 'asc';
      } else if (sortBy === 'DESIGNATION') {
        sortByField = 'designation';
        sortDir = 'asc';
      } else if (sortBy === 'STATUS') {
        sortByField = 'status';
        sortDir = 'asc';
      }

      // Fetch employee list and summary in parallel
      const [empRes, summaryRes] = await Promise.all([
        getEmployees({
          search: searchTerm || undefined,
          department: selectedDepartment !== 'ALL' ? selectedDepartment : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          location: selectedLocation !== 'ALL' ? selectedLocation : undefined,
          designation: designationSearch || undefined,
          page: currentPage - 1, // 0-indexed for backend
          size: pageSize,
          sortBy: sortByField,
          sortDir: sortDir
        }),
        getEmployeeSummary()
      ]);

      if (empRes.success) {
        const data = empRes.data;
        if (Array.isArray(data)) {
          setEmployees(data);
          setTotalElements(data.length);
          setTotalPages(Math.ceil(data.length / pageSize) || 1);
        } else if (data && typeof data === 'object') {
          setEmployees(Array.isArray(data.content) ? data.content : []);
          setTotalElements(Number(data.totalElements || data.totalEmployees || 0));
          setTotalPages(Number(data.totalPages || 1));
        } else {
          setEmployees([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      } else {
        setError(empRes.message || 'Unable to load employees.');
        setEmployees([]);
      }

      if (summaryRes.success && summaryRes.data) {
        setSummaryData(summaryRes.data);
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching employee data.');
      setEmployees([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [
    searchTerm,
    selectedDepartment,
    selectedStatus,
    selectedLocation,
    designationSearch,
    gdSearch,
    printerSearch,
    currentPage,
    pageSize,
    sortBy
  ]);

  // Execute fetch on dependency change
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
    setSelectedDepartment('ALL');
    setSelectedStatus('ALL');
    setSelectedLocation('ALL');
    setDesignationSearch('');
    setGdSearch('');
    setPrinterSearch('');
    setSortBy('EMP_NO_ASC');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Add Employee Handler
  const handleAddEmployee = async (employeeData) => {
    setIsProcessing(true);
    try {
      const res = await createEmployee(employeeData);
      if (res.success) {
        setFeedbackToast({
          type: 'success',
          message: res.message || 'Employee added successfully.'
        });
        setIsAddModalOpen(false);
        fetchData(true);
      } else {
        setFeedbackToast({
          type: 'error',
          message: res.message || 'Failed to add employee.'
        });
      }
    } catch (err) {
      setFeedbackToast({
        type: 'error',
        message: 'Error saving employee. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update Employee Handler
  const handleUpdateEmployee = async (id, employeeData) => {
    setIsProcessing(true);
    try {
      const res = await updateEmployee(id, employeeData);
      if (res.success) {
        setFeedbackToast({
          type: 'success',
          message: res.message || 'Employee updated successfully.'
        });
        fetchData(true);
      } else {
        setFeedbackToast({
          type: 'error',
          message: res.message || 'Failed to update employee.'
        });
      }
    } catch (err) {
      setFeedbackToast({
        type: 'error',
        message: 'Error updating employee. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Status Change / Deactivate Handler
  const handleStatusChange = async (id, newStatus) => {
    setIsProcessing(true);
    try {
      const res = await toggleEmployeeStatus(id, newStatus);
      if (res.success) {
        setFeedbackToast({
          type: 'success',
          message: res.message || `Employee status changed to ${newStatus}.`
        });
        fetchData(true);
      } else {
        setFeedbackToast({
          type: 'error',
          message: res.message || 'Failed to change employee status.'
        });
      }
    } catch (err) {
      setFeedbackToast({
        type: 'error',
        message: 'Error updating status. Please try again.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="procurement-page-container">
      {/* Toast Notification */}
      {feedbackToast && (
        <div
          className={`toast-notification toast-${feedbackToast.type}`}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '8px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            background: feedbackToast.type === 'success' ? '#065F46' : feedbackToast.type === 'error' ? '#991B1B' : '#1E293B',
            color: '#FFFFFF',
            fontSize: '0.875rem',
            fontWeight: 600,
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          {feedbackToast.type === 'success' && <CheckCircle2 size={18} color="#34D399" />}
          {feedbackToast.type === 'error' && <AlertCircle size={18} color="#F87171" />}
          <span>{feedbackToast.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', marginLeft: '6px' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ================================================================= */}
      {/* 1. PAGE HEADER                                                    */}
      {/* ================================================================= */}
      <div className="page-header-card mb-6">
        <div className="page-header-title-area">
          <div className="page-header-icon-box">
            <Users size={24} className="text-navy" />
          </div>
          <div>
            <h1 className="page-main-title">EMPLOYEE MASTER</h1>
            <p className="page-main-subtitle">
              Manage employee, beneficiary, department and workplace information.
            </p>
          </div>
        </div>

        <div className="page-header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Add Employee Button */}
          <button
            type="button"
            className="btn-header-primary"
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: 'var(--iocl-navy, #002D62)',
              color: '#FFFFFF',
              border: 'none'
            }}
          >
            <UserPlus size={16} />
            <span>+ ADD EMPLOYEE</span>
          </button>

          {/* Import Employees Preparation Button */}
          <button
            type="button"
            className="btn-header-secondary"
            onClick={() => setFeedbackToast({ type: 'info', message: 'Bulk Excel / CSV Import feature is prepared for future backend integration.' })}
            title="Import employee directory from Excel/CSV"
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
            <Upload size={15} />
            <span>Import</span>
          </button>

          {/* Export Button (Prepared) */}
          <button
            type="button"
            className="btn-header-secondary"
            onClick={() => setFeedbackToast({ type: 'info', message: 'Export feature is prepared for future integration.' })}
            title="Export employee records"
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
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            className="btn-header-secondary"
            onClick={() => fetchData(true)}
            disabled={isRefreshing || loading}
            title="Refresh employee directory"
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
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. SUMMARY KPI CARDS                                              */}
      {/* ================================================================= */}
      <AdminEmployeeSummaryCards
        summary={summaryData}
        loading={loading}
      />

      {/* ================================================================= */}
      {/* 3. FILTERS TOOLBAR                                                */}
      {/* ================================================================= */}
      <AdminEmployeeFilters
        searchTerm={searchTerm}
        onSearchChange={handleFilterChange(setSearchTerm)}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={handleFilterChange(setSelectedDepartment)}
        selectedStatus={selectedStatus}
        onStatusChange={handleFilterChange(setSelectedStatus)}
        selectedLocation={selectedLocation}
        onLocationChange={handleFilterChange(setSelectedLocation)}
        designationSearch={designationSearch}
        onDesignationChange={handleFilterChange(setDesignationSearch)}
        gdSearch={gdSearch}
        onGdChange={handleFilterChange(setGdSearch)}
        printerSearch={printerSearch}
        onPrinterSearchChange={handleFilterChange(setPrinterSearch)}
        sortBy={sortBy}
        onSortByChange={handleFilterChange(setSortBy)}
        onResetFilters={handleResetFilters}
        totalResults={totalElements}
      />

      {/* ================================================================= */}
      {/* 4. MAIN EMPLOYEE TABLE                                            */}
      {/* ================================================================= */}
      <AdminEmployeeTable
        employees={employees}
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
        onUpdateEmployee={handleUpdateEmployee}
        onStatusChange={handleStatusChange}
        isProcessing={isProcessing}
      />

      {/* ================================================================= */}
      {/* 5. ADD EMPLOYEE FORM MODAL                                        */}
      {/* ================================================================= */}
      <AdminEmployeeFormModal
        isOpen={isAddModalOpen}
        employee={null}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddEmployee}
        isSaving={isProcessing}
      />
    </div>
  );
};

export default AdminEmployeeMaster;
