import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Network, Users, Eye } from 'lucide-react';
import { Card, Button, Badge, Input } from '../../components/UI';
import { mockBranches } from '../../mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
export const BranchesList = () => {
  const { user } = useAuth();
  const facilityId = user?.facilityId || 'fac1';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const myBranches = mockBranches.filter((b) => b.facilityId === facilityId);
  const filteredBranches = myBranches.filter((branch) => {
    const matchesSearch =
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.branchAdminName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
    statusFilter === 'All' || branch.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all branches under your facility
          </p>
        </div>
      </div>

      <Card noPadding>
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search branches or admins..."
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

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <div className="w-[400px] md:w-full ">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Branch Info</th>
                <th className="px-6 py-4 font-semibold">Admin Contact</th>
                <th className="px-6 py-4 font-semibold">Residents</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBranches.map((branch) => {
                const usagePercent = Math.round(
                  branch.currentResidents / branch.residentLimit * 100
                );
                return (
                  <tr
                    key={branch.id}
                    className="hover:bg-slate-50/80 transition-colors group">
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                          <Network className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {branch.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {branch.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {branch.branchAdminName}
                      </p>
                      <p className="text-xs text-slate-500">{branch.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700">
                            {branch.currentResidents}
                          </span>
                          <span className="text-slate-500">
                            of {branch.residentLimit}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
                            style={{
                              width: `${usagePercent}%`
                            }}>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                        branch.status === 'Active' ?
                        'success' :
                        branch.status === 'Pending' ?
                        'warning' :
                        'danger'
                        }>
                        
                        {branch.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/facility-admin/branches/${branch.id}`}>
                          <Button variant="ghost" size="sm" icon={Eye}>
                            View
                          </Button>
                        </Link>

                      </div>
                    </td>
                  </tr>);

              })}
              {filteredBranches.length === 0 &&
              <tr>
                  <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-500">
                  
                    <Network className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">
                      No branches found
                    </p>
                    <p className="text-sm mt-1">
                      Try adjusting your search or filters.
                    </p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          </div>
        </div>

        {/* Pagination (Mock) */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">1</span> to{' '}
            <span className="font-medium text-slate-900">
              {filteredBranches.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">
              {filteredBranches.length}
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
      </Card>
    </div>);

};