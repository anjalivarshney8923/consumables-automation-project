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
 * 
 * @param {Object} usageData
 * @param {string} usageData.seatOrCabinNo
 * @param {string} usageData.location
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
 * Fetch authenticated user's usage history from PostgreSQL.
 * 
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const getUserUsageHistory = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/asset-usage`, {
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
 * Fetch a single usage record by ID for the authenticated user.
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
