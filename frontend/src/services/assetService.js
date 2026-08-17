/**
 * IOCL Consumables & Procurement Management System
 * Asset Management API Service
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
 * Register a new printer asset into PostgreSQL via backend REST API.
 * 
 * @param {Object} assetData
 * @param {string} assetData.modelName
 * @param {string} assetData.serialNumber
 * @param {string} assetData.department
 * @param {string} assetData.compatibleCartridge
 * @param {string} assetData.printerType
 * @param {string} [assetData.status]
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number, errors?: Object }>}
 */
export const registerAsset = async (assetData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assetData)
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

    let errorMsg = data?.message || data?.error;
    if (response.status === 409) {
      errorMsg = data?.message || `An asset with serial number "${assetData.serialNumber}" already exists.`;
    } else if (!errorMsg) {
      errorMsg = `Server returned error (${response.status})`;
    }

    return { success: false, message: errorMsg, status: response.status, errors: data?.errors };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};

/**
 * Fetch all registered assets from backend.
 * 
 * @param {string} [search]
 * @param {string} [status]
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const getAssets = async (search = '', status = '') => {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status', status);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${API_BASE_URL}/api/assets${queryStr}`, {
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

    const errorMsg = data?.message || data?.error || `Server returned error (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};

/**
 * Fetch a single asset by ID.
 * 
 * @param {number|string} id
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number }>}
 */
export const getAssetById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
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

    const errorMsg = data?.message || data?.error || `Server returned error (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};

/**
 * Update an existing printer asset in PostgreSQL via backend REST API.
 * 
 * @param {number|string} id
 * @param {Object} assetData
 * @param {string} assetData.modelName
 * @param {string} assetData.serialNumber
 * @param {string} assetData.department
 * @param {string} assetData.compatibleCartridge
 * @param {string} assetData.printerType
 * @param {string} assetData.status
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number, errors?: Object }>}
 */
export const updateAsset = async (id, assetData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/assets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(assetData)
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

    let errorMsg = data?.message || data?.error;
    if (response.status === 409) {
      errorMsg = data?.message || `An asset with serial number "${assetData.serialNumber}" already exists.`;
    } else if (response.status === 404) {
      errorMsg = data?.message || 'Asset not found in database.';
    } else if (!errorMsg) {
      errorMsg = `Server returned error (${response.status})`;
    }

    return { success: false, message: errorMsg, status: response.status, errors: data?.errors };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};

