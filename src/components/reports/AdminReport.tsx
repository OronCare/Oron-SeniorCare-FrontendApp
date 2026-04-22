import React from 'react';
  import { Card } from '../../components/UI';
  import {
    mockVitals,
    mockTasks,
    mockAlerts,
    mockStaffMembers } from
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
  export const AdminReport = () => {
    const { user } = useAuth();
    const branchId = user?.branchId;
    // Filter data by branch
    const branchTasks = mockTasks.filter((t) => t.branchId === branchId);
    const branchAlerts = mockAlerts.filter((a) => a.branchId === branchId);
    const branchStaff = mockStaffMembers.filter((s) => s.branchId === branchId);
    // 1. Vitals Trends (Mock data representing branch averages)
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
  
    // 2. Tasks by Category
    const categoryCounts = branchTasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const taskData = Object.entries(categoryCounts).map(([name, value]) => ({
      name,
      value
    }));
    const TASK_COLORS = [
    '#A855F7',
    '#06B6D4',
    '#EF4444',
    '#22C55E',
    '#F59E0B',
    '#F97316',
    '#64748B' // General (slate)
    ];
    // 3. Alerts by Health State
    const stateCounts = branchAlerts.reduce(
      (acc, alert) => {
        if (alert.healthState) {
          acc[alert.healthState] = (acc[alert.healthState] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );
    const alertData = Object.entries(stateCounts).map(([name, count]) => ({
      name,
      count
    }));
    // 4. Staff Activity (Mock data based on branch staff)
    const staffActivityData = branchStaff.map((staff) => ({
      name: staff.firstName,
      tasksCompleted: Math.floor(Math.random() * 20) + 5,
      vitalsLogged: Math.floor(Math.random() * 15) + 2
    }));
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