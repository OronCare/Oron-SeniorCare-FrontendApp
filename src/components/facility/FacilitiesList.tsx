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
import { facilityService, UpdateFacilityRequest } from '../../services/facilityService';
import { useToast } from '../../context/ToastContext';
import { getApiErrorMessage } from '../../utils/apiMessage';

const emptyEditForm: UpdateFacilityRequest = {
  name: '',
  phone: '',
  email: '',
  type: 'Senior Living',
  status: 'Active',
  contractStart: '',
  contractEnd: '',
  adminFirstName: '',
  adminLastName: '',
  adminEmail: '',
  adminPassword: '',
};

export const FacilitiesList = () => {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility>();
  const [editForm, setEditForm] = useState<UpdateFacilityRequest>(emptyEditForm);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await facilityService.getAllFacilities();
      setFacilities(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to fetch facilities');
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const safeFacilities = Array.isArray(facilities) ? facilities : [];

  const formatDateForInput = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const handleOpenEditModal = (facility: Facility) => {
    const [adminFirstName = '', adminLastName = ''] = (facility.facilityAdminName || '')
      .trim()
      .split(/\s+/, 2);

    setSelectedFacility(facility);
    setEditForm({
      name: facility.name,
      phone: facility.phone,
      email: facility.email,
      type: facility.type,
      status: facility.status,
      contractStart: formatDateForInput(facility.contractStart),
      contractEnd: formatDateForInput(facility.contractEnd),
      adminFirstName,
      adminLastName,
      adminEmail: '',
      adminPassword: '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (field: keyof UpdateFacilityRequest, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateFacility = async () => {
    if (!selectedFacility) {
      return;
    }

    if (!editForm.adminEmail) {
      const message = 'Facility admin email is required to update facility details.';
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const payload: UpdateFacilityRequest = {
        ...editForm,
        adminPassword: editForm.adminPassword?.trim() || undefined,
      };

      const updatedFacility = await facilityService.updateFacility(selectedFacility.id, payload);
      setFacilities((prev) =>
        prev.map((facility) =>
          facility.id === selectedFacility.id ? { ...facility, ...updatedFacility } : facility,
        ),
      );
      setIsEditModalOpen(false);
      setSelectedFacility(undefined);
      setEditForm(emptyEditForm);
      toast.success('Facility updated successfully.');
    } catch (err) {
      const message = getApiErrorMessage(err, 'Failed to update facility');
      setError(message);
      toast.error(message);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

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
          onClick={() => handleOpenEditModal(facility)}
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
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedFacility(undefined);
              setEditForm(emptyEditForm);
            }}
            title="Edit Facility Details">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Facility Information
              </h3>
              <Input
                label="Facility Name"
                value={editForm.name}
                onChange={(e) => handleEditInputChange('name', e.target.value)}
              />
              <Input
                label="Phone Number"
                value={editForm.phone}
                onChange={(e) => handleEditInputChange('phone', e.target.value)}
              />
              <Input
                label="Email"
                type='email'
                value={editForm.email}
                onChange={(e) => handleEditInputChange('email', e.target.value)}
              />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Facility Type
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={editForm.type}
                  onChange={(e) => handleEditInputChange('type', e.target.value)}>
                  <option>Senior Living</option>
                  <option>Assisted Living</option>
                  <option>Memory Care</option>
                  <option>Multi-Specialty</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                  value={editForm.status}
                  onChange={(e) => handleEditInputChange('status', e.target.value)}>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contract Start Date"
                  type="date"
                  value={editForm.contractStart}
                  onChange={(e) => handleEditInputChange('contractStart', e.target.value)}
                />
                <Input
                  label="Contract End Date"
                  type="date"
                  value={editForm.contractEnd}
                  onChange={(e) => handleEditInputChange('contractEnd', e.target.value)}
                />
              </div>

              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mt-6">
                Facility Admin Account
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={editForm.adminFirstName}
                  onChange={(e) => handleEditInputChange('adminFirstName', e.target.value)}
                />
                <Input
                  label="Last Name"
                  value={editForm.adminLastName}
                  onChange={(e) => handleEditInputChange('adminLastName', e.target.value)}
                />
              </div>
              <Input
                label="Admin Email"
                type="email"
                value={editForm.adminEmail}
                onChange={(e) => handleEditInputChange('adminEmail', e.target.value)}
                placeholder="Enter facility admin email"
              />
              <Input
                label="New Admin Password (optional)"
                type="password"
                value={editForm.adminPassword || ''}
                onChange={(e) => handleEditInputChange('adminPassword', e.target.value)}
                placeholder="Leave blank to keep current password"
              />
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-full sm:w-auto"
                  disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateFacility} className="w-full sm:w-auto" isLoading={isSaving}>
                  Save Changes
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </Card>
    </div>);

};