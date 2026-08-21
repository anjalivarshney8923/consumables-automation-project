/**
 * IOCL Consumables & Store Management Portal
 * User Service
 *
 * Real API integration for normal user operations
 */

import { registerUser, loginNormalUser } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('iocl_auth_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export { registerUser, loginNormalUser };

export const userLogin = async (identifier, password) => {
  return loginNormalUser(identifier, password);
};

/**
 * Fetch real User Dashboard data for the authenticated engineer.
 * 
 * @returns {Promise<{ success: boolean, data?: Object, message?: string, status?: number }>}
 */
export const getUserDashboardData = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/dashboard`, {
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
