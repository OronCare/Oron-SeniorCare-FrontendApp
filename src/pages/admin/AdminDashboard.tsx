import React from 'react';
import {
  Users,
  Activity,
  ClipboardList,
  AlertCircle,
  Plus,
  HeartPulse } from
'lucide-react';
import { StatsCard, Card, Badge, Button } from '../../components/UI';
import {
  mockResidents,
  mockTasks,
  mockAlerts,
  mockStaffMembers } from
'../../mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFullName } from '../../types';
export const AdminDashboard = () => {
  const { user } = useAuth();
  const branchId = user?.branchId || 'b1';
  const myResidents = mockResidents.filter((r) => r.branchId === branchId);
  const activeResidents = myResidents.filter(
    (r) => r.status === 'InPatient'
  ).length;
  const myTasks = mockTasks.filter((t) => t.branchId === branchId);
  const pendingTasks = myTasks.filter(
    (t) => t.status === 'Todo' || t.status === 'In Progress'
  ).length;
  const adminAlerts = mockAlerts.filter(
    (a) => a.targetRoles.includes('admin') && a.branchId === branchId
  );
  const criticalAlerts = adminAlerts.filter(
    (a) => a.severity === 'Critical' && a.status !== 'Resolved'
  ).length;
  const staffCount = mockStaffMembers.filter(
    (s) => s.branchId === branchId
  ).length;
  const recentTasks = myTasks.slice(0, 4);
  const getTaskCategoryColor = (category: string) => {
    switch (category) {
      case 'Medication':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Bathing':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Vitals':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Therapy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Meal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branch Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage residents, staff, and daily operations for your branch
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/vitals">
            <Button variant="secondary" icon={HeartPulse}>
              Enter Vitals
            </Button>
          </Link>
          <Link to="/admin/residents/new">
            <Button icon={Plus}>Add Resident</Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="InPatient Residents"
          value={activeResidents}
          icon={Users} />
        
        <StatsCard title="Active Staff" value={staffCount} icon={Activity} />
        <StatsCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={ClipboardList} />
        
        <StatsCard
          title="Critical Alerts"
          value={criticalAlerts}
          icon={AlertCircle}
          trend={criticalAlerts > 0 ? 'Requires attention' : 'All clear'}
          trendUp={criticalAlerts === 0} />
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Board Preview */}
        <Card className="flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Today's Tasks
            </h2>
            <Link
              to="/admin/tasks"
              className="text-sm font-medium text-brand-600 hover:text-brand-700">
              
              View Board
            </Link>
          </div>
          <div className="p-5 space-y-3 flex-1">
            {recentTasks.map((task) => {
              const resident = myResidents.find((r) => r.id === task.residentId);
              return (
                <div
                  key={task.id}
                  className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow">
                  
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900">
                        {task.title}
                      </h3>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getTaskCategoryColor(task.category)}`}>
                        
                        {task.category}
                      </span>
                    </div>
                    <Badge
                      variant={
                      task.status === 'Todo' ?
                      'default' :
                      task.status === 'In Progress' ?
                      'info' :
                      'success'
                      }>
                      
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-1">
                    {task.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {resident ? getFullName(resident) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5" />
                      <span>
                        Due:{' '}
                        {new Date(task.dueDate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>);

            })}
            {recentTasks.length === 0 &&
            <div className="text-center text-sm text-slate-500 py-8">
                No tasks for today.
              </div>
            }
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card className="flex flex-col h-full" noPadding>
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Alerts
            </h2>
            <Badge variant="danger">
              {adminAlerts.filter((a) => a.status === 'Unread').length} New
            </Badge>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {adminAlerts.map((alert) => {
              const resident = alert.residentId ?
              myResidents.find((r) => r.id === alert.residentId) :
              null;
              return (
                <div
                  key={alert.id}
                  className={`p-5 flex gap-4 ${alert.status === 'Unread' ? 'bg-slate-50/50' : ''}`}>
                  
                  <div
                    className={`mt-1 p-2 rounded-full shrink-0 h-fit ${alert.severity === 'Critical' ? 'bg-red-100 text-red-600' : alert.severity === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                    
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">
                        {alert.title}
                      </p>
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(alert.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {alert.message}
                    </p>
                    {resident &&
                    <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 rounded-md">
                          Resident: {getFullName(resident)}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 rounded-md">
                          Room: {resident.room}
                        </span>
                      </div>
                    }
                  </div>
                </div>);

            })}
            {adminAlerts.length === 0 &&
            <div className="text-center text-sm text-slate-500 py-8">
                No recent alerts.
              </div>
            }
          </div>
        </Card>
      </div>
    </div>);

};