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
        <div className="w-full overflow-x-auto ">
          <div className="w-[400px] md:w-full  ">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Resident</th>
                <th className="px-6 py-4 font-semibold">Room</th>
                <th className="px-6 py-4 font-semibold">Health State</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Vitals</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((resident) => {
                const fullName = getFullName(resident);
                return (
                  <tr
                    key={resident.id}
                    className="hover:bg-slate-50/80 transition-colors group">
                    
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
                        {resident.room}
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
                      <div className="flex items-center justify-end gap-2  transition-opacity">
                        <Link to={`/admin/residents/${resident.id}`}>
                          <Button variant="ghost" size="sm" icon={Eye}>
                            View 
                          </Button>
                        </Link>
                   
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
        sampleCsvData="firstName,middleName,lastName,dob,gender,room,status,allergies,primaryDiagnosis,emergencyContactFirstName,emergencyContactLastName,emergencyContactPhone,emergencyContactRelation&#10;John,,Doe,1940-01-15,Male,101A,InPatient,Penicillin,Hypertension,Jane,Doe,(555)123-4567,Daughter"
        onUpload={(data) => {
          console.log('Uploaded data:', data);
          setIsBulkUploadOpen(false);
        }} />
      
    </div>);

};