import React from 'react';
import { Printer } from 'lucide-react';
import { Card, Button } from '../../components/UI';
import { mockFacilities, mockBranches, mockAlerts } from '../../mockData';
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
export const OwnerReport = () => {
  // 1. Branch Utilization Data
  const utilizationData = mockBranches.map((b) => ({
    name: b.name.split(' ')[0],
    utilization: Math.round(b.currentResidents / b.residentLimit * 100),
    limit: b.residentLimit
  }));
  // 2. Resident Growth Data (Mock trend)
  const growthData = [
  {
    month: 'Oct',
    residents: 180
  },
  {
    month: 'Nov',
    residents: 195
  },
  {
    month: 'Dec',
    residents: 205
  },
  {
    month: 'Jan',
    residents: 210
  },
  {
    month: 'Feb',
    residents: 215
  },
  {
    month: 'Mar',
    residents: 217
  }];

  // 3. Contract Status Data
  const activeCount = mockFacilities.filter((f) => f.status === 'Active').length;
  const pendingCount = mockFacilities.filter(
    (f) => f.status === 'Pending'
  ).length;
  const suspendedCount = mockFacilities.filter(
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
  const criticalCount = mockAlerts.filter(
    (a) => a.severity === 'Critical'
  ).length;
  const warningCount = mockAlerts.filter((a) => a.severity === 'Warning').length;
  const infoCount = mockAlerts.filter((a) => a.severity === 'Info').length;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Platform Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System-wide analytics and trends
          </p>
        </div>
        <Button variant="outline" icon={Printer} onClick={() => window.print()}>
          Print Report
        </Button>
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