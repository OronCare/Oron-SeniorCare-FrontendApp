// pages/Staff/StaffPage.tsx

import { useEffect, useMemo, useState } from "react";
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
import { getFullName, StaffMember } from "../../types";
import { useAuth } from "../../context/AuthContext";
import SmartTable from "../../shared/Table";
import { StaffColumns, StaffColumnsForFacilityAdmin } from "../../shared/TableColumns";
import { staffService } from "../../services/staffService";
import { branchService } from "../../services/branchService";
import { Branch } from "../../types";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/apiMessage";

const StaffPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const isFacilityAdmin = user?.role === "facility_admin";
  const isAdmin = user?.role === "admin";

  // ---------------- STATE ----------------
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] =
    useState<StaffMember | null>(null);
  const permissionOptions = [
    "View Residents",
    "Edit Vitals",
    "Manage Care Plans",
    "View Reports",
    "Manage Tasks",
  ];

  const [addForm, setAddForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    role: "Caregiver" as StaffMember["role"],
    branchId: "",
    permissions: permissionOptions.slice(0, 2),
  });

  const [editForm, setEditForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    role: "Caregiver" as StaffMember["role"],
    status: "Active" as StaffMember["status"],
    permissions: [] as string[],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [staffPayload, branchPayload] = await Promise.all([
          staffService.getAllStaff(),
          isFacilityAdmin ? branchService.getAllBranches() : Promise.resolve([]),
        ]);

        setStaffList(staffPayload);
        if (isFacilityAdmin) {
          const facilityBranches = branchPayload.filter(
            (branch) => branch.facilityId === user?.facilityId
          );
          setBranches(facilityBranches);
          setAddForm((prev) =>
            !prev.branchId && facilityBranches[0]?.id
              ? { ...prev, branchId: facilityBranches[0].id }
              : prev
          );
        }
      } catch (err) {
        const message = getApiErrorMessage(err, "Failed to load staff data");
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isFacilityAdmin, user?.facilityId]);

  const staffData = useMemo(() => {
    if (isFacilityAdmin) {
      const branchIds = branches.map((b) => b.id);
      return staffList.filter((s) => branchIds.includes(s.branchId));
    }
    if (isAdmin) {
      return staffList.filter((s) => s.branchId === user?.branchId);
    }
    return staffList;
  }, [branches, isAdmin, isFacilityAdmin, staffList, user?.branchId]);

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
            handleOpenEdit(staff);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  const staffColumnsConfig = isFacilityAdmin 
  ? StaffColumnsForFacilityAdmin(branches)
  : StaffColumns;

  const handleAddStaff = async () => {
    if (!user?.facilityId) return;
    if (!addForm.firstName || !addForm.lastName || !addForm.email) {
      const message = "Please fill first name, last name, and email.";
      setError(message);
      toast.error(message);
      return;
    }

    const targetBranchId = isAdmin ? user.branchId || "" : addForm.branchId;
    if (!targetBranchId) {
      const message = "Please select a branch.";
      setError(message);
      toast.error(message);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const created = await staffService.createStaff({
        branchId: targetBranchId,
        facilityId: user.facilityId,
        firstName: addForm.firstName.trim(),
        middleName: addForm.middleName.trim() || undefined,
        lastName: addForm.lastName.trim(),
        email: addForm.email.trim(),
        role: addForm.role,
        status: "Active",
        permissions: addForm.permissions,
      });
      setStaffList((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setAddForm((prev) => ({
        ...prev,
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        role: "Caregiver",
        permissions: permissionOptions.slice(0, 2),
      }));
      toast.success("Staff member created successfully.");
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to create staff member");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEditForm({
      firstName: staff.firstName,
      middleName: staff.middleName || "",
      lastName: staff.lastName,
      role: staff.role,
      status: staff.status,
      permissions: staff.permissions || [],
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedStaff) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await staffService.updateStaff(selectedStaff.id, {
        firstName: editForm.firstName.trim(),
        middleName: editForm.middleName.trim() || undefined,
        lastName: editForm.lastName.trim(),
        role: editForm.role,
        status: editForm.status,
        permissions: editForm.permissions,
      });
      setStaffList((prev) =>
        prev.map((staff) => (staff.id === selectedStaff.id ? updated : staff))
      );
      setIsEditModalOpen(false);
      setSelectedStaff(null);
      toast.success("Staff member updated successfully.");
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.status === 404
          ? "Staff update API is not available yet on backend. Add PUT /staff/:id (or PATCH /staff/:id) to enable edit."
          : getApiErrorMessage(err, "Failed to update staff member");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
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
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

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
          data={loading ? [] : filteredStaff}
          columns={staffColumnsConfig}
          actions={actions}
        />
        {loading && (
          <div className="p-4 text-sm text-slate-500">Loading staff...</div>
        )}
      </Card>

      {/* ADD MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff Member">
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="First Name"
              placeholder="Jane"
              value={addForm.firstName}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
            />
            <Input
              label="Middle Name (Optional)"
              placeholder="A."
              value={addForm.middleName}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, middleName: e.target.value }))
              }
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              value={addForm.lastName}
              onChange={(e) =>
                setAddForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="jane@facility.com"
            value={addForm.email}
            onChange={(e) =>
              setAddForm((prev) => ({ ...prev, email: e.target.value }))
            }
          />
          {isFacilityAdmin && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">Branch</label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                value={addForm.branchId}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, branchId: e.target.value }))
                }
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              value={addForm.role}
              onChange={(e) =>
                setAddForm((prev) => ({
                  ...prev,
                  role: e.target.value as StaffMember["role"],
                }))
              }
            >
              <option value="Caregiver">Caregiver</option>
              <option value="Nurse">Nurse</option>
              <option value="Coordinator">Coordinator</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4 text-brand-500" /> Permissions
            </label>
            <div className="space-y-2">
              {permissionOptions.map((perm) =>
              <label
                key={perm}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                
                  <input
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  checked={addForm.permissions.includes(perm)}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      permissions: e.target.checked
                        ? [...prev.permissions, perm]
                        : prev.permissions.filter((p) => p !== perm),
                    }))
                  } />
                
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
            <Button onClick={handleAddStaff}>
              {submitting ? "Creating..." : "Create Account"}
            </Button>
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
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
              } />
            
              <Input
                label="Last Name"
                value={editForm.lastName}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
                }
              />
            </div>

            <div className="relative">
              <Input
              label="Email Address"
              type="email"
              value={selectedStaff.email}
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
              value={editForm.role}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  role: e.target.value as StaffMember["role"],
                }))
              }>
              
                <option value="Caregiver">Caregiver</option>
                <option value="Nurse">Nurse</option>
                <option value="Coordinator">Coordinator</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: e.target.value as StaffMember["status"],
                  }))
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand-500" /> Permissions
              </label>
              <div className="space-y-2">
                {permissionOptions.map((perm) =>
              <label
                key={perm}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                
                    <input
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  checked={editForm.permissions.includes(perm)}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      permissions: e.target.checked
                        ? [...prev.permissions, perm]
                        : prev.permissions.filter((p) => p !== perm),
                    }))
                  } />
                
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
              <Button onClick={handleSaveEdit}>
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        }
      </Modal>
    </div>
  );
};

export default StaffPage;