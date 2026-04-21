import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Shield,
  Mail,
  Activity,
  Network,
  Edit2,
  Lock, 
  Link,
  Eye} from
'lucide-react';
import { Card, Button, Badge, Input, Modal } from '../../components/UI';
import { mockStaffMembers, mockBranches } from '../../mockData';
import { getFullName, StaffMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import SmartTable from '../../shared/Table';
import { StaffColumns } from '../../shared/TableColumns';
export const FacAdminStaff = () => {
  const { user } = useAuth();
  const facilityId = user?.facilityId || 'fac1';
  const myBranches = mockBranches.filter((b) => b.facilityId === facilityId);
  const branchIds = myBranches.map((b) => b.id);
  const myStaff = mockStaffMembers.filter((s) => branchIds.includes(s.branchId));
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [branchFilter, setBranchFilter] = useState('All');
  const filteredStaff = myStaff.filter((staff) => {
    const fullName = getFullName(staff).toLowerCase();
    const matchesSearch =
    fullName.includes(searchTerm.toLowerCase()) ||
    staff.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch =
    branchFilter === 'All' || staff.branchId === branchFilter;
    return matchesSearch && matchesBranch;
  });
  const handleAddStaff = () => {
    setIsAddModalOpen(false);
    // Mock action
  };

  const actions = [
  {
    render: (staff) => (
      <Button
        variant="ghost"
        size="sm"
        icon={Edit2}
        onClick={() => {
          setSelectedStaff(staff);
          setIsEditModalOpen(true);
        }}
      >
        Edit
      </Button>
    )
  },
];
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Facility Staff</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage staff across all your branches.
          </p>
        </div>
        <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add Staff Member
        </Button>
      </div>

      <Card noPadding>
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by name or role..."
              icon={Search}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} />
            
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
          </div>
        </div>

        <SmartTable
          data={filteredStaff} 
          columns={StaffColumns} 
          actions={actions} 
        />
      </Card>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member">
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="First Name" placeholder="Jane" />
            <Input label="Middle Name (Optional)" placeholder="A." />
            <Input label="Last Name" placeholder="Doe" />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@facility.com" />
          

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Branch Assignment
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                {myBranches.map((b) =>
                <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Role
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                <option>Branch Admin</option>
                <option>Caregiver</option>
                <option>Nurse</option>
                <option>Coordinator</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-500" /> Permissions
            </label>
            <div className="space-y-2">
              {[
              'View Residents',
              'Edit Vitals',
              'Manage Care Plans',
              'View Reports',
              'Manage Tasks'].
              map((perm, idx) =>
              <label
                key={idx}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                
                  <input
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  defaultChecked={idx < 2} />
                
                  <span className="text-sm text-slate-700">{perm}</span>
                </label>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-2">
            <Mail className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              An invitation email will be sent to this address to set up their
              password.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Create Account</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Staff Member">
        
        {selectedStaff &&
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
              label="First Name"
              defaultValue={selectedStaff.firstName} />
            
              <Input label="Last Name" defaultValue={selectedStaff.lastName} />
            </div>

            <div className="relative">
              <Input
              label="Email Address"
              type="email"
              defaultValue={selectedStaff.email}
              disabled
              className="bg-slate-100 text-slate-500 cursor-not-allowed pr-10" />
            
              <div
              className="absolute right-3 top-[34px] text-slate-400"
              title="Email cannot be changed">
              
                <Lock className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Role
              </label>
              <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              defaultValue={selectedStaff.role}>
              
                <option>Branch Admin</option>
                <option>Caregiver</option>
                <option>Nurse</option>
                <option>Coordinator</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-500" /> Permissions
              </label>
              <div className="space-y-2">
                {[
              'View Residents',
              'Edit Vitals',
              'Manage Care Plans',
              'View Reports',
              'Manage Tasks'].
              map((perm, idx) =>
              <label
                key={idx}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                
                    <input
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  defaultChecked={selectedStaff.permissions.includes(perm)} />
                
                    <span className="text-sm text-slate-700">{perm}</span>
                  </label>
              )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}>
              
                Cancel
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        }
      </Modal>
    </div>);

};