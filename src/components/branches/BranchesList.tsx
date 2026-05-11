import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import SmartTable from '../../shared/Table';
import { BranchesActions, BranchesColumns } from '../../shared/TableColumns';
import { Branch } from '../../types';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';
import TableSkeleton from '../skeletons/TableSkeleton';
import { RefreshButton } from '../refresh/Refresh';

export const BranchLists = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBase = (import.meta as any).env?.VITE_API_URL as string;
      const auth = localStorage.getItem('oron_auth');
      const token = auth ? (JSON.parse(auth) as { token?: string }).token || '' : '';
      const response = await axios.get(`${apiBase}/branches`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
      });
      const data = response.data;
      const branchesData: Branch[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.branches)
            ? data.branches
            : [];
      setBranches(branchesData);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to fetch branches');
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.branchAdminName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || branch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
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
          <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage branches from your backend data
          </p>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
        <RefreshButton onRefresh={fetchBranches}/>
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
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg m-4">
            {error}
          </div>
        )}

        
          <SmartTable
            columns={BranchesColumns}
            actions={BranchesActions}
            data={filteredBranches}
          />
        

        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">1</span> to{' '}
            <span className="font-medium text-slate-900">{filteredBranches.length}</span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">{filteredBranches.length}</span>{' '}
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
      </Card>
    </div>
  );
};