import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/Login';
import { AdminDashboard } from '../pages/AdminDashboard';
import { ProcurementRegister } from '../pages/procurement/ProcurementRegister';
import { NewRateContract } from '../pages/procurement/NewRateContract';
import { CallUpPO } from '../pages/procurement/CallUpPO';
import { RateContractDetails } from '../pages/procurement/RateContractDetails';
import { FullViewRecords } from '../pages/procurement/FullViewRecords';
import { ThresholdSettings } from '../pages/thresholds/ThresholdSettings';
import { TenderingAlerts } from '../pages/alerts/TenderingAlerts';
import { NewAssetAddition } from '../pages/assets/NewAssetAddition';
import { UpdateAsset } from '../pages/assets/UpdateAsset';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { UserLayout } from '../components/layout/UserLayout';
import { UserLogin } from '../pages/user/UserLogin';
import { UserDashboard } from '../pages/user/UserDashboard';
import { RecordUsage } from '../pages/user/RecordUsage';
import { UsageHistory } from '../pages/user/UsageHistory';
import { AssignedPOs } from '../pages/user/AssignedPOs';
import { POUserDetails } from '../pages/user/POUserDetails';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Route: Admin Login */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/admin/dashboard" replace /> : <Login />
        }
      />

      {/* Public Route: User / Store Login */}
      <Route path="/user/login" element={<UserLogin />} />

      {/* User / Store Portal Routes */}
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="record-usage" element={<RecordUsage />} />
        <Route path="usage-history" element={<UsageHistory />} />
        <Route path="assigned-pos" element={<AssignedPOs />} />
        <Route path="assigned-pos/:id" element={<POUserDetails />} />
      </Route>

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
        <Route path="tendering-alerts" element={<TenderingAlerts />} />
        <Route path="assets/new" element={<NewAssetAddition />} />
        <Route path="assets/update" element={<UpdateAsset />} />

        {/* Rate Contract Details & Call-Up PO History */}
        <Route path="procurement/rate-contracts/:id" element={<RateContractDetails />} />

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
