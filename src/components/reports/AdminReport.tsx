import { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { Printer } from 'lucide-react';
import { Button } from '../../components/UI';
import { OwnerReportSkeleton } from '../skeletons/ReportsSkeleton';
import { taskService } from '../../services/taskService';
import { alertsService } from '../../services/alertsService';
import { usersService } from '../../services/usersService';
import { vitalService } from '../../services/vitalService';
import { residentService } from '../../services/residentService';
import { Alert, Resident, Task, User, Vital } from '../../types';
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
  Legend,
} from 'recharts';
import { RefreshButton } from '../refresh/Refresh';

export const AdminReport = () => {
  const { user } = useAuth();
  const branchId = user?.branchId || '';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  let isMounted = true;
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData, alertsData, usersData, vitalsData, residentsData] = await Promise.all([
        taskService.getAllTasks(),
        alertsService.getAlerts(),
        usersService.getAllUsers(),
        vitalService.getAllVitals(),
        residentService.getAllResidents(),
      ]);

      if (!isMounted) return;
      setTasks(tasksData);
      setAlerts(alertsData);
      setStaff(usersData);
      setVitals(vitalsData);
      setResidents(residentsData);
    } catch (err) {
      if (!isMounted) return;
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      if (!isMounted) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!branchId) {
      setError('Missing branch context. Please re-login.');
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [branchId]);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d: Date, days: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
  const dayLabel = (d: Date) => d.toLocaleString('en-US', { weekday: 'short' });

  // Filter data by branch
  const branchTasks = useMemo(() => tasks.filter((t) => t.branchId === branchId), [tasks, branchId]);
  const branchAlerts = useMemo(
    () => alerts.filter((a) => a.branchId === branchId).filter((a) => a.status !== 'Resolved'),
    [alerts, branchId],
  );
  const branchStaff = useMemo(
    () =>
      staff
        .filter((s) => (s.role === 'admin' || s.role === 'staff') && s.branchId === branchId),
    [staff, branchId],
  );

  const branchVitals = useMemo(() => vitals.filter((v) => v.branchId === branchId), [vitals, branchId]);

  const branchResidents = useMemo(
    () => residents.filter((r) => r.branchId === branchId),
    [residents, branchId],
  );

  const selectedResident = useMemo(() => {
    if (selectedResidentId === 'all') return null;
    return branchResidents.find((r) => r.id === selectedResidentId) || null;
  }, [branchResidents, selectedResidentId]);

  const vitalsForTrend = useMemo(() => {
    if (selectedResidentId === 'all') return branchVitals;
    return branchVitals.filter((v) => v.residentId === selectedResidentId);
  }, [branchVitals, selectedResidentId]);

  // 1. Vitals Trends (derived from last 7 days)
  const vitalsTrendData = useMemo(() => {
    const now = new Date();
    const windowStart = startOfDay(addDays(now, -6));
    const windowEnd = addDays(windowStart, 7);

    const inWindow = vitalsForTrend
      .map((v) => ({ ...v, _date: new Date(v.date) }))
      .filter((v) => !Number.isNaN(v._date.getTime()))
      .filter((v) => v._date >= windowStart && v._date < windowEnd);

    const avg = (vals: Array<number | undefined>) => {
      const xs = vals.filter((x): x is number => typeof x === 'number' && !Number.isNaN(x));
      if (xs.length === 0) return 0;
      return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
    };

    return Array.from({ length: 7 }).map((_, idx) => {
      const dayStart = addDays(windowStart, idx);
      const next = addDays(dayStart, 1);
      const forDay = inWindow.filter((v) => v._date >= dayStart && v._date < next);
      return {
        day: dayLabel(dayStart),
        avgSystolic: avg(forDay.map((v) => v.systolicBP)),
        avgDiastolic: avg(forDay.map((v) => v.diastolicBP)),
        avgHR: avg(forDay.map((v) => v.heartRate)),
      };
    });
  }, [vitalsForTrend]);

  // 2. Tasks by Category
  const taskData = useMemo(() => {
    const categoryCounts = branchTasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  }, [branchTasks]);

  const TASK_COLORS = [
    '#A855F7',
    '#06B6D4',
    '#EF4444',
    '#22C55E',
    '#F59E0B',
    '#F97316',
    '#64748B', // General (slate)
  ];

  // 3. Alerts by Health State
  const alertData = useMemo(() => {
    const stateCounts = branchAlerts.reduce((acc, alert) => {
      if (alert.healthState) {
        acc[alert.healthState] = (acc[alert.healthState] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stateCounts).map(([name, count]) => ({ name, count }));
  }, [branchAlerts]);

  // 4. Staff Activity (derived from real tasks + vitals, last 7 days)
  const staffActivityData = useMemo(() => {
    const now = new Date();
    const since = startOfDay(addDays(now, -6));

    const vitalsInWindow = branchVitals
      .map((v) => ({ ...v, _date: new Date(v.date) }))
      .filter((v) => !Number.isNaN(v._date.getTime()))
      .filter((v) => v._date >= since);

    const tasksCompleted = new Map<string, number>();
    for (const t of branchTasks) {
      if (t.status !== 'Done') continue;
      if (!t.assignedTo) continue;
      tasksCompleted.set(t.assignedTo, (tasksCompleted.get(t.assignedTo) || 0) + 1);
    }

    const vitalsLogged = new Map<string, number>();
    for (const v of vitalsInWindow) {
      if (!v.recordedById) continue;
      vitalsLogged.set(v.recordedById, (vitalsLogged.get(v.recordedById) || 0) + 1);
    }

    return branchStaff
      .map((s) => ({
        id: s.id,
        name: s.firstName,
        tasksCompleted: tasksCompleted.get(s.id) || 0,
        vitalsLogged: vitalsLogged.get(s.id) || 0,
      }))
      .sort((a, b) => b.tasksCompleted + b.vitalsLogged - (a.tasksCompleted + a.vitalsLogged));
  }, [branchStaff, branchTasks, branchVitals]);

  if (loading) {
    return <OwnerReportSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Branch Reports</h1>
            <p className="text-sm text-slate-500 mt-1">
              Analytics on resident health, staff performance, and operations for your branch.
            </p>
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
          <h1 className="text-2xl font-bold text-slate-900">Branch Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Analytics on resident health, staff performance, and operations for
            your branch.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
        <Button variant="outline" icon={Printer} onClick={() => window.print()}>
          Print Report
        </Button>
        <RefreshButton onRefresh={load}/>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Vitals Trends */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Average Vitals Trends
            </h2>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-600">Resident</label>
              <div className="relative group">
                <select
                  className="appearance-none text-sm bg-gradient-to-br from-white to-slate-50 
                 border border-slate-200 rounded-xl px-3 py-1.5 pr-8 
                 text-slate-700 font-medium cursor-pointer
                 shadow-sm hover:shadow-md transition-all duration-200
                 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 
                 hover:border-slate-300"
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(e.target.value)}
                >
                  <option value="all">✨ All residents</option>
                  {branchResidents.map((r) => (
                    <option key={r.id} value={r.id}>
                      👤 {r.firstName} {r.lastName}
                    </option>
                  ))}
                </select>
                {/* Animated custom arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none group-hover:translate-y-0.5 transition-transform duration-200">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            </div>
            {selectedResident && (
              <p className="text-xs text-slate-500 -mt-3 mb-4 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-blue-400"></span>
                Showing averages for
                <span className="font-semibold text-slate-700 bg-gradient-to-r from-slate-100 to-slate-50 px-2 py-0.5 rounded-md">
                  {selectedResident.firstName} {selectedResident.lastName}
                </span>
              </p>
            )}
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

        {/* Chart 2: Tasks by Category */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Tasks by Category
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

                  {taskData.map((_, index) =>
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

        {/* Chart 3: Alerts by Health State */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Alerts by Health State
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

                <Bar
                  dataKey="count"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                  barSize={40} />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Staff Activity */}
        <Card>
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Staff Activity (This Week)
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
                  radius={[0, 0, 0, 0]}
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