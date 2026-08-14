import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AdminDashboard } from '../pages/AdminDashboard';
import { ProcurementRegister } from '../pages/procurement/ProcurementRegister';
import { NewRateContract } from '../pages/procurement/NewRateContract';
import { CallUpPO } from '../pages/procurement/CallUpPO';
import { FullViewRecords } from '../pages/procurement/FullViewRecords';
import { ThresholdSettings } from '../pages/thresholds/ThresholdSettings';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Route: Login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />
        }
      />

      {/* Protected Routes: Admin Portal Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="full-view" element={<FullViewRecords />} />
        <Route path="thresholds" element={<ThresholdSettings />} />

        {/* Procurement Register Module Routes */}
        <Route path="procurement" element={<ProcurementRegister />}>
          <Route index element={<Navigate to="new-rate-contract" replace />} />
          <Route path="new-rate-contract" element={<NewRateContract />} />
          <Route path="call-up-po" element={<CallUpPO />} />
        </Route>
      </Route>

      {/* Root redirect */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/admin/dashboard" : "/login"} replace />
        }
      />

      {/* Catch-all Wildcard Route */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/admin/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
};
