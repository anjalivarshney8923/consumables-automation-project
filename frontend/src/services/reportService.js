/**
 * IOCL Consumables & Procurement Management System
 * Admin Reports & Excel Export API Service
 * 
 * Central API service prepared for generating operational reports and Excel exports across
 * Asset Usage, Store Inventory, Rate Contracts, Call-Up POs, Employees, and Store Stock History.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('iocl_auth_token') || localStorage.getItem('iocl_auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Fetch report data table for the selected report type and filters.
 * 
 * @param {string} reportType - 'ASSET_USAGE' | 'STORE_INVENTORY' | 'PROCUREMENT' | 'CALL_UP_PO' | 'EMPLOYEE' | 'STOCK_HISTORY'
 * @param {Object} filters
 * @param {number} [page=0]
 * @param {number} [size=10]
 * @param {string} [sortBy]
 * @param {string} [sortDir]
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number }>}
 */
export const getReportData = async (reportType, filters = {}, page = 0, size = 10, sortBy = '', sortDir = 'desc') => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', reportType);
    queryParams.append('page', page);
    queryParams.append('size', size);
    if (sortBy) queryParams.append('sortBy', sortBy);
    if (sortDir) queryParams.append('sortDir', sortDir);

    // Append all defined filters
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'ALL' && val !== 'All') {
        queryParams.append(key, String(val).trim());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/reports/data?${queryParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok && data) {
      return { success: true, data };
    }

    // 404 fallback during frontend development stage
    if (response.status === 404) {
      return {
        success: true,
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          page: 0,
          size: 10
        },
        message: 'Reports endpoint is prepared for backend integration.'
      };
    }

    const errorMsg = data?.message || data?.error || `Server error (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};

/**
 * Fetch report summary metrics for summary KPI cards.
 * 
 * @param {string} reportType
 * @param {Object} filters
 * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
 */
export const getReportSummary = async (reportType, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', reportType);

    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'ALL' && val !== 'All') {
        queryParams.append(key, String(val).trim());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/reports/summary?${queryParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok && data) {
      return { success: true, data };
    }

    return {
      success: true,
      data: null
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error fetching report summary.'
    };
  }
};

/**
 * Export report to Excel file (.xlsx) from backend.
 * 
 * @param {string} reportType
 * @param {Object} filters
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const exportReportExcel = async (reportType, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', reportType);

    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'ALL' && val !== 'All') {
        queryParams.append(key, String(val).trim());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/reports/export/excel?${queryParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `IOCL_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;

      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: `Report exported successfully as ${filename}` };
    }

    return {
      success: false,
      message: 'Excel export endpoint will be connected during backend integration.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to server for Excel export.'
    };
  }
};

/**
 * Export report to CSV file (.csv) from backend.
 * 
 * @param {string} reportType
 * @param {Object} filters
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const exportReportCsv = async (reportType, filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('reportType', reportType);

    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'ALL' && val !== 'All') {
        queryParams.append(key, String(val).trim());
      }
    });

    const response = await fetch(`${API_BASE_URL}/api/admin/reports/export/csv?${queryParams.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const blob = await response.blob();
      const filename = `IOCL_${reportType}_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true, message: `Report exported successfully as ${filename}` };
    }

    return {
      success: false,
      message: 'CSV export endpoint will be connected during backend integration.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to server for CSV export.'
    };
  }
};
