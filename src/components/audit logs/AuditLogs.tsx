import { useCallback, useEffect, useState } from 'react';
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
import { Pagination } from '../Pagination';
import { RefreshButton } from '../refresh/Refresh';

const PAGE_SIZE = 10;

export const AuditLog = () => {
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [logs, setLogs] = useState<AuditLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [availableActions, setAvailableActions] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const PAGE_SIZE = 5;
  const fetchAuditLogs = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    try {
      setLoading(true);
      setError(null);
      const data = await auditLogService.getAuditLogs();
      setLogs(data.data);
      setTotal(data.total);
      setAvailableActions(data.actions);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to load audit logs');
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, debouncedSearch, isAuthenticated, page, toast, user]);

  useEffect(() => {
    void fetchAuditLogs();
  }, [fetchAuditLogs]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const showingFrom = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, total);

  const handleExportCSV = useCallback(async () => {
    try {
      const result = await auditLogService.getAuditLogs({
        page: 1,
        limit: Math.min(total || PAGE_SIZE, 500),
        search: debouncedSearch,
        action: actionFilter,
      });
      const exportLogs = result.data;
      const headers = ['Timestamp', 'User', 'Action', 'Details'];
      const csvContent = [
        headers.join(','),
        ...exportLogs.map(
          (log) =>
            `"${new Date(log.timestamp).toISOString()}","${log.user}","${log.action}","${log.details.replace(/"/g, '""')}"`,
        ),
      ].join('\n');
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'audit_logs.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to export audit logs'));
    }
  }, [actionFilter, debouncedSearch, toast, total]);

  

  const actionOptions = ['All', ...availableActions];

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ">
        <div className='min-w-0 shrink'>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all system activity and user actions for your branch.
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        <Button variant="outline" icon={Download} onClick={() => void handleExportCSV()}>
          Export CSV
        </Button>
        <RefreshButton onRefresh={fetchAuditLogs}/>
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
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}>
                {actionOptions.map((action) =>
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
           {/* TABLE */}

{loading ? (
    <TableSkeleton
        rows={PAGE_SIZE}
        columns={Aditlogscolumns.map((column) => column.label)}
    />
) : total === 0 ? (
    <div className="p-8 text-center">
        <div className="text-slate-400 mb-2">
            <Search className="h-12 w-12 mx-auto" />
        </div>

        <p className="text-lg font-medium text-slate-900">
            No audit logs found
        </p>

        <p className="text-sm mt-1 text-slate-500">
            Try adjusting your search or filters
        </p>
    </div>
) : (
  <SmartTable
  data={logs}
  columns={Aditlogscolumns}
  />
)}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">{showingFrom}</span> to{' '}
            <span className="font-medium text-slate-900">{showingTo}</span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">{total}</span>{' '}
            results
          </p>
          <Pagination
            page={safePage}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>);

};