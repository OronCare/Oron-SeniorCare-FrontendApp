import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2
} from
  'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { Link } from 'react-router-dom';
import SmartTable from '../../shared/Table';
import { Faciltescolumns } from '../../shared/TableColumns';
import { Facility } from '../../types';
import { useGetFacilitiesQuery } from '../../store/api/oronApi';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import TableSkeleton from '../skeletons/TableSkeleton';
import { Pagination } from '../Pagination';
import { RefreshButton } from '../refresh/Refresh';

export const FacilitiesList = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 5;

  const {
    data: facilities = [],
    isLoading: loading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetFacilitiesQuery();

  useEffect(() => {
    if (isError && error) {
      toast.error(getApiErrorMessage(error, 'Failed to fetch facilities'));
    }
  }, [isError, error, toast]);

  const safeFacilities = Array.isArray(facilities) ? facilities : [];

  const filteredFacilities = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return safeFacilities.filter((facility) => {
      const matchesSearch =
        facility.name.toLowerCase().includes(q) ||
        (facility.facilityAdminName || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || facility.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [safeFacilities, searchTerm, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, facilities.length]);

  const totalPages = Math.max(1, Math.ceil(filteredFacilities.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const pagedFacilities = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredFacilities.slice(start, start + PAGE_SIZE);
  }, [filteredFacilities, safePage]);

  const showingFrom =
    filteredFacilities.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, filteredFacilities.length);
  const actions = useMemo(() => [
      {
      render: (facility : Facility) => (
        <Link to={`/owner/facilities/${facility.id}`}>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primarySoft"
            title="View facility"
            aria-label="View facility"
          >
            <Eye className="h-4 w-4" />
          </span>
        </Link>
      )
    },
    {
      render: (facility: Facility) => (
        <Link to={`/owner/facilities/${facility.id}/edit`}>
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-fg shadow-sm transition-colors hover:bg-primarySoft"
            title="Edit facility"
            aria-label="Edit facility"
          >
            <Edit2 className="h-4 w-4" />
          </span>
        </Link>
      )
    }
  ], []);
  const errorMessage = isError ? getApiErrorMessage(error, 'Failed to fetch facilities') : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facilities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage onboarded facilities and contracts
          </p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Link to="/owner/facilities/new">
            <Button icon={Plus}>Onboard Facility</Button>
          </Link>
          <RefreshButton onRefresh={() => void refetch()} isLoading={isFetching} />
        </div>
      </div>

      <Card className=''>
        <div className="p-5  border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search facilities or admins..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />

          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <Filter className="h-4 w-4" />
              <select
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>

                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>
        <div className="w-full overflow-x-auto ">
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : null}
          {errorMessage && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg m-4">
              {errorMessage}
            </div>
          )}
          {!loading && filteredFacilities.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-slate-400 mb-2">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-lg font-medium text-slate-900">No facilities found</p>
              <p className="text-sm mt-1 text-slate-500">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            !loading && (
              <SmartTable
                data={pagedFacilities}
                columns={Faciltescolumns}
                actions={actions}
              />
            )

          )}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">{showingFrom}</span> to{' '}
            <span className="font-medium text-slate-900">{showingTo}</span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">{filteredFacilities.length}</span>{' '}
            results
          </p>
          <Pagination
            page={safePage}
            totalItems={filteredFacilities.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
        </div>
      </Card>
    </div>);

};
