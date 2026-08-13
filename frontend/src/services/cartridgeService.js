/**
 * IOCL Consumables & Procurement Management System
 * Cartridge Reference Master Data API Service
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
 * Fetch all active Cartridge master reference records from backend.
 * 
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const getActiveCartridges = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/procurement/cartridges`, {
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

    const errorMsg = data?.message || data?.error || `Server returned error (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};
