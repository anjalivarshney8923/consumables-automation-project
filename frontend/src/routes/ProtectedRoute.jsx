import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protection wrapper based on authenticated JWT state and Role validation.
 *
 * @param {React.ReactNode} children
 * @param {string[]} allowedRoles - Array of allowed roles (e.g. ['ADMIN'] or ['USER'])
 */
export const ProtectedRoute = ({ children, allowedRoles = ['ADMIN'] }) => {
  const { isAuthenticated, user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #E2E8F0',
          borderTopColor: '#0B2545',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    const isUserRoute = allowedRoles.includes('USER') && !allowedRoles.includes('ADMIN');
    return <Navigate to={isUserRoute ? "/user/login" : "/login"} state={{ from: location }} replace />;
  }

  // Check role authorization
  const currentRole = role || user?.role;
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    // If a normal USER tries to access ADMIN routes, redirect to User Dashboard
    if (currentRole === 'USER') {
      return <Navigate to="/user/dashboard" replace />;
    }
    // If an ADMIN tries to access USER routes, redirect to Admin Dashboard
    if (currentRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};
