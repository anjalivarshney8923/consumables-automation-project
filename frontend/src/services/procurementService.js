/**
 * IOCL Consumables & Procurement Management System
 * Procurement Register API Service (Rate Contracts, Call-Up POs & Full View)
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
 * Fetch Full View procurement records from PostgreSQL database via Spring Boot REST API.
 *
 * @param {object} params
 * {
 *   search?: string,
 *   supplier?: string,
 *   cartridge?: string,
 *   status?: string,
 *   fromDate?: string,
 *   toDate?: string,
 *   page?: number,
 *   size?: number,
 *   sort?: string
 * }
 * @returns {Promise<{ success: boolean, data?: object, message?: string, status?: number }>}
 */
export const getProcurementRecords = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.search && params.search.trim()) {
      queryParams.append('search', params.search.trim());
    }
    if (params.supplier && params.supplier.trim()) {
      queryParams.append('supplier', params.supplier.trim());
    }
    if (params.cartridge && params.cartridge.trim()) {
      queryParams.append('cartridge', params.cartridge.trim());
    }
    if (params.status && params.status.trim()) {
      queryParams.append('status', params.status.trim());
    }
    if (params.fromDate) {
      queryParams.append('fromDate', params.fromDate);
    }
    if (params.toDate) {
      queryParams.append('toDate', params.toDate);
    }
    queryParams.append('page', params.page !== undefined ? params.page : 0);
    queryParams.append('size', params.size !== undefined ? params.size : 10);
    queryParams.append('sort', params.sort || 'contractDate,desc');

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/api/procurement/full-view${queryString ? `?${queryString}` : ''}`;

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

    if (response.ok && data) {
      return {
        success: true,
        data: {
          content: Array.isArray(data.content) ? data.content : [],
          page: data.page || 0,
          size: data.size || 10,
          totalElements: data.totalElements || 0,
          totalPages: data.totalPages || 0
        }
      };
    }

    const errorMsg = data?.message || data?.error || `Failed to load records (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server. Please check your network connection.'
    };
  }
};

/**
 * Fetch a single Full View procurement record by ID from PostgreSQL.
 */
export const getFullViewRecordById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/procurement/full-view/${id}`, {
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

    const errorMsg = data?.message || data?.error || `Procurement record not found (${response.status})`;
    return { success: false, message: errorMsg, status: response.status };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to backend server.'
    };
  }
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
 * Fetch a single Rate Contract with full details and Call-Up PO history by ID.
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
 * Fetch all Call-Up POs specifically linked to a Rate Contract.
 */
export const getRateContractCallUpPOs = async (rateContractId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/procurement/rate-contracts/${rateContractId}/call-up-pos`, {
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
