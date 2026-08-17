/**
 * IOCL Consumables & Procurement Management System
 * Procurement Alert API Service (Alert 1)
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
 * Fetch all procurement alerts.
 * 
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const getAllAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts`, {
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

    const errorMsg = data?.message || data?.error || `Failed to fetch alerts (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server.'
    };
  }
};

/**
 * Fetch Alert 2 Tendering evaluations from PostgreSQL.
 * 
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const getTenderingAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/tendering`, {
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

    const errorMsg = data?.message || data?.error || `Failed to fetch tendering alerts (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please verify Spring Boot is running.'
    };
  }
};

/**
 * Fetch only UNREAD procurement alerts from PostgreSQL.
 * 
 * @returns {Promise<{ success: boolean, data?: Array, message?: string, status?: number }>}
 */
export const getUnreadAlerts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/unread`, {
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

    const errorMsg = data?.message || data?.error || `Failed to fetch unread alerts (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server.'
    };
  }
};

/**
 * Fetch alert count metrics (unread vs total).
 * 
 * @returns {Promise<{ success: boolean, data?: { unreadCount: number, totalCount: number }, message?: string }>}
 */
export const getAlertCounts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/count`, {
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
        data: {
          unreadCount: data?.unreadCount || 0,
          totalCount: data?.totalCount || 0
        }
      };
    }

    return { success: false, message: 'Failed to fetch alert counts' };
  } catch (err) {
    return { success: false, message: 'Unable to connect to backend server.' };
  }
};

/**
 * Mark a specific alert as READ in PostgreSQL.
 * 
 * @param {number} alertId 
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const markAlertAsRead = async (alertId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/read`, {
      method: 'PATCH',
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

    const errorMsg = data?.message || data?.error || `Failed to mark alert as read (${response.status})`;
    return { success: false, message: errorMsg };
  } catch (err) {
    return { success: false, message: 'Unable to connect to backend server.' };
  }
};

/**
 * Mark all unread alerts as READ in PostgreSQL.
 * 
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const markAllAlertsAsRead = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/alerts/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    }

    return { success: false, message: 'Failed to mark all alerts as read' };
  } catch (err) {
    return { success: false, message: 'Unable to connect to backend server.' };
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
  try {
    const payload = {
      tenderingThreshold: parseInt(tenderingThreshold, 10)
    };
    if (storeQuantity !== undefined && storeQuantity !== null) {
      payload.storeQuantity = parseInt(storeQuantity, 10);
    }

    const response = await fetch(`${API_BASE_URL}/api/thresholds/${cartridgeId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
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
