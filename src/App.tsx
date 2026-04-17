import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate } from
'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
// Owner Pages
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { FacilitiesList } from './pages/owner/FacilitiesList';
import { FacilityOnboarding } from './pages/owner/FacilityOnboarding';
import { FacilityDetail } from './pages/owner/FacilityDetail';
import { OwnerReports } from './pages/owner/OwnerReports';
import { RulesEngine } from './pages/owner/RulesEngine';
// Facility Admin Pages
import { FacilityAdminDashboard } from './pages/facility-admin/FacilityAdminDashboard';
import { BranchesList } from './pages/facility-admin/BranchesList';
import { BranchDetail } from './pages/facility-admin/BranchDetail';
import { FacAdminResidents } from './pages/facility-admin/FacAdminResidents';
import { FacAdminAddResident } from './pages/facility-admin/FacAdminAddResident';
import { FacAdminStaff } from './pages/facility-admin/FacAdminStaff';
import { FacAdminReports } from './pages/facility-admin/FacAdminReports';
import { FacAdminNotifications } from './pages/facility-admin/FacAdminNotifications';
// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ResidentsList } from './pages/admin/ResidentsList';
import { AddResident } from './pages/admin/AddResident';
import { ResidentDetail } from './pages/admin/ResidentDetail';
import { VitalsEntry } from './pages/admin/VitalsEntry';
import { CarePlans } from './pages/admin/CarePlans';
import { StaffManagement } from './pages/admin/StaffManagement';
import { TaskManagement } from './pages/admin/TaskManagement';
import { AdminReports } from './pages/admin/AdminReports';
import { AuditLogs } from './pages/admin/AuditLogs';
import { AdminNotifications } from './pages/admin/AdminNotifications';
// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffTasks } from './pages/staff/StaffTasks';
import { StaffResidents } from './pages/staff/StaffResidents';
import { StaffNotifications } from './pages/staff/StaffNotifications';
// Protected Route Wrapper
const ProtectedRoute = ({
  children,
  allowedRoles



}: {children: React.ReactNode;allowedRoles: string[];}) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user && !allowedRoles.includes(user.role)) {
    // Redirect facility_admin to /facility-admin instead of /facility_admin
    const path =
    user.role === 'facility_admin' ? '/facility-admin' : `/${user.role}`;
    return <Navigate to={path} replace />;
  }
  return <Layout>{children}</Layout>;
};
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Owner Routes */}
      <Route
        path="/owner"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/facilities"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <FacilitiesList />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/facilities/new"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <FacilityOnboarding />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/facilities/:id"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <FacilityDetail />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/rules"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <RulesEngine />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/reports"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <OwnerReports />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/audit-logs"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <AuditLogs />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/residents/:id"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <ResidentDetail />
          </ProtectedRoute>
        } />
      

      {/* Facility Admin Routes */}
      <Route
        path="/facility-admin"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <FacilityAdminDashboard />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/branches"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <BranchesList />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/branches/:id"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <BranchDetail />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/residents"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <FacAdminResidents />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/residents/new"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <FacAdminAddResident />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/residents/:id"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <ResidentDetail />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/audit-logs"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/staff"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <FacAdminStaff />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/reports"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <FacAdminReports />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/notifications"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <FacAdminNotifications />
          </ProtectedRoute>
        } />
      

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/residents"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <ResidentsList />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/residents/new"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <AddResident />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/residents/:id"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <ResidentDetail />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/vitals"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <VitalsEntry />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/care-plans"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <CarePlans />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/staff"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <StaffManagement />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/tasks"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <TaskManagement />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/reports"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminReports />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/logs"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <AuditLogs />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/notifications"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminNotifications />
          </ProtectedRoute>
        } />
      

      {/* Staff Routes */}
      <Route
        path="/staff"
        element={
        <ProtectedRoute allowedRoles={['staff']}>
            <StaffDashboard />
          </ProtectedRoute>
        } />
      
      <Route
        path="/staff/tasks"
        element={
        <ProtectedRoute allowedRoles={['staff']}>
            <StaffTasks />
          </ProtectedRoute>
        } />
      
      <Route
        path="/staff/residents"
        element={
        <ProtectedRoute allowedRoles={['staff']}>
            <StaffResidents />
          </ProtectedRoute>
        } />
      
      <Route
        path="/staff/residents/:id"
        element={
        <ProtectedRoute allowedRoles={['staff']}>
            <ResidentDetail />
          </ProtectedRoute>
        } />
      
      <Route
        path="/staff/vitals"
        element={
        <ProtectedRoute allowedRoles={['staff']}>
            <VitalsEntry />
          </ProtectedRoute>
        } />
      
      <Route
        path="/staff/notifications"
        element={
        <ProtectedRoute allowedRoles={['staff']}>
            <StaffNotifications />
          </ProtectedRoute>
        } />
      

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>);

};
export function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>);

}