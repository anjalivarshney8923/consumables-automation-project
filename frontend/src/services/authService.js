/**
 * IOCL Consumables & Procurement Management System
 * Authentication Service
 *
 * Real API integration with Spring Boot Backend (POST /api/auth/login, GET /api/auth/me)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Authenticate Admin against the Spring Boot PostgreSQL backend.
 *
 * @param {string} email - Admin email address
 * @param {string} password - Admin password
 * @returns {Promise<{ success: boolean, data?: object, token?: string, message?: string }>}
 */
export const loginUser = async (email, password) => {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      success: false,
      message: 'Please provide both email and password.'
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: normalizedEmail,
        password: password
      })
    });

    let responseData = null;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = null;
    }

    if (response.ok && responseData && responseData.token) {
      return {
        success: true,
        data: responseData,
        token: responseData.token
      };
    }

    // Handle authentication or validation failures cleanly
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      (response.status === 401 ? 'Invalid email or password.' : 'Authentication failed. Please check your credentials.');

    return {
      success: false,
      message: errorMessage
    };
  } catch (err) {
    // Network or server connection failure
    return {
      success: false,
      message: 'Unable to connect to server. Please ensure the backend server is running.'
    };
  }
};

/**
 * Fetch profile details of currently authenticated Admin using Bearer JWT.
 *
 * @param {string} token - JWT Bearer token
 * @returns {Promise<{ success: boolean, data?: object, message?: string }>}
 */
export const getCurrentAdmin = async (token) => {
  if (!token) {
    return { success: false, message: 'No authentication token provided.' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data
      };
    }

    return {
      success: false,
      message: 'Session expired or invalid.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to verify authentication with server.'
    };
  }
};

/**
 * Logout action (Stateless JWT - local cleanup).
 */
export const logoutUser = async () => {
  return { success: true };
};
