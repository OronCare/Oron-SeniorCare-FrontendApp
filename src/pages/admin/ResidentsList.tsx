import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  Upload,
  MoreHorizontal,
  Activity, 
  Eye} from
'lucide-react';
import { Card, Button, Badge, Input } from '../../components/UI';
import { mockResidents } from '../../mockData';
import { getFullName } from '../../types';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BulkUploadModal } from '../../components/BulkUploadModal';
import SmartTable from '../../shared/Table';
import { Reidencecolumns, Residenceactions, } from '../../shared/TableColumns';
export const ResidentsList = () => {
  const { user } = useAuth();
  const branchId = user?.branchId || 'b1';
  const myResidents = mockResidents.filter((r) => r.branchId === branchId);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const filteredResidents = myResidents.filter((resident) => {
    const fullName = getFullName(resident).toLowerCase();
    const matchesSearch =
    fullName.includes(searchTerm.toLowerCase()) ||
    resident.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
    statusFilter === 'All' || resident.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-2xl font-bold text-slate-900">Residents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage resident profiles and care data for your branch
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={Upload}
            onClick={() => setIsBulkUploadOpen(true)}>
            
            Bulk Upload
          </Button>
          <Link to="/admin/residents/new">
            <Button icon={Plus}>Add Resident</Button>
          </Link>
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
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
      </Card>

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        sampleCsvData="firstName,middleName,lastName,dob,gender,room,status,allergies,primaryDiagnosis,emergencyContactFirstName,emergencyContactLastName,emergencyContactPhone,emergencyContactRelation&#10;John,,Doe,1940-01-15,Male,101A,InPatient,Penicillin,Hypertension,Jane,Doe,(555)123-4567,Daughter"
        onUpload={(data) => {
          console.log('Uploaded data:', data);
          setIsBulkUploadOpen(false);
        }} />
      
    </div>);

};