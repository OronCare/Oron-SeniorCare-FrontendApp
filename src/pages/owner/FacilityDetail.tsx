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
  Eye } from
'lucide-react';
import { Card, Button, Badge, Modal, Input } from '../../components/UI';
import { mockFacilities, mockBranches, mockAuditLogs } from '../../mockData';
export const FacilityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const facility = mockFacilities.find((f) => f.id === id) || mockFacilities[0];
  const facilityBranches = mockBranches.filter(
    (b) => b.facilityId === facility.id
  );
  const facilityLogs = mockAuditLogs.
  filter((log) => log.facilityId === facility.id).
  slice(0, 5);
  const handleRevokeAccess = () => {
    // Mock action
    setIsRevokeModalOpen(false);
    navigate('/owner/facilities');
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          to="/owner/facilities"
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
          
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">
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
            <Badge variant="default">{facility.type}</Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edit Details
          </Button>
          <Button
            variant="danger"
            icon={ShieldAlert}
            onClick={() => setIsRevokeModalOpen(true)}>
            
            Revoke Access
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details & Branches */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Facility Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Phone Number
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {facility.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Email</p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {facility.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Facility Admin
                    </p>
                    <p className="text-sm text-slate-900 mt-0.5">
                      {facility.facilityAdminName}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
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
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Network className="h-5 w-5 text-brand-500" />
                Facility Branches
              </h2>
              <Button
                size="sm"
                variant="outline"
                icon={Plus}
                onClick={() => setIsAddBranchModalOpen(true)}>
                
                Add Branch
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 font-medium">Branch Name</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Utilization</th>
                    <th className="px-5 py-3 font-medium">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {facilityBranches.map((branch) => {
                    const usagePercent = Math.round(
                      branch.currentResidents / branch.residentLimit * 100
                    );
                    return (
                      <tr key={branch.id} className="hover:bg-slate-50/50">
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">
                            {branch.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {branch.address}
                          </p>
                        </td>
                        <td className="px-5 py-4">
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
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-slate-200 rounded-full h-2 max-w-[80px]">
                              <div
                                className={`h-2 rounded-full ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 75 ? 'bg-amber-500' : 'bg-brand-500'}`}
                                style={{
                                  width: `${usagePercent}%`
                                }}>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">
                              {branch.currentResidents}/{branch.residentLimit}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {branch.branchAdminName}
                        </td>
                      </tr>);

                  })}
                  {facilityBranches.length === 0 &&
                  <tr>
                      <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-slate-500">
                      
                        No branches added yet.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </Card>

          <Card noPadding>
            <div className="p-5 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">
                Contract Documents
              </h2>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 font-medium">Document Name</th>
                    <th className="px-5 py-3 font-medium">Upload Date</th>
                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-500" />
                        <span className="font-medium text-slate-900">
                          Master_Service_Agreement_2025.pdf
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-500">Jan 1, 2025</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" icon={Download}>
                          Download
                        </Button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <Button
                variant="outline"
                size="sm"
                icon={Upload}
                className="w-full">
                
                Upload New Document
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats & Logs */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Contract Status
            </h2>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Contract Period</span>
                  <span className="font-medium text-slate-900">
                    {new Date(facility.contractStart).toLocaleDateString()} -{' '}
                    {new Date(facility.contractEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{
                      width: '30%'
                    }}>
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
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-400" />
                Recent Activity
              </h2>
            </div>
            <div className="p-0">
              <div className="divide-y divide-slate-100">
                {facilityLogs.map((log) =>
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50 transition-colors">
                  
                    <p className="text-sm font-medium text-slate-900">
                      {log.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
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
                <div className="p-6 text-center text-slate-500 text-sm">
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Facility Details">
        
        <div className="space-y-4">
          <Input label="Facility Name" defaultValue={facility.name} />
          <Input label="Phone Number" defaultValue={facility.phone} />
          <Input label="Email" defaultValue={facility.email} />
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
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>
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
          <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name *" placeholder="John" />
            <Input label="Last Name *" placeholder="Doe" />
          </div>
          <Input label="Email *" type="email" placeholder="admin@branch.com" />
          <p className="text-xs text-slate-500">
            An invitation email will be sent to this address to set up their
            password.
          </p>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAddBranchModalOpen(false)}>
              
              Cancel
            </Button>
            <Button onClick={() => setIsAddBranchModalOpen(false)}>
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
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex gap-3">
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
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsRevokeModalOpen(false)}>
              
              Cancel
            </Button>
            <Button variant="danger" onClick={handleRevokeAccess}>
              Yes, Revoke Access
            </Button>
          </div>
        </div>
      </Modal>
    </div>);

};