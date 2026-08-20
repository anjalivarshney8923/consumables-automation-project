/**
 * IOCL Consumables & Store Management Portal
 * Asset Usage API Service
 * 
 * Real API integration with Spring Boot + PostgreSQL backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('iocl_auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Record a new consumable cartridge usage in PostgreSQL database.
 * The backend authoritatively derives the recorded-by engineer from JWT.
 * 
 * @param {Object} usageData
 * @param {string} usageData.beneficiaryEmployeeNo
 * @param {string} usageData.beneficiaryEmployeeName
 * @param {string} usageData.beneficiaryDepartment
 * @param {string} usageData.beneficiarySeatOrCabinNo
 * @param {string} usageData.beneficiaryLocation
 * @param {string} usageData.beneficiaryEmail
 * @param {string} usageData.printerId
 * @param {string} [usageData.printerType]
 * @param {string} usageData.cartridgeId
 * @param {string} [usageData.colour]
 * @param {number} usageData.quantityUsed
 * @param {string} usageData.usageDate
 * @param {string} [usageData.remarks]
 * @param {string} [usageData.workOrderReference]
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number }>}
 */
export const recordAssetUsage = async (usageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/asset-usage`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(usageData)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok || response.status === 201) {
      return { success: true, data, status: response.status };
    }

    let errorMsg = data?.message || data?.error;
    if (data?.validationErrors) {
      const firstField = Object.keys(data.validationErrors)[0];
      errorMsg = data.validationErrors[firstField] || errorMsg;
    }

    if (response.status === 401) {
      errorMsg = 'Your session has expired. Please log in again.';
    } else if (response.status === 403) {
      errorMsg = 'You are not authorized to perform this action.';
    } else if (!errorMsg) {
      errorMsg = `Server error (${response.status}). Please try again.`;
    }

    return { success: false, message: errorMsg, status: response.status, data };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};

/**
 * Fetch authenticated engineer's usage history with optional search, date range, filters, pagination, and sorting.
 * 
 * @param {Object} [params]
 * @param {string} [params.search]
 * @param {string} [params.fromDate]
 * @param {string} [params.toDate]
 * @param {number|string} [params.cartridgeId]
 * @param {string} [params.colour]
 * @param {string} [params.printerId]
 * @param {string} [params.beneficiaryEmployeeNo]
 * @param {string} [params.department]
 * @param {string} [params.status]
 * @param {number} [params.page]
 * @param {number} [params.size]
 * @param {string} [params.sortBy]
 * @param {string} [params.sortDir]
 * @returns {Promise<{ success: boolean, data?: Object|Array, message?: string, status?: number }>}
 */
export const getUserUsageHistory = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.search && params.search.trim()) queryParams.append('search', params.search.trim());
    if (params.fromDate) queryParams.append('fromDate', params.fromDate);
    if (params.toDate) queryParams.append('toDate', params.toDate);
    if (params.cartridgeId && params.cartridgeId !== 'All Cartridges') queryParams.append('cartridgeId', params.cartridgeId);
    if (params.colour && params.colour !== 'All Colours') queryParams.append('colour', params.colour);
    if (params.printerId && params.printerId !== 'All Printers') queryParams.append('printerId', params.printerId);
    if (params.beneficiaryEmployeeNo && params.beneficiaryEmployeeNo !== 'All Employees') queryParams.append('beneficiaryEmployeeNo', params.beneficiaryEmployeeNo);
    if (params.department && params.department !== 'All Departments') queryParams.append('department', params.department);
    if (params.status && params.status !== 'All Statuses') queryParams.append('status', params.status);
    if (params.page !== undefined && params.page !== null) queryParams.append('page', params.page);
    if (params.size !== undefined && params.size !== null) queryParams.append('size', params.size);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${API_BASE_URL}/api/user/asset-usage/paged?${queryString}`
      : `${API_BASE_URL}/api/user/asset-usage`;

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
      return { success: true, data, status: response.status };
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
 * Fetch summary metrics for the authenticated engineer's asset usage history.
 * 
 * @returns {Promise<{ success: boolean, data?: { totalRecords: number, totalQuantityUsed: number, thisMonthCount: number, lastUsageDate: string }, message?: string, status?: number }>}
 */
export const getUserUsageSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/asset-usage/summary`, {
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
      return { success: true, data, status: response.status };
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
 * Fetch a single usage record by ID for the authenticated engineer.
 * 
 * @param {number|string} id
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number }>}
 */
export const getUserUsageById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/asset-usage/${id}`, {
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
      return { success: true, data, status: response.status };
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
 * Search beneficiary employees from real company database.
 * 
 * @param {string} [query]
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const searchBeneficiaries = async (query = '') => {
  try {
    const url = query
      ? `${API_BASE_URL}/api/user/asset-usage/beneficiaries/search?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/api/user/asset-usage/beneficiaries/search`;

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
      return { success: true, data: Array.isArray(data) ? data : [], status: response.status };
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
 * Fetch all usage records across enterprise for Admin Audit & History.
 * 
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const getAllUsageForAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/asset-usage/admin/all`, {
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
      return { success: true, data: Array.isArray(data) ? data : [], status: response.status };
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
