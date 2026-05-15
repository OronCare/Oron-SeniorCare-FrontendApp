import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Filter, Plus, Upload, Network, Eye, Edit2 } from "lucide-react";
import { Card, Button, Input } from "../../components/UI";
import { Resident, Branch } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import SmartTable from "../../shared/Table";
import {
    Reidencecolumns,
    Residenceactions,
    StaffResidenceactions,
} from "../../shared/TableColumns";
import { BulkUploadModal } from "../../components/BulkUploadModal";
import {
    useGetBranchesPaginatedQuery,
    useGetResidentsPaginatedQuery,
} from "../../store/api/oronApi";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../utils/apiMessage";
import TableSkeleton from "../skeletons/TableSkeleton";
import { Pagination } from "../Pagination";
import { RefreshButton } from "../refresh/Refresh.tsx";

const PAGE_SIZE = 10;

const Residents = () => {
    const { user, token } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const role = user?.role;
    const isFacilityAdmin = role === "facility_admin";

    const errorToastShown = useRef(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [branchFilter, setBranchFilter] = useState("All");
    const [page, setPage] = useState(1);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const skipResidents = !import.meta.env.VITE_API_URL || !token;
    const {
        data: residentsData,
        isLoading: residentsLoading,
        isFetching: residentsFetching,
        isError: residentsError,
        error: residentsErr,
        refetch: refetchResidents,
    } = useGetResidentsPaginatedQuery(
        {
            page,
            limit: PAGE_SIZE,
            search: debouncedSearch,
            status: statusFilter,
            branchId:
                isFacilityAdmin && branchFilter !== "All" ? branchFilter : undefined,
        },
        { skip: skipResidents },
    );

    const { data: branchesData } = useGetBranchesPaginatedQuery(
        { page: 1, limit: 500 },
        { skip: role !== "facility_admin" },
    );

    const residents = residentsData?.data ?? [];
    const total = residentsData?.total ?? 0;
    const totalPages =
        residentsData?.totalPages ?? Math.max(1, Math.ceil(total / PAGE_SIZE));
    const loading = residentsLoading || residentsFetching;
    const error = residentsError
        ? getApiErrorMessage(residentsErr, "Failed to load residents")
        : skipResidents
          ? "Unable to load residents. Missing API configuration or authentication."
          : null;
    const branches = branchesData?.data ?? [];

    useEffect(() => {
        if (!residentsError) {
            errorToastShown.current = false;
            return;
        }
        if (errorToastShown.current) return;
        errorToastShown.current = true;
        toast.error(getApiErrorMessage(residentsErr, "Failed to load residents"));
    }, [residentsError, residentsErr, toast]);

    useEffect(() => {
        if (totalPages > 0 && page > totalPages) {
            setPage(totalPages);
        }
    }, [page, totalPages]);

    const branchOptions = useMemo(() => {
        if (branches.length > 0) {
            return branches.filter((branch) => branch.facilityId === user?.facilityId);
        }
        return [];
    }, [branches, user?.facilityId]);

    const safePage = Math.min(Math.max(page, 1), totalPages);
    const showingFrom = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
    const showingTo = Math.min(safePage * PAGE_SIZE, total);
    const isAdmin = role === "admin";
    const isStaff = role === "staff";
    const actions = isStaff ? StaffResidenceactions : Residenceactions;

    const finalActions = useMemo(() => {
        // Override for facility_admin
        if (isFacilityAdmin) {
            return [
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
        }
        if (isStaff) {
            return [
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
        return actions;
    }, [actions, isFacilityAdmin, isStaff]);

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




    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 shrink">
                    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    <p className="text-sm text-slate-500 mt-1">{description}</p>
                </div>


                {/* ACTION BUTTONS */}

                <div className="flex w-full min-w-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
                    {(isAdmin || isFacilityAdmin) && (
                        <>
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
                        </>
                    )}
                    <RefreshButton
                        onRefresh={() => void refetchResidents()}
                        isLoading={loading}
                    />
                </div>
            </div>

            {error && (
                <Card className="border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </Card>
            )}

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
                                    onChange={(e) => {
                                        setBranchFilter(e.target.value);
                                        setPage(1);
                                    }}
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
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(1);
                                }}
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

                {/* TABLE */}

                {loading ? (
                    <TableSkeleton
                        rows={PAGE_SIZE}
                        columns={Reidencecolumns.map((column) => column.label)}
                    />
                ) : total === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-slate-400 mb-2">
                            <Search className="h-12 w-12 mx-auto" />
                        </div>

                        <p className="text-lg font-medium text-slate-900">
                            No residents found
                        </p>

                        <p className="text-sm mt-1 text-slate-500">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <SmartTable
                        data={residents}
                        columns={Reidencecolumns}
                        actions={finalActions}
                    />
                )}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-sm text-slate-600">
                    <p>
                        Showing <span className="font-medium text-slate-900">{showingFrom}</span> to{' '}
                        <span className="font-medium text-slate-900">{showingTo}</span> of{' '}
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


            {/* BULK UPLOAD (only admin + facility admin) */}
            {!isStaff && (
                <BulkUploadModal
                    isOpen={isBulkUploadOpen}
                    onClose={() => setIsBulkUploadOpen(false)}
                    sampleCsvData={[
                        "firstName,lastName,dob,gender,room,status,branchId,facilityId",
                        "John,Doe,1940-01-01,Male,101,InPatient,BRANCH_ID,FACILITY_ID",
                    ].join("\n")}
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