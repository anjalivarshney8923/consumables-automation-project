/**
 * IOCL Consumables & Procurement Management System
 * Admin Employee Master API Service
 * 
 * Central Employee Directory service for managing beneficiary, department,
 * workplace, and assigned printer information across the enterprise.
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
 * Fetch paginated, filtered list of employees for Admin Employee Master.
 * 
 * @param {Object} params
 * @param {string} [params.search] - Search keyword (Emp No, Name, Email, Dept, Printer, Cabin)
 * @param {string} [params.department] - Filter by department
 * @param {string} [params.designation] - Filter by designation
 * @param {string} [params.status] - 'ALL' | 'ACTIVE' | 'INACTIVE'
 * @param {string} [params.location] - Filter by location/office
 * @param {number} [params.page=0] - 0-indexed page number
 * @param {number} [params.size=10] - Page size
 * @param {string} [params.sortBy='employeeId'] - Sort field
 * @param {string} [params.sortDir='asc'] - 'asc' | 'desc'
 * 
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number }>}
 */
export const getEmployees = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.search?.trim()) queryParams.append('search', params.search.trim());
    if (params.department && params.department !== 'ALL' && params.department !== 'All Departments') {
      queryParams.append('department', params.department.trim());
    }
    if (params.designation?.trim() && params.designation !== 'ALL') {
      queryParams.append('designation', params.designation.trim());
    }
    if (params.status && params.status !== 'ALL') {
      queryParams.append('status', params.status.trim());
    }
    if (params.location?.trim() && params.location !== 'ALL') {
      queryParams.append('location', params.location.trim());
    }

    queryParams.append('page', params.page !== undefined ? params.page : 0);
    queryParams.append('size', params.size || 10);
    queryParams.append('sortBy', params.sortBy || 'employeeId');
    queryParams.append('sortDir', params.sortDir || 'asc');

    const url = `${API_BASE_URL}/api/admin/employees?${queryParams.toString()}`;
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
        data: data
      };
    }

    if (response.status === 404) {
      return {
        success: true,
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          totalEmployees: 0,
          activeEmployees: 0,
          totalDepartments: 0,
          employeesWithPrinters: 0
        },
        message: 'Employee Master backend endpoint is ready for integration.'
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
 * Fetch high-level enterprise summary KPIs for Employee Master.
 * 
 * @returns {Promise<{ success: boolean, data?: { totalEmployees: number, activeEmployees: number, totalDepartments: number, employeesWithPrinters: number }, message?: string }>}
 */
export const getEmployeeSummary = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/employees/summary`, {
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

    if (response.status === 404) {
      return {
        success: true,
        data: {
          totalEmployees: null,
          activeEmployees: null,
          totalDepartments: null,
          employeesWithPrinters: null
        }
      };
    }

    return {
      success: false,
      message: data?.message || 'Failed to fetch employee summary.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error fetching employee summary.'
    };
  }
};

/**
 * Fetch single employee record by ID.
 * 
 * @param {string|number} id
 * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
 */
export const getEmployeeById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/employees/${id}`, {
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
      message: data?.message || 'Failed to fetch employee details.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error fetching employee details.'
    };
  }
};

/**
 * Create a new Employee in Employee Master.
 * 
 * @param {Object} employeeData
 * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
 */
export const createEmployee = async (employeeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.status === 201 || (response.ok && data)) {
      return { success: true, data, message: 'Employee added successfully.' };
    }

    return {
      success: false,
      message: data?.message || data?.error || 'Failed to add employee.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to server to save employee.'
    };
  }
};

/**
 * Update an existing Employee in Employee Master.
 * 
 * @param {string|number} id
 * @param {Object} employeeData
 * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
 */
export const updateEmployee = async (id, employeeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData)
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.ok && data) {
      return { success: true, data, message: 'Employee updated successfully.' };
    }

    return {
      success: false,
      message: data?.message || data?.error || 'Failed to update employee.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to server to update employee.'
    };
  }
};

/**
 * Toggle employee active/inactive status (Soft delete / Deactivate).
 * 
 * @param {string|number} id
 * @param {string} status - 'ACTIVE' | 'INACTIVE'
 * @returns {Promise<{ success: boolean, data?: Object, message?: string }>}
 */
export const toggleEmployeeStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/employees/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
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
        data,
        message: `Employee status changed to ${status}.`
      };
    }

    return {
      success: false,
      message: data?.message || 'Failed to update employee status.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Network error updating employee status.'
    };
  }
};
