/**
 * IOCL Consumables & Procurement Management System
 * Procurement Register API Service (Rate Contracts & Call-Up POs)
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
 * Fetch all Rate Contracts from PostgreSQL database.
 */
export const getRateContracts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/procurement/rate-contracts`, {
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

    const errorMsg = data?.message || data?.error || `Failed to fetch rate contracts (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please check your network connection.'
    };
  }
};

/**
 * Fetch a single Rate Contract by ID.
 */
export const getRateContractById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/procurement/rate-contracts/${id}`, {
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

    const errorMsg = data?.message || data?.error || `Rate contract not found (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server.'
    };
  }
};

/**
 * Submit a new Rate Contract to Spring Boot & PostgreSQL.
 *
 * @param {object} payload
 * {
 *   contractDate: "YYYY-MM-DD",
 *   supplierName: "string",
 *   cartridgeId: number,
 *   ratePerUnit: number,
 *   taxPercentage: number,
 *   totalContractQuantity: number
 * }
 */
export const createRateContract = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/procurement/rate-contracts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok || response.status === 201) {
      return { success: true, data };
    }

    // Format validation errors if returned from GlobalExceptionHandler
    let errorMessage = data?.message || data?.error;
    if (data?.validationErrors && typeof data.validationErrors === 'object') {
      const fieldErrors = Object.values(data.validationErrors).join(', ');
      if (fieldErrors) {
        errorMessage = `Validation Error: ${fieldErrors}`;
      }
    }

    return {
      success: false,
      message: errorMessage || `Failed to create rate contract (${response.status})`,
      status: response.status,
      validationErrors: data?.validationErrors
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to server. Rate contract creation failed.'
    };
  }
};

/**
 * Fetch all Call-Up Purchase Orders from PostgreSQL database.
 */
export const getCallUpPOs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/procurement/call-up-pos`, {
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

    const errorMsg = data?.message || data?.error || `Failed to fetch Call-Up POs (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server.'
    };
  }
};

/**
 * Submit a new Call-Up Purchase Order to Spring Boot & PostgreSQL.
 *
 * @param {object} payload
 * {
 *   poNumber: "string",
 *   poDate: "YYYY-MM-DD",
 *   supplierName: "string",
 *   rateContractId: number,
 *   quantity: number,
 *   remarks: "string"
 * }
 */
export const createCallUpPO = async (payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/procurement/call-up-pos`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok || response.status === 201) {
      return { success: true, data };
    }

    let errorMessage = data?.message || data?.error;
    if (data?.validationErrors && typeof data.validationErrors === 'object') {
      const fieldErrors = Object.values(data.validationErrors).join(', ');
      if (fieldErrors) {
        errorMessage = `Validation Error: ${fieldErrors}`;
      }
    }

    return {
      success: false,
      message: errorMessage || `Failed to create Call-Up PO (${response.status})`,
      status: response.status,
      validationErrors: data?.validationErrors
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to server. Call-Up PO submission failed.'
    };
  }
};
