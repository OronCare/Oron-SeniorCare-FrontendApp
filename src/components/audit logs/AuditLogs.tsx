import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import SmartTable from '../../shared/Table';
import { Aditlogscolumns } from '../../shared/TableColumns';
import { auditLogService } from '../../services/auditLogService';
import { AuditLog as AuditLogType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import TableSkeleton from '../skeletons/TableSkeleton';


export const AuditLog = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    const fetchAuditLogs = async () => {
      if (!isAuthenticated || !user) return;
      try {
        setLoading(true);
        setError(null);
        const data = await auditLogService.getAuditLogs();
        setLogs(data);
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to load audit logs');
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchAuditLogs();
  }, [isAuthenticated, user]);

  const uniqueActions = [
  'All',
  ...Array.from(new Set(logs.map((log) => log.action)))];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });
  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User', 'Action', 'Details'];
    const csvContent = [
    headers.join(','),
    ...filteredLogs.map(
      (log) =>
      `"${new Date(log.timestamp).toISOString()}","${log.user}","${log.action}","${log.details.replace(/"/g, '""')}"`
    )].
    join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'audit_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  if (loading) {
    return (
        <TableSkeleton
            rows={5}
            columns={6}
        />
    );
}
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all system activity and user actions for your branch.
          </p>
        </div>
        <Button variant="outline" icon={Download} onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search user or details..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <Calendar className="h-4 w-4" />
              <select className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <Filter className="h-4 w-4" />
              <select
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer max-w-[120px]"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}>
                
                {uniqueActions.map((action) =>
                <option key={action} value={action}>
                    {action}
                  </option>
                )}
              </select>
            </div>
          </div>
        </div>
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg m-4">
            {error}
          </div>
        )}
        {/*Table*/}
            <SmartTable
            data={filteredLogs}
            columns={Aditlogscolumns}
            />
            {loading && <div className="p-4 text-sm text-slate-500">Loading audit logs...</div>}
      </Card>
    </div>);

};