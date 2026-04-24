import React from 'react';
import { Card } from '../../components/UI';
import {
  mockVitals,
  mockTasks,
  mockAlerts,
  mockStaffMembers,
  mockBranches } from
'../../mockData';
import { useAuth } from '../../context/AuthContext';
import { Printer } from 'lucide-react';
import { Button } from '../../components/UI';
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
  const facilityId = user?.facilityId || 'fac1';
  const myBranches = mockBranches.filter((b) => b.facilityId === facilityId);
  const branchIds = myBranches.map((b) => b.id);
  // 1. Vitals Trends (Mock data representing facility averages)
  const vitalsTrendData = [
  {
    day: 'Mon',
    avgSystolic: 125,
    avgDiastolic: 82,
    avgHR: 72
  },
  {
    day: 'Tue',
    avgSystolic: 128,
    avgDiastolic: 84,
    avgHR: 74
  },
  {
    day: 'Wed',
    avgSystolic: 124,
    avgDiastolic: 80,
    avgHR: 71
  },
  {
    day: 'Thu',
    avgSystolic: 126,
    avgDiastolic: 82,
    avgHR: 73
  },
  {
    day: 'Fri',
    avgSystolic: 122,
    avgDiastolic: 78,
    avgHR: 70
  },
  {
    day: 'Sat',
    avgSystolic: 125,
    avgDiastolic: 80,
    avgHR: 72
  },
  {
    day: 'Sun',
    avgSystolic: 127,
    avgDiastolic: 83,
    avgHR: 75
  }];

  // 2. Task Completion Rate across branches
  const myTasks = mockTasks.filter((t) => branchIds.includes(t.branchId));
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
  const myAlerts = mockAlerts.filter(
    (a) => a.branchId && branchIds.includes(a.branchId)
  );
  const alertData = myBranches.map((branch) => {
    const branchAlerts = myAlerts.filter((a) => a.branchId === branch.id);
    return {
      name: branch.name.split(' ')[0],
      Critical: branchAlerts.filter((a) => a.severity === 'Critical').length,
      Warning: branchAlerts.filter((a) => a.severity === 'Warning').length,
      Info: branchAlerts.filter((a) => a.severity === 'Info').length
    };
  });
  // 4. Staff Activity (Mock data)
  const myStaff = mockStaffMembers.filter((s) => branchIds.includes(s.branchId));
  const staffActivityData = myStaff.slice(0, 8).map((staff) => ({
    name: staff.firstName,
    tasksCompleted: Math.floor(Math.random() * 20) + 5,
    vitalsLogged: Math.floor(Math.random() * 15) + 2
  }));
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