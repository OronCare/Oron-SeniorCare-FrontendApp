import React, { useState, createElement } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  MoreHorizontal,
  Activity,
  Network } from
'lucide-react';
import { Card, Button, Badge, Input, Modal } from '../../components/UI';
import { mockResidents, mockBranches } from '../../mockData';
import { getFullName } from '../../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BulkUploadModal } from '../../components/BulkUploadModal';
import { useNavigate } from 'react-router-dom';
import SmartTable from '../../shared/Table';
import { Reidencecolumns, Residenceactions } from '../../shared/TableColumns';
export const FacAdminResidents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const facilityId = user?.facilityId || 'fac1';
  const myBranches = mockBranches.filter((b) => b.facilityId === facilityId);
  const branchIds = myBranches.map((b) => b.id);
  const myResidents = mockResidents.filter((r) =>
  branchIds.includes(r.branchId)
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [branchFilter, setBranchFilter] = useState('All');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isAddResidentOpen, setIsAddResidentOpen] = useState(false);
  const filteredResidents = myResidents.filter((resident) => {
    const fullName = getFullName(resident).toLowerCase();
    const matchesSearch =
    fullName.includes(searchTerm.toLowerCase()) ||
    resident.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
    statusFilter === 'All' || resident.status === statusFilter;
    const matchesBranch =
    branchFilter === 'All' || resident.branchId === branchFilter;
    return matchesSearch && matchesStatus && matchesBranch;
  });
  // Calculate age from DOB
  const getAge = (dob: string) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || m === 0 && today.getDate() < birthDate.getDate()) {
      age--;
    }
    return age;
  };
  // Format date nicely
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }));

  };
  const getHealthStateColor = (state: string) => {
    switch (state) {
      case 'Stable':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Slight Deviation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Concerning Trend':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Early Deterioration':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Active Deterioration':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Recovery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Facility Residents
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            View residents across all branches
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={Upload}
            onClick={() => setIsBulkUploadOpen(true)}>
            
            Bulk Upload
          </Button>
          <Button
            icon={Plus}
            onClick={() => navigate('/facility-admin/residents/new')}>
            
            Add Resident
          </Button>
        </div>
      </div>

      <Card noPadding>
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by name or room number..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <Network className="h-4 w-4" />
              <select
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}>
                
                <option value="All">All Branches</option>
                {myBranches.map((b) =>
                <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                )}
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
              <Filter className="h-4 w-4" />
              <select
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}>
                
                <option value="All">All Statuses</option>
                <option value="InPatient">InPatient</option>
                <option value="Hospitalized">Hospitalized</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
       <SmartTable
          data={filteredResidents}
          columns={Reidencecolumns}
          actions={Residenceactions}
          />

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">1</span> to{' '}
            <span className="font-medium text-slate-900">
              {filteredResidents.length}
            </span>{' '}
            of{' '}
            <span className="font-medium text-slate-900">
              {filteredResidents.length}
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

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        sampleCsvData="firstName,middleName,lastName,dob,gender,room,status,branchId,allergies,primaryDiagnosis,emergencyContactFirstName,emergencyContactLastName,emergencyContactPhone,emergencyContactRelation&#10;John,,Doe,1940-01-15,Male,101A,InPatient,b1,Penicillin,Hypertension,Jane,Doe,(555)123-4567,Daughter"
        onUpload={(data) => {
          console.log('Uploaded data:', data);
          setIsBulkUploadOpen(false);
        }} />
      

      <Modal
        isOpen={isAddResidentOpen}
        onClose={() => setIsAddResidentOpen(false)}
        title="Add New Resident">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select className="w-full rounded-lg border-slate-300 text-sm focus:ring-brand-500 focus:border-brand-500">
              <option value="">Select a branch</option>
              {myBranches.map((b) =>
              <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              )}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="First Name" required />
            <Input label="Middle Name" />
            <Input label="Last Name" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select className="w-full rounded-lg border-slate-300 text-sm focus:ring-brand-500 focus:border-brand-500">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Room Number" required />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select className="w-full rounded-lg border-slate-300 text-sm focus:ring-brand-500 focus:border-brand-500">
                <option>InPatient</option>
                <option>Hospitalized</option>
                <option>Discharged</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Allergies" placeholder="e.g. Penicillin" />
            <Input label="Primary Diagnosis" placeholder="e.g. Hypertension" />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Emergency Contact
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Input label="First Name" required />
                <Input label="Middle Name" />
                <Input label="Last Name" required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Input label="Phone" required />
                <Input label="Email" type="email" />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select className="w-full rounded-lg border-slate-300 text-sm focus:ring-brand-500 focus:border-brand-500">
                    <option>Spouse</option>
                    <option>Child</option>
                    <option>Sibling</option>
                    <option>Friend</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsAddResidentOpen(false)}>
              
              Cancel
            </Button>
            <Button onClick={() => setIsAddResidentOpen(false)}>
              Save Resident
            </Button>
          </div>
        </div>
      </Modal>
    </div>);

};