import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { Printer } from 'lucide-react';
import { Button } from '../../components/UI';
import { OwnerReportSkeleton } from '../skeletons/ReportsSkeleton';
import { branchService } from '../../services/branchService';
import { taskService } from '../../services/taskService';
import { alertsService } from '../../services/alertsService';
import { usersService } from '../../services/usersService';
import { vitalService } from '../../services/vitalService';
import { Alert, Branch, Task, User, Vital } from '../../types';
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
export const FacAdminReport = () => {
  const { user } = useAuth();
  const facilityId = user?.facilityId || '';

  const [branches, setBranches] = useState<Branch[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [branchesData, tasksData, alertsData, usersData, vitalsData] =
          await Promise.all([
            branchService.getAllBranches(),
            taskService.getAllTasks(),
            alertsService.getAlerts(),
            usersService.getAllUsers(),
            vitalService.getAllVitals(),
          ]);

        if (!isMounted) return;
        setBranches(branchesData);
        setTasks(tasksData);
        setAlerts(alertsData);
        setStaff(usersData);
        setVitals(vitalsData);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load report data');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    if (!facilityId) {
      setError('Missing facility context. Please re-login.');
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [facilityId]);

  const myBranches = useMemo(
    () => branches.filter((b) => b.facilityId === facilityId),
    [branches, facilityId],
  );
  const branchIds = useMemo(() => myBranches.map((b) => b.id), [myBranches]);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, days: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  const dayLabel = (d: Date) => d.toLocaleString('en-US', { weekday: 'short' });

  const vitalsTrendData = useMemo(() => {
    const now = new Date();
    const windowStart = startOfDay(addDays(now, -6));
    const windowEnd = addDays(windowStart, 7);

    const facilityVitals = vitals
      .filter((v) => v.branchId && branchIds.includes(v.branchId))
      .map((v) => ({
        ...v,
        _date: new Date(v.date),
      }))
      .filter((v) => !Number.isNaN(v._date.getTime()))
      .filter((v) => v._date >= windowStart && v._date < windowEnd);

    const points = Array.from({ length: 7 }).map((_, idx) => {
      const dayStart = addDays(windowStart, idx);
      const next = addDays(dayStart, 1);
      const forDay = facilityVitals.filter((v) => v._date >= dayStart && v._date < next);

      const avg = (vals: Array<number | undefined>) => {
        const xs = vals.filter((x): x is number => typeof x === 'number' && !Number.isNaN(x));
        if (xs.length === 0) return 0;
        return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
      };

      return {
        day: dayLabel(dayStart),
        avgSystolic: avg(forDay.map((v) => v.systolicBP)),
        avgDiastolic: avg(forDay.map((v) => v.diastolicBP)),
        avgHR: avg(forDay.map((v) => v.heartRate)),
      };
    });

    return points;
  }, [vitals, branchIds]);

  // 2. Task Completion Rate across branches
  const myTasks = useMemo(
    () => tasks.filter((t) => branchIds.includes(t.branchId)),
    [tasks, branchIds],
  );
  const todoCount = myTasks.filter((t) => t.status === 'Todo').length;
  const inProgressCount = myTasks.filter(
    (t) => t.status === 'In Progress'
  ).length;
  const doneCount = myTasks.filter((t) => t.status === 'Done').length;
  const deferredCount = myTasks.filter((t) => t.status === 'Deferred').length;
  const taskData = [
  {
    name: 'Completed',
    value: doneCount
  },
  {
    name: 'Pending',
    value: todoCount + inProgressCount
  },
  {
    name: 'Deferred',
    value: deferredCount
  }].
  filter((d) => d.value > 0);
  const TASK_COLORS = ['#10B981', '#F59E0B', '#64748B'];
  // 3. Alerts by Branch
  const myAlerts = useMemo(
    () =>
      alerts
        .filter((a) => a.status !== 'Resolved')
        .filter((a) => a.branchId && branchIds.includes(a.branchId)),
    [alerts, branchIds],
  );
  const alertData = myBranches.map((branch) => {
    const branchAlerts = myAlerts.filter((a) => a.branchId === branch.id);
    return {
      name: (branch.name || '').split(' ')[0] || branch.id,
      Critical: branchAlerts.filter((a) => a.severity === 'Critical').length,
      Warning: branchAlerts.filter((a) => a.severity === 'Warning').length,
      Info: branchAlerts.filter((a) => a.severity === 'Info').length
    };
  });

  // 4. Staff Activity (derived from real tasks + vitals, last 7 days)
  const myStaff = useMemo(
    () =>
      staff
        .filter((s) => (s.role === 'admin' || s.role === 'staff') && !!s.branchId)
        .filter((s) => branchIds.includes(s.branchId || '')),
    [staff, branchIds],
  );

  const staffActivityData = useMemo(() => {
    const now = new Date();
    const since = startOfDay(addDays(now, -6));

    const vitalsInWindow = vitals
      .map((v) => ({ ...v, _date: new Date(v.date) }))
      .filter((v) => !Number.isNaN(v._date.getTime()))
      .filter((v) => v._date >= since)
      .filter((v) => v.branchId && branchIds.includes(v.branchId));

    const tasksCompleted = new Map<string, number>();
    for (const t of myTasks) {
      if (t.status !== 'Done') continue;
      if (!t.assignedTo) continue;
      tasksCompleted.set(t.assignedTo, (tasksCompleted.get(t.assignedTo) || 0) + 1);
    }

    const vitalsLogged = new Map<string, number>();
    for (const v of vitalsInWindow) {
      if (!v.recordedById) continue;
      vitalsLogged.set(v.recordedById, (vitalsLogged.get(v.recordedById) || 0) + 1);
    }

    return myStaff
      .map((s) => ({
        id: s.id,
        name: s.firstName,
        tasksCompleted: tasksCompleted.get(s.id) || 0,
        vitalsLogged: vitalsLogged.get(s.id) || 0,
      }))
      .sort((a, b) => b.tasksCompleted + b.vitalsLogged - (a.tasksCompleted + a.vitalsLogged))
      .slice(0, 8);
  }, [myStaff, myTasks, vitals, branchIds]);

  if (loading) {
    return <OwnerReportSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Facility Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Analytics across all your branches.</p>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Facility Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analytics across all your branches.
          </p>
        </div>
        <Button variant="outline" icon={Printer} onClick={() => window.print()}>
          Print Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Vitals Trends */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Average Vitals Trends
            </h2>
            <select className="text-sm border-slate-200 rounded-md py-1">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={vitalsTrendData}
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
                  dataKey="day"
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
                  domain={['dataMin - 10', 'dataMax + 10']} />
                
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="avgSystolic"
                  name="Avg Systolic"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{
                    r: 3
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="avgDiastolic"
                  name="Avg Diastolic"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{
                    r: 3
                  }} />
                
                <Line
                  type="monotone"
                  dataKey="avgHR"
                  name="Avg Heart Rate"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{
                    r: 3
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Task Completion */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Task Completion Status
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {taskData.map((entry, index) =>
                  <Cell
                    key={`cell-${index}`}
                    fill={TASK_COLORS[index % TASK_COLORS.length]} />

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

        {/* Chart 3: Alerts by Branch */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Alerts by Branch
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={alertData}
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
                
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar
                  dataKey="Critical"
                  stackId="a"
                  fill="#EF4444"
                  barSize={40} />
                
                <Bar
                  dataKey="Warning"
                  stackId="a"
                  fill="#F59E0B"
                  barSize={40} />
                
                <Bar
                  dataKey="Info"
                  stackId="a"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  barSize={40} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Staff Activity */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Top Staff Activity (This Week)
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={staffActivityData}
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
                
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar
                  dataKey="tasksCompleted"
                  name="Tasks Completed"
                  stackId="a"
                  fill="#0D9488"
                  barSize={20} />
                
                <Bar
                  dataKey="vitalsLogged"
                  name="Vitals Logged"
                  stackId="a"
                  fill="#38BDF8"
                  radius={[0, 4, 4, 0]}
                  barSize={20} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>);

};