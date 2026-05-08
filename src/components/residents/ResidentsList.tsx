import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, Plus, Upload, Network, Eye, Edit2 } from "lucide-react";
import { Card, Button, Input } from "../../components/UI";
import { getFullName, Resident, Branch } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import SmartTable from "../../shared/Table";
import {
    Reidencecolumns,
    Residenceactions,
    StaffResidenceactions,
} from "../../shared/TableColumns";
import { BulkUploadModal } from "../../components/BulkUploadModal";
import { residentService } from "../../services/residentService";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/apiMessage";
import TableSkeleton from "../skeletons/TableSkeleton";

const Residents = () => {
    const { user, token } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const role = user?.role;

    const [residents, setResidents] = useState<Resident[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [branchFilter, setBranchFilter] = useState("All");
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

    useEffect(() => {
        const apiBase = import.meta.env.VITE_API_URL;
        if (!apiBase || !token) {
            const message = 'Unable to load residents. Missing API configuration or authentication.';
            setError(message);
            toast.error(message);
            setLoading(false);
            return;
        }

        const fetchResidents = async () => {
            setLoading(true);
            setError(null);
            try {
                const payload = await residentService.getAllResidents();
                setResidents(payload);
            } catch (err) {
                const message = getApiErrorMessage(err, 'Failed to load residents');
                setError(message);
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        const fetchBranches = async () => {
            if (role !== "facility_admin") return;
            try {
                const response = await axios.get<Branch[]>(`${import.meta.env.VITE_API_URL}/branches`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBranches(response.data);
            } catch (err) {
                console.warn('Unable to fetch branch list for filters', err);
            }
        };

        fetchResidents();
        fetchBranches();
    }, [role, token]);

    const branchOptions = useMemo(() => {
        if (branches.length > 0) {
            return branches.filter((branch) => branch.facilityId === user?.facilityId);
        }

        return Array.from(new Set(residents.map((resident) => resident.branchId))).map((id) => ({
            id,
            facilityId: user?.facilityId || '',
            name: id,
            address: '',
            phone: '',
            type: '',
            status: '',
            residentLimit: 0,
            currentResidents: 0,
        } as Branch));
    }, [branches, residents, user?.facilityId]);

    const isFacilityAdmin = role === "facility_admin";
    const isAdmin = role === "admin";
    const isStaff = role === "staff";
    const actions = isStaff ? StaffResidenceactions : Residenceactions;

    // Override for facility_admin
    let finalActions = actions;
    if (isFacilityAdmin) {
        finalActions = [
            {
                render: (resident: Resident) => (
                    <Link to={`/facility-admin/residents/${resident.id}`}>
                        <span
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primarySoft"
                            title="View resident"
                            aria-label="View resident"
                        >
                            <Eye className="h-4 w-4" />
                        </span>
                    </Link>
                )
            },
            {
                render: (resident: Resident) => (
                    <Link to={`/facility-admin/residents/${resident.id}/edit`}>
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-fg shadow-sm transition-colors hover:bg-primarySoft"
                        title="Edit resident"
                        aria-label="Edit resident"
                      >
                        <Edit2 className="h-4 w-4" />
                      </span>
                    </Link>
                  )
            }
        ];
    } else if (isStaff) {
        finalActions = [
            {
                render: (resident: Resident) => (
                    <Link to={`/staff/residents/${resident.id}`}>
                        <span
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-primary shadow-sm transition-colors hover:bg-primarySoft"
                            title="View resident"
                            aria-label="View resident"
                        >
                            <Eye className="h-4 w-4" />
                        </span>
                    </Link>
                )
            }
        ];
    }
    // 🔹 Filtering
    const filteredResidents = residents.filter((resident) => {
        const fullName = getFullName(resident).toLowerCase();

        const matchesSearch =
            fullName.includes(searchTerm.toLowerCase()) ||
            resident.room.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "All" || resident.status === statusFilter;

        const matchesBranch =
            role !== "facility_admin" ||
            branchFilter === "All" ||
            resident.branchId === branchFilter;

        return matchesSearch && matchesStatus && matchesBranch;
    });


    // 🔹 Role-based config


    const title =
        role === "facility_admin"
            ? "Facility Residents"
            : role === "staff"
                ? "My Residents"
                : "Residents";

    const description =
        role === "facility_admin"
            ? "View residents across all branches"
            : role === "staff"
                ? "View residents in your branch"
                : "Manage resident profiles";

    if (loading) {
        return (
            <TableSkeleton
                title={title}
                description={description}
                showAddButton={isAdmin || isFacilityAdmin}
                showFilters={!isStaff}
                rows={5}
                columns={6}
            />
        );
    }


    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    <p className="text-sm text-slate-500 mt-1">{description}</p>
                </div>

                {/* ACTION BUTTONS */}

                {(isAdmin || isFacilityAdmin) && (
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            icon={Upload}
                            onClick={() => setIsBulkUploadOpen(true)}
                        >
                            Bulk Upload
                        </Button>

                        <Button
                            icon={Plus}
                            onClick={() => {
                                // Build the correct path based on role
                                const basePath = role === "admin" ? "/admin" : "/facility-admin";
                                navigate(`${basePath}/residents/new`);
                            }}
                        >
                            Add Resident
                        </Button>
                    </div>
                )}
            </div>

            <Card noPadding>
                {/* TOOLBAR */}
                <div className="p-5 border-b flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
                    <div className="w-full sm:w-80">
                        <Input
                            placeholder="Search by name or room..."
                            icon={Search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {/* Branch filter ONLY for facility admin */}
                        {isFacilityAdmin && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                                <Network className="h-4 w-4" />
                                <select
                                    className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
                                    value={branchFilter}
                                    onChange={(e) => setBranchFilter(e.target.value)}
                                >
                                    <option value="All">All Branches</option>
                                    {branchOptions.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name || branch.id}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Status filter */}
                        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
                            <Filter className="h-4 w-4" />
                            <select
                                className="bg-transparent border-none focus:ring-0 p-0 text-sm font-medium cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="InPatient">InPatient</option>
                                <option value="Hospitalized">Hospitalized</option>
                                <option value="Discharged">Discharged</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* TABLE */}

                <SmartTable
                    data={filteredResidents}
                    columns={Reidencecolumns}
                    actions={finalActions}
                />
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
                    <p>
                        Showing <span className="font-medium text-slate-900">1</span> to{' '}
                        <span className="font-medium text-slate-900">{filteredResidents.length}</span>{' '}
                        of{' '}
                        <span className="font-medium text-slate-900">{filteredResidents.length}</span>{' '}
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


            {/* BULK UPLOAD (only admin + facility admin) */}
            {!isStaff && (
                <BulkUploadModal
                    isOpen={isBulkUploadOpen}
                    onClose={() => setIsBulkUploadOpen(false)}
                    onUpload={(data) => {
                        console.log(data);
                        setIsBulkUploadOpen(false);
                    }}
                />
            )}
        </div>
  );
};
export default Residents;