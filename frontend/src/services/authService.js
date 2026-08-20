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
 * Authenticate Normal User (via username, email, or employee ID) against Spring Boot PostgreSQL backend.
 * Calls real POST /api/auth/user/login endpoint.
 *
 * @param {string} identifier - Username, Email, or Employee ID
 * @param {string} password - User password
 * @returns {Promise<{ success: boolean, data?: object, token?: string, message?: string, status?: number }>}
 */
export const loginNormalUser = async (identifier, password) => {
  const normalizedId = (identifier || '').trim();

  if (!normalizedId || !password) {
    return {
      success: false,
      message: 'Please provide both username/email and password.'
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        usernameOrEmail: normalizedId,
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

    let errorMessage = responseData?.message || responseData?.error;
    if (response.status === 401) {
      errorMessage = 'Invalid username or password.';
    } else if (response.status === 403) {
      errorMessage = responseData?.message || 'Your account is inactive. Please contact the administrator.';
    } else if (response.status === 400) {
      errorMessage = responseData?.message || 'Please provide both username/email and password.';
    } else {
      errorMessage = errorMessage || 'Authentication failed. Please check your credentials.';
    }

    return {
      success: false,
      message: errorMessage,
      status: response.status
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to the server. Please try again later.'
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
 * Clear stored JWT and logout.
 */
export const logoutUser = () => {
  localStorage.removeItem('iocl_token');
  localStorage.removeItem('iocl_user');
};

/**
 * Register a new normal user against the Spring Boot PostgreSQL backend.
 * Calls real POST /api/auth/user/register endpoint.
 *
 * @param {object} userData - User registration details
 * @returns {Promise<{ success: boolean, data?: object, message?: string, validationErrors?: object }>}
 */
export const registerUser = async (userData) => {
  if (!userData) {
    return {
      success: false,
      message: 'No registration data provided.'
    };
  }

  const payload = {
    fullName: (userData.fullName || '').trim(),
    username: (userData.username || '').trim(),
    email: (userData.email || '').trim(),
    employeeId: (userData.employeeId || '').trim(),
    department: (userData.department || '').trim(),
    location: (userData.location || '').trim(),
    password: userData.password
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    let responseData = null;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = null;
    }

    if (response.status === 201 || (response.ok && responseData)) {
      return {
        success: true,
        data: responseData,
        message: responseData?.message || 'User registered successfully.'
      };
    }

    // Handle duplicate conflict (409) or bad request (400)
    let errorMessage = responseData?.message || responseData?.error;
    if (response.status === 409) {
      if (responseData?.message?.toLowerCase().includes('username')) {
        errorMessage = 'Username already exists. Please choose another username.';
      } else if (responseData?.message?.toLowerCase().includes('email')) {
        errorMessage = 'This email is already registered. Please use another email or log in.';
      } else if (responseData?.message?.toLowerCase().includes('employee')) {
        errorMessage = 'This Employee ID is already registered in the system.';
      } else {
        errorMessage = responseData?.message || 'A user with these details already exists.';
      }
    } else if (response.status === 400) {
      errorMessage = responseData?.message || 'Please check the provided registration details.';
    } else {
      errorMessage = errorMessage || 'Registration failed. Please try again.';
    }

    return {
      success: false,
      message: errorMessage,
      validationErrors: responseData?.validationErrors || null,
      status: response.status
    };
  } catch (err) {
    return {
      success: false,
      message: 'Unable to connect to the server. Please try again later.'
    };
  }
};
