import React, { useState, createElement } from 'react';
import { FileText, Search, Filter, Download, Calendar } from 'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { mockAuditLogs } from '../../mockData';
import { useAuth } from '../../context/AuthContext';
export const AuditLogs = () => {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  // Filter logs by branch
  const branchLogs = mockAuditLogs.filter((log) => log.branchId === branchId);
  const uniqueActions = [
  'All',
  ...Array.from(new Set(branchLogs.map((log) => log.action)))];

  const filteredLogs = branchLogs.filter((log) => {
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
        {/*Table*/}
        <div className='w-full overflow-x-auto'>

        <div className="w-[400px]">
          <table className="text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Action</th>
                <th className="px-6 py-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) =>
              <tr
                key={log.id}
                className="hover:bg-slate-50/80 transition-colors">
                
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-slate-900">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                        {log.user.
                      split(' ').
                      map((n) => n[0]).
                      join('')}
                      </div>
                      <span className="font-medium text-slate-900">
                        {log.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td
                  className="px-6 py-4 text-slate-600 max-w-md truncate"
                  title={log.details}>
                  
                    {log.details}
                  </td>
                </tr>
              )}
              {filteredLogs.length === 0 &&
              <tr>
                  <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-500">
                  
                    <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">
                      No logs found
                    </p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing{' '}
            <span className="font-medium text-slate-900">
              {filteredLogs.length}
            </span>{' '}
            results
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
        </div>
      </Card>
    </div>);

};