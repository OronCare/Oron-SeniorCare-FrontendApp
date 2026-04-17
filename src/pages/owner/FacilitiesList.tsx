import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Plus,
  MoreVertical,
  FileText,
  Network,
  Users,
  Eye } from
'lucide-react';
import { Card, Button, Badge, Input } from '../../components/UI';
import { mockFacilities } from '../../mockData';
import { Link } from 'react-router-dom';
export const FacilitiesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const filteredFacilities = mockFacilities.filter((facility) => {
    const matchesSearch =
    facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.facilityAdminName.
    toLowerCase().
    includes(searchTerm.toLowerCase());
    const matchesStatus =
    statusFilter === 'All' || facility.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facilities</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage onboarded facilities and contracts
          </p>
        </div>
        <Link to="/owner/facilities/new">
          <Button icon={Plus}>Onboard Facility</Button>
        </Link>
      </div>

      <Card className=''>
        {/* Toolbar */}
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

        {/* Table */}
        <div className="w-[300px] md:w-full ">
          <table className="text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Facility Info</th>
                <th className="px-6 py-4 font-semibold">Admin Contact</th>
                <th className="px-6 py-4 font-semibold">Contract Period</th>
                <th className="px-6 py-4 font-semibold">Branches</th>
                <th className="px-6 py-4 font-semibold">Residents</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFacilities.map((facility) => {
                return (
                  <tr
                    key={facility.id}
                    className="hover:bg-slate-50/80 transition-colors group">
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {facility.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {facility.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">
                        {facility.facilityAdminName}
                      </p>
                      <p className="text-xs text-slate-500">{facility.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-medium">
                          {new Date(
                            facility.contractStart
                          ).toLocaleDateString()}{' '}
                          -{' '}
                          {new Date(facility.contractEnd).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Network className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">
                          {facility.totalBranches}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">
                          {facility.totalResidents}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                        facility.status === 'Active' ?
                        'success' :
                        facility.status === 'Pending' ?
                        'warning' :
                        'danger'
                        }>
                        
                        {facility.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/owner/facilities/${facility.id}`}>
                          <Button variant="ghost" size="sm" icon={Eye}>
                            View
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>);

              })}
              {filteredFacilities.length === 0 &&
              <tr>
                  <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-slate-500">
                  
                    <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">
                      No facilities found
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

        {/* Pagination (Mock) */}
        <div className="p-4  border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">1</span> to{' '}
            <span className="font-medium text-slate-900">
              {filteredFacilities.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">
              {filteredFacilities.length}
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