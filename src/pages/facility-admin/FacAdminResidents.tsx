import { useState } from 'react';
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
        <div className='w-full overflow-x-auto'>
        <div className="w-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Resident</th>
                <th className="px-6 py-4 font-semibold">Branch & Room</th>
                <th className="px-6 py-4 font-semibold">Health State</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Vitals</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((resident) => {
                const branch = myBranches.find(
                  (b) => b.id === resident.branchId
                );
                const fullName = getFullName(resident);
                return (
                  <tr
                    key={resident.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() =>
                    window.location.href = `/facility-admin/residents/${resident.id}`
                    }>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium shrink-0 overflow-hidden">
                          <img
                            src={`https://i.pravatar.cc/150?u=${resident.id}`}
                            alt={fullName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerText = `${resident.firstName[0]}${resident.lastName[0]}`;
                            }} />
                          
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {fullName}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {getAge(resident.dob)} yrs • {resident.gender}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 text-xs">
                        {branch?.name}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-1 mt-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
                        Room {resident.room}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getHealthStateColor(resident.healthState)}`}>
                        
                        {resident.healthState}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                        resident.status === 'InPatient' ?
                        'success' :
                        resident.status === 'Hospitalized' ?
                        'warning' :
                        'default'
                        }>
                        
                        {resident.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Activity
                          className={`h-4 w-4 ${resident.lastVitalsDate ? 'text-brand-500' : 'text-slate-300'}`} />
                        
                        <span className="text-xs text-slate-600">
                          {formatDate(resident.lastVitalsDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/facility-admin/residents/${resident.id}`}
                          onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            View Profile
                          </Button>
                        </Link>
                        <button
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                          onClick={(e) => e.stopPropagation()}
                          type="button">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>);

              })}
              {filteredResidents.length === 0 &&
              <tr>
                  <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500">
                  
                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">
                      No residents found
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