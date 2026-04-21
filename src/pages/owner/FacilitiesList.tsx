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
  Eye
} from
  'lucide-react';
import { Card, Button, Badge, Input } from '../../components/UI';
import { mockFacilities } from '../../mockData';
import { Link } from 'react-router-dom';
import SmartTable from '../../shared/Table';
import { FacilitesActions, Faciltescolumns } from '../../shared/TableColumns';
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
          <SmartTable
            data={filteredFacilities}
            columns={Faciltescolumns}
            actions={FacilitesActions}
          />

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