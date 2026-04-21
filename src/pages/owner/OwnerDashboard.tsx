import React from 'react';
import {
  Building2,
  Users,
  FileSignature,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Activity,
  Network
} from
  'lucide-react';
import { StatsCard, Card, Badge, Button } from '../../components/UI';
import { mockFacilities, mockBranches, mockAlerts } from '../../mockData';
import { Link } from 'react-router-dom';
import { FacilitesActions, Faciltescolumns, RecentFaciltescolumns } from '../../shared/TableColumns';
import SmartTable from '../../shared/Table';
export const OwnerDashboard = () => {
  const totalFacilities = mockFacilities.length;
  const totalBranches = mockBranches.length;
  const activeFacilities = mockFacilities.filter(
    (f) => f.status === 'Active'
  ).length;
  const totalResidents = mockFacilities.reduce(
    (acc, curr) => acc + curr.totalResidents,
    0
  );
  // Calculate total capacity across all branches
  const totalCapacity = mockBranches.reduce(
    (acc, curr) => acc + curr.residentLimit,
    0
  );
  const utilization = Math.round(totalResidents / totalCapacity * 100) || 0;
  const ownerAlerts = mockAlerts.filter((a) => a.targetRoles.includes('owner'));
  const recentAlerts = ownerAlerts.slice(0, 4);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Platform Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor all facilities and system health
          </p>
        </div>
        <Link to="/owner/facilities/new">
          <Button icon={Building2}>Onboard Facility</Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Facilities"
          value={totalFacilities}
          icon={Building2}
          trend="2 new this month"
          trendUp={true} />

        <StatsCard
          title="Total Branches"
          value={totalBranches}
          icon={Network} />

        <StatsCard
          title="Total Residents"
          value={totalResidents.toLocaleString()}
          icon={Users}
          trend="+12% vs last month"
          trendUp={true} />

        <StatsCard
          title="System Utilization"
          value={`${utilization}%`}
          icon={Activity} />

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facilities List Preview */}
        <Card className="lg:col-span-2 flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Facilities
            </h2>
            <Link
              to="/owner/facilities"
              className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center">

              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <SmartTable
              data={mockFacilities.slice(0, 5)}
              columns={RecentFaciltescolumns}
              actions={FacilitesActions}
            />
          </div>
        </Card>

        {/* System Alerts */}
        <Card className="flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              System Alerts
            </h2>
          </div>
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {recentAlerts.map((alert) =>
              <div key={alert.id} className="flex gap-3 items-start">
                <div
                  className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${alert.severity === 'Critical' ? 'bg-red-500' : alert.severity === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />

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
                No active system alerts
              </div>
            }
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
            <Button variant="outline" className="w-full" size="sm">
              View All Alerts
            </Button>
          </div>
        </Card>
      </div>
    </div>);

};