import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser as apiLoginAdmin, loginNormalUser as apiLoginUser, getCurrentAdmin, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

const TOKEN_KEY = 'iocl_auth_token';
const USER_KEY = 'iocl_auth_user';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
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

  // Verify stored JWT token on initial load / reload
  const verifySession = useCallback(async () => {
    const storedToken = sessionStorage.getItem(TOKEN_KEY);
    const storedUserStr = sessionStorage.getItem(USER_KEY);

    if (!storedToken || !storedUserStr) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUserStr);
      if (parsedUser.role === 'ADMIN') {
        const result = await getCurrentAdmin(storedToken);
        if (result.success && result.data) {
          setIsAuthenticated(true);
          setToken(storedToken);
          setUser({ ...parsedUser, ...result.data });
          sessionStorage.setItem(USER_KEY, JSON.stringify({ ...parsedUser, ...result.data }));
        } else {
          // Token is invalid or expired
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
          setIsAuthenticated(false);
          setToken(null);
          setUser(null);
        }
      } else {
        // Normal USER session
        setIsAuthenticated(true);
        setToken(storedToken);
        setUser(parsedUser);
      }
    } catch (e) {
      console.warn('Session verification error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  /**
   * Real Admin login action against Spring Boot /api/auth/login.
   */
  const login = async (email, password) => {
    setError(null);
    try {
      const result = await apiLoginAdmin(email, password);
      if (result.success && result.token && result.data) {
        const adminData = { ...result.data, role: 'ADMIN' };
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(adminData));
        setToken(result.token);
        setUser(adminData);
        setIsAuthenticated(true);
        return { success: true, data: adminData };
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
   * Real Normal User login action against Spring Boot /api/auth/user/login.
   */
  const loginUserAccount = async (identifier, password) => {
    setError(null);
    try {
      const result = await apiLoginUser(identifier, password);
      if (result.success && result.token && result.data) {
        const userData = { ...result.data, role: 'USER' };
        sessionStorage.setItem(TOKEN_KEY, result.token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
        setToken(result.token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, data: userData };
      } else {
        const errorMsg = result.message || 'Invalid username or password.';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const msg = err.message || 'An error occurred during user authentication.';
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
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        adminUser: user, // Alias for backward compatibility with existing Admin components
        role: user?.role || null,
        loading,
        error,
        login,
        loginAdmin: login,
        loginUserAccount,
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
