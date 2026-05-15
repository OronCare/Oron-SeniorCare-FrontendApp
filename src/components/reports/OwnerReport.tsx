import React, { useEffect, useMemo, useState } from 'react';
import { Printer } from 'lucide-react';
import { Card, Button } from '../../components/UI';
import { facilityService } from '../../services/facilityService';
import { branchService } from '../../services/branchService';
import { residentService } from '../../services/residentService';
import { alertsService } from '../../services/alertsService';
import { Alert, Branch, Facility, Resident } from '../../types';
import { AdminDashboardSkeleton } from '../skeletons/DashboardSkeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend } from
'recharts';
import { OwnerReportSkeleton } from '../skeletons/ReportsSkeleton';
import { RefreshButton } from '../refresh/Refresh';
export const OwnerReport = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  let isMounted = true;
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [facilitiesData, branchesData, residentsData, alertsData] =
        await Promise.all([
          facilityService.getAllFacilities(),
          branchService.getAllBranches(),
          residentService.getAllResidents(),
          alertsService.getAlerts(),
        ]);

      if (!isMounted) return;
      setFacilities(facilitiesData);
      setBranches(branchesData);
      setResidents(residentsData);
      setAlerts(alertsData);
    } catch (err) {
      if (!isMounted) return;
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      if (!isMounted) return;
      setLoading(false);
    }
  };
  useEffect(() => {
    

    

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const monthLabel = (d: Date) =>
    d.toLocaleString('en-US', { month: 'short' });

  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

  const addMonths = (d: Date, months: number) =>
    new Date(d.getFullYear(), d.getMonth() + months, 1);

  const getResidentGrowthData = (items: Resident[]) => {
    const now = new Date();
    const windowStart = startOfMonth(addMonths(now, -5)); // 6-month window inclusive
    const buckets = new Map<number, number>();

    for (let i = 0; i < 6; i += 1) {
      const m = addMonths(windowStart, i);
      buckets.set(m.getTime(), 0);
    }

    const admitted = items
      .map((r) => {
        const raw = r.admissionDate;
        const dt = raw ? new Date(raw) : null;
        if (!dt || Number.isNaN(dt.getTime())) return null;
        return startOfMonth(dt);
      })
      .filter(Boolean) as Date[];

    for (const dt of admitted) {
      const key = dt.getTime();
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
    }

    // Convert admissions into a cumulative total so it looks like "growth"
    let running = 0;
    const series = [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([ts, count]) => {
        running += count;
        return { month: monthLabel(new Date(ts)), residents: running };
      });

    // If there is existing population before windowStart, add it as baseline
    const baseline = items.filter((r) => {
      const dt = r.admissionDate ? new Date(r.admissionDate) : null;
      if (!dt || Number.isNaN(dt.getTime())) return false;
      return dt < windowStart;
    }).length;

    if (baseline > 0) {
      let baseRunning = baseline;
      return series.map((p) => {
        baseRunning = baseline + p.residents;
        return { ...p, residents: baseRunning };
      });
    }

    return series;
  };

  // 1. Branch Utilization Data
  const utilizationData = useMemo(
    () =>
      branches.map((b) => ({
        name: (b.name || '').split(' ')[0] || b.id,
        utilization: b.residentLimit
          ? Math.round((b.currentResidents / b.residentLimit) * 100)
          : 0,
        limit: b.residentLimit,
      })),
    [branches],
  );

  // 2. Resident Growth Data (6-month trend derived from admissionDate)
  const growthData = useMemo(() => getResidentGrowthData(residents), [residents]);

  // 3. Contract Status Data
  const activeCount = facilities.filter((f) => f.status === 'Active').length;
  const pendingCount = facilities.filter(
    (f) => f.status === 'Pending'
  ).length;
  const suspendedCount = facilities.filter(
    (f) => f.status === 'Suspended'
  ).length;
  const contractData = [
  {
    name: 'Active',
    value: activeCount
  },
  {
    name: 'Pending',
    value: pendingCount
  },
  {
    name: 'Suspended',
    value: suspendedCount
  }].
  filter((d) => d.value > 0);
  const COLORS = ['#0D9488', '#F59E0B', '#EF4444'];
  // 4. Alerts by Severity
  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status !== 'Resolved'),
    [alerts],
  );
  const criticalCount = activeAlerts.filter((a) => a.severity === 'Critical').length;
  const warningCount = activeAlerts.filter((a) => a.severity === 'Warning').length;
  const infoCount = activeAlerts.filter((a) => a.severity === 'Info').length;
  const alertData = [
  {
    name: 'Critical',
    count: criticalCount,
    fill: '#EF4444'
  },
  {
    name: 'Warning',
    count: warningCount,
    fill: '#F59E0B'
  },
  {
    name: 'Info',
    count: infoCount,
    fill: '#3B82F6'
  }];

  if (loading) {
    return <OwnerReportSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Platform Reports</h1>
            <p className="text-sm text-slate-500 mt-1">System-wide analytics and trends</p>
          </div>
        </div>
        <Card>
          <div className="text-sm text-red-600">Error loading report: {error}</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className='min-w-0 shrink'>
          <h1 className="text-2xl font-bold text-slate-900">
            Platform Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System-wide analytics and trends
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        <Button variant="outline" icon={Printer} onClick={() => window.print()}>
          Print Report
        </Button>
        <RefreshButton onRefresh={load}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Utilization */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Branch Utilization (%)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={utilizationData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }}
                  domain={[0, 100]} />
                
                <Tooltip
                  cursor={{
                    fill: '#F8FAFC'
                  }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Bar
                  dataKey="utilization"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                  barSize={40} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Growth */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Total Resident Growth (6 Mo)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={growthData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0" />
                
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />
                
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="residents"
                  stroke="#0D9488"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#0D9488',
                    strokeWidth: 2,
                    stroke: '#fff'
                  }}
                  activeDot={{
                    r: 6
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Contracts */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Facility Contract Status
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {contractData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]} />

                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Alerts */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Active Alerts by Severity
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alertData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  bottom: 5,
                  left: 20
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#E2E8F0" />
                
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />
                
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }} />
                
                <Tooltip
                  cursor={{
                    fill: '#F8FAFC'
                  }}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={30}>
                  {alertData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                  )}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>);

};