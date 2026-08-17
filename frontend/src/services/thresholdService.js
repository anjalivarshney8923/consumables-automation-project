/**
 * IOCL Consumables & Procurement Management System
 * Cartridge Threshold Configuration API Service
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
 * Fetch all Cartridge Threshold configurations with live availability metrics from PostgreSQL.
 * 
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const getThresholds = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/thresholds`, {
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
      return { success: true, data: Array.isArray(data) ? data : [] };
    }

    const errorMsg = data?.message || data?.error || `Failed to fetch thresholds (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};

/**
 * Fetch threshold for a single cartridge by ID.
 * 
 * @param {number} cartridgeId 
 * @returns {Promise<{ success: boolean, data?: object, message?: string, status?: number }>}
 */
export const getThresholdByCartridgeId = async (cartridgeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/thresholds/${cartridgeId}`, {
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
      return { success: true, data };
    }

    const errorMsg = data?.message || data?.error || `Failed to fetch threshold (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server.'
    };
  }
};

/**
 * Update PO or Tendering Threshold for a specific cartridge in PostgreSQL.
 * 
 * @param {number} cartridgeId 
 * @param {number|object} payload 
 * @returns {Promise<{ success: boolean, data?: object, message?: string, status?: number }>}
 */
export const updateThreshold = async (cartridgeId, payload) => {
  try {
    const body = typeof payload === 'object' && payload !== null
      ? payload
      : { poThreshold: parseInt(payload, 10) };

    const response = await fetch(`${API_BASE_URL}/api/thresholds/${cartridgeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok) {
      return { success: true, data };
    }

    const errorMsg = data?.message || data?.error || `Failed to update threshold (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Threshold update failed.'
    };
  }
};

/**
 * Update Tendering Threshold (Alert 2) for a specific cartridge in PostgreSQL.
 * 
 * @param {number} cartridgeId 
 * @param {number} tenderingThreshold 
 * @param {number} [storeQuantity]
 * @returns {Promise<{ success: boolean, data?: object, message?: string, status?: number }>}
 */
export const updateTenderingThreshold = async (cartridgeId, tenderingThreshold, storeQuantity) => {
  const payload = {
    tenderingThreshold: parseInt(tenderingThreshold, 10)
  };
  if (storeQuantity !== undefined && storeQuantity !== null) {
    payload.storeQuantity = parseInt(storeQuantity, 10);
  }
  return updateThreshold(cartridgeId, payload);
};
