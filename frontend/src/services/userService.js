/**
 * User / Store Portal Service
 * Prepared for future User Authentication & Profile Backend APIs.
 */

export const userLogin = async (email, password) => {
  // Prepared for future POST /api/user/login
  return {
    success: true,
    message: 'Frontend-only login validation passed.',
    user: {
      id: 1,
      name: 'Store Keeper / User',
      email: email,
      role: 'STORE_USER'
    }
  };
};

export const getUserProfile = async () => {
  // Prepared for future GET /api/user/profile
  return {
    success: true,
    data: {
      id: 1,
      name: 'Store Keeper / User',
      email: 'user@iocl.co.in',
      role: 'STORE_USER'
    }
  };
};
