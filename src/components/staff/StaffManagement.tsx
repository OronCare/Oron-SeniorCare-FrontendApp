// pages/Staff/StaffPage.tsx

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Eye,
  Shield,
  Lock,
  Filter,
} from "lucide-react";

import { Card, Button, Input, Modal } from "../../components/UI";
import { StaffMember } from "../../types";
import { useAuth } from "../../context/AuthContext";
import SmartTable from "../../shared/Table";
import { Reidencecolumns, StaffColumns, StaffColumnsForFacilityAdmin } from "../../shared/TableColumns";
import { staffService } from "../../services/staffService";
import { branchService } from "../../services/branchService";
import { Branch } from "../../types";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/apiMessage";
import TableSkeleton from "../skeletons/TableSkeleton";
import { Pagination } from "../Pagination";
import { Link } from "react-router-dom";
import { RefreshButton } from "../refresh/Refresh";

const PAGE_SIZE = 10;

const StaffPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const isFacilityAdmin = user?.role === "facility_admin";

  // ---------------- STATE ----------------
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] =
    useState<StaffMember | null>(null);
  const permissionOptions = useMemo(
    () => [
      "View Residents",
      "Edit Vitals",
      "Manage Care Plans",
      "View Reports",
      "Manage Tasks",
    ],
    [],
  );

  const [editForm, setEditForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    role: "Caregiver" as StaffMember["role"],
    status: "Active" as StaffMember["status"],
    permissions: [] as string[],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBranches = useCallback(async () => {
    if (!isFacilityAdmin) return;
    try {
      const result = await branchService.getBranches({ page: 1, limit: 500 });
      const facilityBranches = result.data.filter(
        (branch) => branch.facilityId === user?.facilityId,
      );
      setBranches(facilityBranches);
    } catch (err) {
      console.warn("Unable to fetch branch list for filters", err);
    }
  }, [isFacilityAdmin, user?.facilityId]);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await staffService.getStaff({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        branchId:
          isFacilityAdmin && branchFilter !== "All" ? branchFilter : undefined,
      });
      setStaffList(result.data);
      setTotal(result.total);
      if (result.totalPages > 0 && page > result.totalPages) {
        setPage(result.totalPages);
      }
    } catch (err) {
      const message = getApiErrorMessage(err, "Failed to load staff data");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [branchFilter, debouncedSearch, isFacilityAdmin, page, toast]);

  const fetchData = useCallback(async () => {
    await Promise.all([fetchStaff(), fetchBranches()]);
  }, [fetchBranches, fetchStaff]);

  useEffect(() => {
    void fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const showingFrom = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(safePage * PAGE_SIZE, total);

  // ---------------- ACTIONS ----------------
  const actions = useMemo(
    () => [
      {
        render: (staff: StaffMember) => (
          <Link to={`${isFacilityAdmin ? "/facility-admin" : "/admin"}/staff/${staff.id}`}>
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primarySoft"
              title="View staff"
              aria-label="View staff"
            >
              <Eye className="h-4 w-4" />
            </span>
          </Link>
        ),
      },
      {
        render: (staff: StaffMember) => (
          <Link to={`${isFacilityAdmin ? "/facility-admin" : "/admin"}/staff/${staff.id}/edit`}>
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-fg shadow-sm transition-colors hover:bg-primarySoft"
              title="Edit staff"
              aria-label="Edit staff"
            >
              <Edit2 className="h-4 w-4" />
            </span>
          </Link>
        ),
      },
    ],
    [isFacilityAdmin],
  );

  const staffColumnsConfig = useMemo(() => {
    return isFacilityAdmin
      ? StaffColumnsForFacilityAdmin(branches)
      : StaffColumns;
  }, [branches, isFacilityAdmin]);

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
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 shrink">
          <h1 className="text-2xl font-bold">
            {isFacilityAdmin ? "Facility Staff" : "Staff Management"}
          </h1>
          <p className="text-sm text-slate-500">
            {isFacilityAdmin
              ? "Manage staff across all branches"
              : "Manage facility staff, roles, and permissions for your branch."}
          </p>
        </div>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        <Link to={`${isFacilityAdmin ? "/facility-admin" : "/admin"}/staff/new`}>
          <Button icon={Plus}>Add Staff Member</Button>
        </Link>
        <RefreshButton onRefresh={fetchData}/>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* TABLE */}
      <Card noPadding>
        <div className="p-5 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="w-full sm:w-72">
          <Input
            placeholder="Search..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          </div>

          {/* ✅ Branch filter ONLY for facility admin */}
          {isFacilityAdmin && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                <Filter className="h-4 w-4" />
              <select
                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* TABLE */}

{loading ? (
    <TableSkeleton
        rows={PAGE_SIZE}
        columns={StaffColumns.map((column) => column.label)}
    />
) : total === 0 ? (
    <div className="p-8 text-center">
        <div className="text-slate-400 mb-2">
            <Search className="h-12 w-12 mx-auto" />
        </div>

        <p className="text-lg font-medium text-slate-900">
            No staff members found
        </p>

        <p className="text-sm mt-1 text-slate-500">
            Try adjusting your search or filters
        </p>
    </div>
) : (
    <SmartTable
        data={staffList}
        columns={staffColumnsConfig}
        actions={actions}
    />
)}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
          <p>
            Showing <span className="font-medium text-slate-900">{showingFrom}</span> to{" "}
            <span className="font-medium text-slate-900">{showingTo}</span> of{" "}
            <span className="font-medium text-slate-900">{total}</span> results
          </p>
          <Pagination
            page={safePage}
            totalItems={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </Card>
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