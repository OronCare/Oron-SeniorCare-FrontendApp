// pages/Staff/StaffPage.tsx

import React, { useState } from "react";
import {
  Search,
  Plus,
  Network,
  Edit2,
  Shield,
  Mail,
  Lock,
} from "lucide-react";

import { Card, Button, Input, Modal } from "../../components/UI";
import { mockStaffMembers, mockBranches } from "../../mockData";
import { getFullName, StaffMember } from "../../types";
import { useAuth } from "../../context/AuthContext";
import SmartTable from "../../shared/Table";
import { StaffColumns, StaffColumnsForFacilityAdmin } from "../../shared/TableColumns";

const StaffPage = () => {
  const { user } = useAuth();

 

  const isFacilityAdmin = user?.role === "facility_admin";
  const isAdmin = user?.role === "admin";

  

  // ✅ Data filtering based on role
  let staffData: StaffMember[] = [];
  let branches = [];

  if (isFacilityAdmin) {
    const facilityId = user?.facilityId;
    branches = mockBranches.filter((b) => b.facilityId === facilityId);
    const branchIds = branches.map((b) => b.id);

    staffData = mockStaffMembers.filter((s) =>
      branchIds.includes(s.branchId)
    );
  }

  if (isAdmin) {
    const branchId = user?.branchId;
    staffData = mockStaffMembers.filter((s) => s.branchId === branchId);
  }

  // ---------------- STATE ----------------
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] =
    useState<StaffMember | null>(null);

  // ---------------- FILTER ----------------
  const filteredStaff = staffData.filter((staff) => {
    const fullName = getFullName(staff).toLowerCase();

    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch =
      !isFacilityAdmin ||
      branchFilter === "All" ||
      staff.branchId === branchFilter;

    return matchesSearch && matchesBranch;
  });

  // ---------------- ACTIONS ----------------
  const actions = [
    {
      render: (staff: StaffMember) => (
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
      ),
    },
  ];

  
  if (isAdmin) {
    // Don't need branches for admin
    staffData = mockStaffMembers.filter((s) => s.branchId === user?.branchId);
  }

  const staffColumnsConfig = isFacilityAdmin 
  ? StaffColumnsForFacilityAdmin(branches)  // ← Call the function with branches
  : StaffColumns;

  console.log(branches)

  const handleAddStaff = () => {
    setIsAddModalOpen(false);
    // Mock action
  };
  // ---------------- UI ----------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isFacilityAdmin ? "Facility Staff" : "Staff Management"}
          </h1>
          <p className="text-sm text-slate-500">
            {isFacilityAdmin
              ? "Manage staff across all branches"
              : "Manage facility staff, roles, and permissions for your branch."}
          </p>
        </div>

        <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add Staff Member
        </Button>
      </div>

      {/* TABLE */}
      <Card noPadding>
        <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between">
          <Input
            placeholder="Search..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* ✅ Branch filter ONLY for facility admin */}
          {isFacilityAdmin && (
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="All">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <SmartTable
          data={filteredStaff}
          columns={staffColumnsConfig}
          actions={actions}
        />
      </Card>

      {/* ADD MODAL */}
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
          

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Role
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
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


      {/* EDIT MODAL */}
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
    </div>
  );
};

export default StaffPage;