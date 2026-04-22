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
import { RulesEngine } from './pages/owner/RulesEngine';
// Facility Admin Pages
import { FacilityAdminDashboard } from './pages/facility-admin/FacilityAdminDashboard';
import { BranchesList } from './pages/facility-admin/BranchesList';
import { BranchDetail } from './pages/facility-admin/BranchDetail';
import { FacAdminNotifications } from './pages/facility-admin/FacAdminNotifications';
// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ResidentDetail } from './pages/admin/ResidentDetail';
import { VitalsEntry } from './pages/admin/VitalsEntry';
import { CarePlans } from './pages/admin/CarePlans';
import { AuditLogs } from './pages/admin/AuditLogs';
import { AdminNotifications } from './pages/admin/AdminNotifications';
// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffNotifications } from './pages/staff/StaffNotifications';
import Residents from './components/residents/ResidentsList';
import { AddRes } from './components/residents/AddResident';
import { ResidentDetails } from './components/residents/ResidentDetails';
import StaffPage from './components/staff/StaffManagement';
import { OwnerReport } from './components/reports/OwnerReport';
import { FacAdminReport } from './components/reports/FacAdminReport';
import { AdminReport } from './components/reports/AdminReport';
import { TaskManagements } from './components/task/TaskPage';
import { FacilitiesLists } from './components/facility/FacilitiesList';
import { FacilityDetails } from './components/facility/FacilityDetails';
import { FacilityOnboardings } from './components/facility/FacilityOnboarding';
import { RulesEngines } from './components/rules engine/RulesEngine';
import { AuditLog } from './components/audit logs/AuditLogs';
import { BranchLists } from './components/branches/BranchesList';
import { BranchDetails } from './components/branches/BranchDetails';
import { CarePlan } from './components/care plans/CarePlans';
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
            <FacilitiesLists />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/facilities/new"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <FacilityOnboardings />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/facilities/:id"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <FacilityDetails />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/rules"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <RulesEngines />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/reports"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <OwnerReport />
          </ProtectedRoute>
        } />
      
      <Route
        path="/owner/audit-logs"
        element={
        <ProtectedRoute allowedRoles={['owner']}>
            <AuditLog />
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
            <BranchLists />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/branches/:id"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <BranchDetails />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/residents"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <Residents />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/residents/new"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <AddRes/>
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/residents/:id"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <ResidentDetails />
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
            <StaffPage />
          </ProtectedRoute>
        } />
      
      <Route
        path="/facility-admin/reports"
        element={
        <ProtectedRoute allowedRoles={['facility_admin']}>
            <FacAdminReport />
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
            <Residents />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/residents/new"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <AddRes/>
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/residents/:id"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <ResidentDetails />
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
            <CarePlan />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/staff"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <StaffPage />
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/tasks"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <TaskManagements/>
          </ProtectedRoute>
        } />
      
      <Route
        path="/admin/reports"
        element={
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminReport />
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
            <TaskManagements />
          </ProtectedRoute>
        } />
      
      <Route
        path="/staff/residents"
        element={
        <ProtectedRoute allowedRoles={['staff']}>
            <Residents />
          </ProtectedRoute>
        } />
      
      <Route
        path="/staff/residents/:id"
        element={
        <ProtectedRoute allowedRoles={['staff']}>
            <ResidentDetails />
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