// components/shared/Notifications.tsx
import React, { useState, useMemo } from 'react';
import {
  Bell,
  ShieldAlert,
  Check,
  CheckCircle2,
  Info,
  AlertTriangle,
} from 'lucide-react';
import { Card, Button, Badge } from '../UI';
import { mockAlerts, mockBranches, mockFacilities } from '../../mockData';
import { useAuth } from '../../context/AuthContext';

type Role = 'admin' | 'facility_admin' | 'staff';

export const Notifications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [alerts, setAlerts] = useState(() => {
    // 1. Filter alerts based on user role
    let filtered = mockAlerts.filter((a) => a.targetRoles.includes(user?.role || ''));

    if (user?.role === 'facility_admin') {
      const facilityId = user.facilityId || 'fac1';
      const myBranches = mockBranches.filter((b) => b.facilityId === facilityId);
      const branchIds = myBranches.map((b) => b.id);
      filtered = filtered.filter(
        (a) =>
          a.facilityId === facilityId || (a.branchId && branchIds.includes(a.branchId))
      );
    } else if (user?.role === 'staff') {
      // Staff only sees alerts for their own branch
      const myBranchId = user.branchId;
      if (myBranchId) {
        filtered = filtered.filter((a) => a.branchId === myBranchId);
      }
    }
    // For admin, we show all alerts that target 'admin' (already filtered)
    return filtered;
  });

  const tabs = ['All', 'Unread', 'Critical', 'Warning', 'Info'];

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unread') return alert.status === 'Unread';
    return alert.severity === activeTab;
  });

  const markAsRead = (id: string) => {
    setAlerts(
      alerts.map((a) =>
        a.id === id ? { ...a, status: 'Read' } : a
      )
    );
  };

  const markAllAsRead = () => {
    setAlerts(
      alerts.map((a) => ({ ...a, status: 'Read' }))
    );
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return <ShieldAlert className="h-5 w-5 text-red-600" />;
      case 'Warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100';
      case 'Warning':
        return 'bg-amber-100';
      default:
        return 'bg-blue-100';
    }
  };

  const getHealthStateColor = (state?: string) => {
    if (!state) return '';
    switch (state) {
      case 'Stable':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Slight Deviation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Concerning Trend':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Early Deterioration':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Active Deterioration':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Recovery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId) return null;
    const branch = mockBranches.find((b) => b.id === branchId);
    return branch?.name;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            System alerts and updates relevant to you.
          </p>
        </div>
        <Button variant="outline" icon={CheckCircle2} onClick={markAllAsRead}>
          Mark All as Read
        </Button>
      </div>

      <Card noPadding>
        <div className="border-b border-slate-200 px-2">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab}
                {tab === 'Unread' && alerts.filter((a) => a.status === 'Unread').length > 0 && (
                  <span className="ml-2 bg-brand-100 text-brand-700 py-0.5 px-2 rounded-full text-xs">
                    {alerts.filter((a) => a.status === 'Unread').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAlerts.map((alert) => {
            const branchName = getBranchName(alert.branchId);
            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 transition-colors ${
                  alert.status === 'Unread' ? 'bg-brand-50/30' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${getBgColor(
                    alert.severity
                  )}`}
                >
                  {getIcon(alert.severity)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3
                      className={`text-base font-semibold ${
                        alert.status === 'Unread' ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {alert.title}
                    </h3>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {new Date(alert.date).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${
                      alert.status === 'Unread' ? 'text-slate-700' : 'text-slate-500'
                    }`}
                  >
                    {alert.message}
                  </p>
                  <div className="flex items-center gap-3 pt-2 flex-wrap">
                    <Badge
                      variant={
                        alert.severity === 'Critical'
                          ? 'danger'
                          : alert.severity === 'Warning'
                          ? 'warning'
                          : 'info'
                      }
                    >
                      {alert.severity}
                    </Badge>
                    {branchName && (
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                        {branchName}
                      </span>
                    )}
                    {alert.healthState && (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getHealthStateColor(
                          alert.healthState
                        )}`}
                      >
                        {alert.healthState}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-start justify-end sm:w-24">
                  {alert.status === 'Unread' && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1 hover:bg-brand-50 rounded transition-colors"
                    >
                      <Check className="h-3 w-3" /> Mark Read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filteredAlerts.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <Bell className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-medium text-slate-900">No notifications</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};