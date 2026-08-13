import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, getCurrentAdmin, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'iocl_auth_token';
const USER_KEY = 'iocl_auth_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(sessionStorage.getItem(TOKEN_KEY)));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verify stored JWT token against backend GET /api/auth/me on initial load / reload
  const verifySession = useCallback(async () => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      setIsAuthenticated(false);
      setAdminUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const result = await getCurrentAdmin(storedToken);
      if (result.success && result.data) {
        setIsAuthenticated(true);
        setToken(storedToken);
        setAdminUser(result.data);
        sessionStorage.setItem(USER_KEY, JSON.stringify(result.data));
      } else {
        // Token is invalid or expired
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        setIsAuthenticated(false);
        setToken(null);
        setAdminUser(null);
      }
    } catch (e) {
      // In case of transient network issue, keep token if exists or clear gracefully
      console.warn('Session verification error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  /**
   * Real database login action.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{ success: boolean, message?: string }>}
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const result = await loginUser(email, password);
      if (result.success && result.token && result.data) {
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(result.data));
        setToken(result.token);
        setAdminUser(result.data);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorMsg = result.message || 'Invalid email or password.';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const msg = err.message || 'An error occurred during authentication.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  /**
   * Logout action.
   */
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      setToken(null);
      setAdminUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        adminUser,
        loading,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
