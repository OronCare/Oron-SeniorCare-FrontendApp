import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import SmartTable from '../../shared/Table';
import { Aditlogscolumns } from '../../shared/TableColumns';
import { useGetAuditLogsQuery } from '../../store/api/oronApi';
import { AuditLog as AuditLogType } from '../../types';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import TableSkeleton from '../skeletons/TableSkeleton';
import { Pagination } from '../Pagination';
import { RefreshButton } from '../refresh/Refresh';


export const AuditLog = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 5;

  const {
    data: logs = [],
    isLoading: loading,
    isError,
    error: queryError,
    refetch,
    isFetching,
  } = useGetAuditLogsQuery(undefined, { skip: !isAuthenticated || !user });

  useEffect(() => {
    if (isError && queryError) {
      const message = getApiErrorMessage(queryError, 'Failed to load audit logs');
      setError(message);
      toast.error(message);
    }
  }, [isError, queryError, toast]);

  const uniqueActions = useMemo(() => {
    return ['All', ...Array.from(new Set(logs.map((log) => log.action)))];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSearch =
        log.user.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q);
      const matchesAction = actionFilter === 'All' || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });
  }, [actionFilter, logs, searchTerm]);

  // Reset to first page on filter/search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, actionFilter, logs.length]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pagedLogs = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, safePage]);

  const showingFrom = filteredLogs.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, filteredLogs.length);


  const handleExportCSV = useCallback(() => {
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
  }, [filteredLogs]);
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
        <div className="flex items-center gap-2 sm:ml-auto">
        <Button variant="outline" icon={Download} onClick={handleExportCSV}>
          Export CSV
        </Button>
        <RefreshButton onRefresh={() => void refetch()} isLoading={isFetching} />
        </div>
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
            data={pagedLogs}
            columns={Aditlogscolumns}
            />
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">{showingFrom}</span> to{' '}
            <span className="font-medium text-slate-900">{showingTo}</span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">{filteredLogs.length}</span>{' '}
            results
          </p>
          <Pagination
            page={safePage}
            totalItems={filteredLogs.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>);

};