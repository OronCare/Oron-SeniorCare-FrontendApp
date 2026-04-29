import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2
} from
  'lucide-react';
import { Card, Button, Input, Modal } from '../../components/UI';
import { Link } from 'react-router-dom';
import SmartTable from '../../shared/Table';
import { Faciltescolumns } from '../../shared/TableColumns';
import { Facility } from '../../types';
import axios from 'axios';

export const FacilitiesList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiBase = (import.meta as any).env?.VITE_API_URL as string;
      const auth = localStorage.getItem('oron_auth');
      const token = auth ? (JSON.parse(auth) as { token?: string }).token : '';

      const response = await axios.get(`${apiBase}/facilities`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
      });

      const payload = response.data;
      const data: Facility[] = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.facilities)
            ? payload.facilities
            : [];

      setFacilities(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch facilities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const safeFacilities = Array.isArray(facilities) ? facilities : [];

  const filteredFacilities = safeFacilities.filter((facility) => {
    const matchesSearch =
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (facility.facilityAdminName || '').
        toLowerCase().
        includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'All' || facility.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const actions = [
      {
      render: (facility : Facility) => (
        <Link to={`/owner/facilities/${facility.id}`}>
          <Button variant="ghost" size="sm" icon={Eye}>
            View
          </Button>
        </Link>
      )
    },
    {
      render: (facility: Facility) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Edit2}
          onClick={() => {
            setSelectedFacility(facility);
            setIsEditModalOpen(true);
          }}
        >
          Edit
        </Button>
      )
    }
  ];

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
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg m-4">
              {error}
            </div>
          )}
          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading facilities...
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No facilities found
            </div>
          ) : (
            <>
              {/* Table */}
              <SmartTable
                data={filteredFacilities}
                columns={Faciltescolumns}
                actions={actions}
              />
            </>
          )}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Facility Details">
            <div className="space-y-4">
              <Input label="Facility Name" defaultValue={selectedFacility?.name} />
              <Input label="Phone Number" type='number' defaultValue={selectedFacility?.phone} />
              <Input label="Email" type='email' defaultValue={selectedFacility?.email} />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Facility Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  defaultValue={selectedFacility?.type}>
                  <option>Senior Living</option>
                  <option>Assisted Living</option>
                  <option>Memory Care</option>
                  <option>Multi-Specialty</option>
                </select>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button onClick={() => setIsEditModalOpen(false)} className="w-full sm:w-auto">
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </Card>
    </div>);

};