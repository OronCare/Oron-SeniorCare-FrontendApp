import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Phone,
  User,
  Mail,
  FileText,
  Download,
  Trash2,
  ShieldAlert,
  ArrowLeft,
  Activity,
  Network,
  Users,
  Plus,
  Upload,
  Eye
} from
  'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../../components/UI';
import { mockFacilities, mockBranches, mockAuditLogs } from '../../mockData';
import { Facility } from '../../types';

export const FacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [facilities, setFacilities] = useState<Facility | undefined>();

  const facility = mockFacilities.find((f) => f.id === id) || mockFacilities[0];
  const facilityBranches = mockBranches.filter(
    (b) => b.facilityId === facility.id
  );
  const facilityLogs = mockAuditLogs.
    filter((log) => log.facilityId === facility.id).
    slice(0, 5);

  const handleRevokeAccess = () => {
    setIsRevokeModalOpen(false);
    navigate('/owner/facilities');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-2">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/owner/facilities"
            className="p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {facility.name}
              </h1>
              <Badge
                variant={
                  facility.status === 'Active' ?
                    'success' :
                    facility.status === 'Pending' ?
                      'warning' :
                      'danger'
                }>
                {facility.status}
              </Badge>
              <Badge variant="default" className="hidden sm:inline-flex">
                {facility.type}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditModalOpen(true);
              setFacilities(facility);
            }}
            className="w-full sm:w-auto text-sm">
            Edit Details
          </Button>
          <Button
            variant="danger"
            icon={ShieldAlert}
            onClick={() => setIsRevokeModalOpen(true)}
            className="w-full sm:w-auto text-sm">
            Revoke Access
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Details & Branches */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
              Facility Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Phone Number
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5 break-words">
                      {facility.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">Email</p>
                    <p className="text-sm text-slate-900 mt-0.5 break-words">
                      {facility.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Facility Admin
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5 break-words">
                      {facility.facilityAdminName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-500 font-medium">
                      Facility Type
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {facility.type}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Branches List */}
          <Card noPadding>
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Network className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500" />
                Facility Branches
              </h2>
              <Button
                size="sm"
                variant="outline"
                icon={Plus}
                onClick={() => setIsAddBranchModalOpen(true)}
                className="w-full sm:w-auto">
                Add Branch
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-3 sm:px-5 py-3 font-medium">Branch Name</th>
                    <th className="px-3 sm:px-5 py-3 font-medium">Status</th>
                    <th className="px-3 sm:px-5 py-3 font-medium hidden sm:table-cell">Utilization</th>
                    <th className="px-3 sm:px-5 py-3 font-medium">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilityBranches.map((branch) => {
                    const usagePercent = Math.round(
                      branch.currentResidents / branch.residentLimit * 100
                    );
                    return (
                      <tr key={branch.id} className="hover:bg-slate-50/50">
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <p className="font-medium text-slate-900 text-sm">
                            {branch.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate max-w-[150px] sm:max-w-none">
                            {branch.address}
                          </p>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <Badge
                            variant={
                              branch.status === 'Active' ?
                                'success' :
                                branch.status === 'Pending' ?
                                  'warning' :
                                  'danger'
                            }>
                            {branch.status}
                          </Badge>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2 max-w-[80px]">
                              <div
                                className={`h-2 rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
                                style={{
                                  width: `${usagePercent}%`
                                }}>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                              {branch.currentResidents}/{branch.residentLimit}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-600 text-sm">
                          {branch.branchAdminName}
                        </td>
                      </tr>
                    );
                  })}
                  {facilityBranches.length === 0 &&
                    <tr>
                      <td colSpan={4} className="px-3 sm:px-5 py-6 sm:py-8 text-center text-slate-500">
                        No branches added yet.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </Card>

          <Card noPadding>
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                Contract Documents
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-3 sm:px-5 py-3 font-medium">Document Name</th>
                    <th className="px-3 sm:px-5 py-3 font-medium hidden sm:table-cell">Upload Date</th>
                    <th className="px-3 sm:px-5 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-3 sm:px-5 py-3 sm:py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-brand-500 shrink-0" />
                        <span className="font-medium text-slate-900 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                          Master_Service_Agreement_2025.pdf
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-slate-500 text-xs sm:text-sm hidden sm:table-cell">
                      Jan 1, 2025
                    </td>
                    <td className="px-3 sm:px-5 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button variant="ghost" size="sm" icon={Download} className="text-xs sm:text-sm">
                          Download
                        </Button>
                        <button className="p-1 sm:p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <Button
                variant="outline"
                size="sm"
                icon={Upload}
                className="w-full text-sm">
                Upload New Document
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats & Logs */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">
              Contract Status
            </h2>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm mb-1 gap-1">
                  <span className="text-slate-500">Contract Period</span>
                  <span className="font-medium text-slate-900 text-xs sm:text-sm">
                    {new Date(facility.contractStart).toLocaleDateString()} -{' '}
                    {new Date(facility.contractEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: '30%' }}>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Total Residents</span>
                  <span className="font-medium text-slate-900">
                    {facility.totalResidents}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card noPadding>
            <div className="p-4 sm:p-5 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                Recent Activity
              </h2>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              <div className="divide-y divide-slate-100">
                {facilityLogs.map((log) =>
                  <div key={log.id} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors">
                    <p className="text-sm font-medium text-slate-900">
                      {log.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 break-words">
                      {log.details}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        {log.user}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {facilityLogs.length === 0 &&
                  <div className="p-4 sm:p-6 text-center text-slate-500 text-sm">
                    No recent activity
                  </div>
                }
              </div>
            </div>
            <div className="p-3 border-t border-slate-100 bg-slate-50 rounded-b-xl text-center">
              <Link
                to="/admin/logs"
                className="text-xs font-medium text-brand-600 hover:text-brand-700">
                View All Logs
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals - Made responsive */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Facility Details">
        <div className="space-y-4">
          <Input label="Facility Name" defaultValue={facility.name} />
          <Input label="Phone Number" type='number' defaultValue={facility.phone} />
          <Input label="Email" type='email' defaultValue={facility.email} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Facility Type
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
              defaultValue={facility.type}>
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

      <Modal
        isOpen={isAddBranchModalOpen}
        onClose={() => setIsAddBranchModalOpen(false)}
        title="Add New Branch">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Branch Details
          </h3>
          <Input label="Branch Name *" placeholder="e.g. Sunrise Downtown" />
          <Input label="Address *" placeholder="123 Main St" />
          <Input label="Phone Number *" placeholder="(555) 000-0000" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Type *
              </label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                <option>Senior Living</option>
                <option>Assisted Living</option>
                <option>Memory Care</option>
              </select>
            </div>
            <Input label="Resident Limit *" type="number" placeholder="100" />
          </div>

          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2 mt-6">
            Branch Admin Account
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name *" placeholder="John" />
            <Input label="Last Name *" placeholder="Doe" />
          </div>
          <Input label="Email *" type="email" placeholder="admin@branch.com" />
          <p className="text-xs text-slate-500">
            An invitation email will be sent to this address to set up their password.
          </p>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsAddBranchModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={() => setIsAddBranchModalOpen(false)} className="w-full sm:w-auto">
              Create Branch
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isRevokeModalOpen}
        onClose={() => setIsRevokeModalOpen(false)}
        title="Revoke Facility Access">
        <div className="space-y-4">
          <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Warning: Destructive Action</p>
              <p className="mt-1">
                Revoking access will immediately lock out all admin and staff
                users for this facility and all its branches. Automated rules
                and alerts will be suspended.
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Are you sure you want to revoke access for{' '}
            <strong>{facility.name}</strong>? This action will be logged.
          </p>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsRevokeModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeAccess} className="w-full sm:w-auto">
              Yes, Revoke Access
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};