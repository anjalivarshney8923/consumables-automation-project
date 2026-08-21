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
import { AdminAssetUsageHistory } from '../pages/admin/AdminAssetUsageHistory';
import { AdminEmployeeMaster } from '../pages/admin/AdminEmployeeMaster';
import { AdminReports } from '../pages/admin/AdminReports';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { UserLayout } from '../components/layout/UserLayout';
import { UserLogin } from '../pages/user/UserLogin';
import { UserRegistration } from '../pages/auth/UserRegistration';
import { UserDashboard } from '../pages/user/UserDashboard';
import { UserProfile } from '../pages/user/UserProfile';
import { UserActivity } from '../pages/user/UserActivity';
import { AssetUsage } from '../pages/user/AssetUsage';
import { AssetHistory } from '../pages/user/AssetHistory';
import { UsageHistory } from '../pages/user/UsageHistory';
import { AssignedPOs } from '../pages/user/AssignedPOs';
import { POUserDetails } from '../pages/user/POUserDetails';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

export const AppRoutes = () => {
  const { isAuthenticated, user, role } = useAuth();
  const currentRole = role || user?.role;

  return (
    <Routes>
      {/* Public Route: Admin Login */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? (currentRole === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/dashboard" replace />)
            : <Login />
        }
      />

      {/* Public Route: User / Store Login */}
      <Route
        path="/user/login"
        element={
          isAuthenticated
            ? (currentRole === 'USER' ? <Navigate to="/user/dashboard" replace /> : <Navigate to="/admin/dashboard" replace />)
            : <UserLogin />
        }
      />

      {/* Public Route: User Registration */}
      <Route path="/register" element={<UserRegistration />} />
      <Route path="/user/register" element={<UserRegistration />} />

      {/* User / Store Portal Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboard />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="usage" element={<AssetUsage />} />
        <Route path="record-usage" element={<AssetUsage />} />
        <Route path="asset-history" element={<AssetHistory />} />
        <Route path="usage-history" element={<UsageHistory />} />
        <Route path="activity" element={<UserActivity />} />
        <Route path="assigned-pos" element={<AssignedPOs />} />
        <Route path="assigned-pos/:id" element={<POUserDetails />} />
      </Route>

      {/* Protected Routes: Admin Portal Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="full-view" element={<FullViewRecords />} />
        <Route path="thresholds" element={<ThresholdSettings />} />
        <Route path="tendering-alerts" element={<TenderingAlerts />} />
        <Route path="asset-usage-history" element={<AdminAssetUsageHistory />} />
        <Route path="usage-history" element={<AdminAssetUsageHistory />} />
        <Route path="employees" element={<AdminEmployeeMaster />} />
        <Route path="employee-master" element={<AdminEmployeeMaster />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="reports-export" element={<AdminReports />} />
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
          <Navigate
            to={
              isAuthenticated
                ? (currentRole === 'ADMIN' ? "/admin/dashboard" : "/user/dashboard")
                : "/login"
            }
            replace
          />
        }
      />

      {/* Catch-all Wildcard Route */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              isAuthenticated
                ? (currentRole === 'ADMIN' ? "/admin/dashboard" : "/user/dashboard")
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
