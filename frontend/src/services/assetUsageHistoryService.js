/**
 * IOCL Consumables & Procurement Management System
 * Admin Asset Usage History API Service
 * 
 * Provides an audit interface for Administrators to inspect all consumable usage
 * transactions recorded by maintenance engineers across the enterprise.
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
 * Fetch paginated Admin Asset Usage History records with search and filters.
 * 
 * @param {Object} params
 * @param {string} [params.search] - General keyword (engineer, beneficiary, employee no, part no, printer, usage ID)
 * @param {string} [params.fromDate] - ISO Date 'YYYY-MM-DD'
 * @param {string} [params.toDate] - ISO Date 'YYYY-MM-DD'
 * @param {string|number} [params.cartridgeId] - Filter by specific Cartridge ID
 * @param {string} [params.partNumber] - Filter by Part Number (e.g. '070-BLK')
 * @param {string} [params.engineer] - Filter by Engineer Name or Employee No
 * @param {string} [params.beneficiary] - Filter by Beneficiary Name or Employee No
 * @param {string} [params.department] - Filter by Department
 * @param {string} [params.location] - Filter by Location / Office
 * @param {number} [params.page=0] - 0-indexed page number
 * @param {number} [params.size=10] - Page size
 * @param {string} [params.sortBy='usageDate'] - Sort field
 * @param {string} [params.sortDir='desc'] - 'asc' | 'desc'
 * 
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number }>}
 */
export const getAdminAssetUsageHistory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.search?.trim()) queryParams.append('search', params.search.trim());
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.cartridgeId && params.cartridgeId !== 'ALL' && params.cartridgeId !== 'All Cartridges') {
      queryParams.append('cartridgeId', params.cartridgeId);
    }
    if (params.partNumber && params.partNumber !== 'ALL' && params.partNumber !== 'All Parts') {
      queryParams.append('partNumber', params.partNumber.trim());
    }
    if (params.engineer?.trim()) queryParams.append('engineer', params.engineer.trim());
    if (params.beneficiary?.trim()) queryParams.append('beneficiary', params.beneficiary.trim());
    if (params.department && params.department !== 'ALL' && params.department !== 'All Departments') {
      queryParams.append('department', params.department.trim());
    }
    if (params.location && params.location !== 'ALL' && params.location !== 'All Locations') {
      queryParams.append('location', params.location.trim());
    }

    queryParams.append('page', params.page !== undefined ? params.page : 0);
    queryParams.append('size', params.size || 10);
    queryParams.append('sortBy', params.sortBy || 'usageDate');
    queryParams.append('sortDir', params.sortDir || 'desc');

    const url = `${API_BASE_URL}/api/admin/asset-usage/history?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok) {
      return {
        success: true,
        data: data || {
          content: [],
          totalElements: 0,
          totalPages: 0,
          totalRecords: 0,
          totalQuantityUsed: 0,
          totalEngineers: 0,
          totalBeneficiaries: 0
        }
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
 * Fetch high-level enterprise summary KPIs for Admin Asset Usage History.
 * 
 * @returns {Promise<{ success: boolean, data?: { totalRecords: number, totalQuantityUsed: number, totalEngineers: number, totalBeneficiaries: number }, message?: string }>}
 */
export const getAdminAssetUsageSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/asset-usage/summary`, {
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
      success: false,
      message: data?.message || 'Failed to fetch usage summary.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error fetching asset usage summary.'
    };
  }
};

/**
 * Fetch single usage transaction audit details by ID for Admin inspection.
 * 
 * @param {string|number} id
 * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
 */
export const getAdminAssetUsageById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/asset-usage/${id}`, {
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
      success: false,
      message: data?.message || 'Failed to fetch transaction details.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error fetching usage details.'
    };
  }
};

/**
 * Export Admin Asset Usage History (CSV / Excel format preparation).
 * 
 * @param {Object} params
 * @param {'csv'|'excel'} [format='csv']
 */
export const exportAdminAssetUsageHistory = async (params = {}, format = 'csv') => {
  try {
    const queryParams = new URLSearchParams();
    if (params.search?.trim()) queryParams.append('search', params.search.trim());
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.cartridgeId && params.cartridgeId !== 'ALL' && params.cartridgeId !== 'All Cartridges') {
      queryParams.append('cartridgeId', params.cartridgeId);
    }
    if (params.partNumber && params.partNumber !== 'ALL' && params.partNumber !== 'All Parts') {
      queryParams.append('partNumber', params.partNumber.trim());
    }
    if (params.engineer?.trim()) queryParams.append('engineer', params.engineer.trim());
    if (params.beneficiary?.trim()) queryParams.append('beneficiary', params.beneficiary.trim());
    if (params.department && params.department !== 'ALL' && params.department !== 'All Departments') {
      queryParams.append('department', params.department.trim());
    }
    if (params.location && params.location !== 'ALL' && params.location !== 'All Locations') {
      queryParams.append('location', params.location.trim());
    }

    const url = `${API_BASE_URL}/api/admin/asset-usage/export?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (response.ok) {
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `asset_usage_history_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      return { success: true };
    }

    return { success: false, message: 'Export feature is prepared for backend integration.' };
  } catch (err) {
    return { success: false, message: 'Failed to initiate export.' };
  }
};
