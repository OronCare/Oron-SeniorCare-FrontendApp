import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Network,
  Users,
  AlertTriangle,
  ArrowRight,
  Activity,
  ShieldAlert } from
'lucide-react';
import { StatsCard, Card, Badge, Button } from '../../components/UI';
import {
  mockAlerts } from
'../../mockData';
import { useAuth } from '../../context/AuthContext';
import SmartTable from '../../shared/Table';
import { BranchesCompactActions, BranchesCompactColumns } from '../../shared/TableColumns';
import { branchService } from '../../services/branchService';
import { residentService } from '../../services/residentService';
import { usersService } from '../../services/usersService';
import { Branch, Resident, User } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import { AdminDashboardSkeleton } from '../skeletons/DashboardSkeleton';
import { RefreshButton } from '../refresh/Refresh';
export const FacilityAdminDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [branchesData, residentsData, staffData] = await Promise.all([
        branchService.getAllBranches(),
        residentService.getAllResidents(),
        usersService.getAllUsers()
      ]);
      setBranches(branchesData);
      setResidents(residentsData);
      setStaff(staffData);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to fetch data');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    

    fetchData();
  }, []);

  // Filter data for this facility admin's facility
  const facilityId = user?.facilityId || '';
  const myBranches = branches.filter((b) => b.facilityId === facilityId);
  const branchIds = myBranches.map((b) => b.id);
  const myResidents = residents.filter((r) =>
    branchIds.includes(r.branchId)
  );
  const myStaff = staff.filter((s) =>
    s.role === 'admin' || s.role === 'staff'
  ).filter((s) => branchIds.includes(s.branchId || ''));

  const totalCapacity = myBranches.reduce(
    (acc, curr) => acc + curr.residentLimit,
    0
  );
  const totalResidents = myResidents.length;
  const utilization = Math.round(totalResidents / totalCapacity * 100) || 0;
  const facAlerts = mockAlerts.filter(
    (a) =>
    a.targetRoles.includes('facility_admin') && (
    a.facilityId === facilityId ||
    a.branchId && branchIds.includes(a.branchId))
  );
  const recentAlerts = facAlerts.slice(0, 4);
  if (loading) {
    return <AdminDashboardSkeleton/>
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Facility Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Overview of all branches under your management
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error loading dashboard: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className='min-w-0 shrink'>
          <h1 className="text-2xl font-bold text-slate-900">
            Facility Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of all branches under your management
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        <Link to="/facility-admin/branches">
          <Button icon={Network}>Manage Branches</Button>
        </Link>
        <RefreshButton onRefresh={fetchData}/>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Branches"
          value={myBranches.length}
          icon={Network} />

        <StatsCard
          title="Total Residents"
          value={totalResidents}
          icon={Users} />

        <StatsCard title="Total Staff" value={myStaff.length} icon={Users} />
        <StatsCard
          title="Overall Utilization"
          value={`${utilization}%`}
          icon={Activity} />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Branches List Preview */}
        <Card className="lg:col-span-2 flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Branch Overview
            </h2>
            <Link
              to="/facility-admin/branches"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center">

              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <SmartTable
            data={myBranches}
            columns={BranchesCompactColumns}
            actions={BranchesCompactActions}
            />
        </Card>

        {/* System Alerts */}
        <Card className="flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Recent Alerts
            </h2>
          </div>
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {recentAlerts.map((alert) =>
            <div key={alert.id} className="flex gap-3 items-start">
                <div
                className={`mt-0.5 p-1.5 rounded-full shrink-0 ${alert.severity === 'Critical' ? 'bg-red-100 text-red-600' : alert.severity === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                
                  <ShieldAlert className="h-3 w-3" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {alert.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {alert.message}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                    {new Date(alert.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            {recentAlerts.length === 0 &&
            <div className="text-center text-sm text-slate-500 py-8">
                No active alerts
              </div>
            }
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
            <Link to="/facility-admin/notifications">
              <Button variant="outline" className="w-full" size="sm">
                View All Alerts
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>);

};