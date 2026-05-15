import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, Input } from '../../components/UI';
import SmartTable from '../../shared/Table';
import { BranchesActions, BranchesColumns } from '../../shared/TableColumns';
import { useGetBranchesPaginatedQuery } from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import TableSkeleton from '../skeletons/TableSkeleton';
import { Pagination } from '../Pagination';
import { RefreshButton } from '../refresh/Refresh';

const PAGE_SIZE = 10;

export const BranchLists = () => {
  const toast = useToast();
  const errorToastShown = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetBranchesPaginatedQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status: statusFilter,
  });

  const branches = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
  const loading = isLoading || isFetching;
  const errorMessage = isError
    ? getApiErrorMessage(error, 'Failed to fetch branches')
    : null;

  useEffect(() => {
    if (!isError) {
      errorToastShown.current = false;
      return;
    }
    if (errorToastShown.current) return;
    errorToastShown.current = true;
    toast.error(getApiErrorMessage(error, 'Failed to fetch branches'));
  }, [isError, error, toast]);

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const safePage = Math.min(Math.max(page, 1), totalPages);
  const showingFrom = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, total);
  const tableActions = useMemo(() => BranchesActions, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage branches from your backend data
          </p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <RefreshButton onRefresh={() => void refetch()} isLoading={loading} />
        </div>
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search branches or admins..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <Filter className="h-4 w-4" />
              <select
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg m-4">
            {errorMessage}
          </div>
        )}

        {loading ? (
          <TableSkeleton
            rows={PAGE_SIZE}
            columns={BranchesColumns.map((column) => column.label)}
          />
        ) : total === 0 ? (
          <div className="p-8 text-center">
            <div className="text-slate-400 mb-2">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-lg font-medium text-slate-900">No branches found</p>
            <p className="text-sm mt-1 text-slate-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <SmartTable
            data={branches}
            columns={BranchesColumns}
            actions={tableActions}
          />
        )}

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">{showingFrom}</span> to{' '}
            <span className="font-medium text-slate-900">{showingTo}</span> of{' '}
            <span className="font-medium text-slate-900">{total}</span> results
          </p>
          <Pagination
            page={safePage}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </Card>
    </div>
  );
};
