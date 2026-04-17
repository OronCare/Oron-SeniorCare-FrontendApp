import React, { useState } from 'react';
import { Users, Search, Filter, Activity, ArrowRight } from 'lucide-react';
import { Card, Button, Badge, Input } from '../../components/UI';
import { mockResidents } from '../../mockData';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getFullName } from '../../types';
export const StaffResidents = () => {
  const { user } = useAuth();
  const branchId = user?.branchId;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const branchResidents = mockResidents.filter((r) => r.branchId === branchId);
  const filteredResidents = branchResidents.filter((resident) => {
    const fullName = getFullName(resident).toLowerCase();
    const matchesSearch =
    fullName.includes(searchTerm.toLowerCase()) ||
    resident.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
    statusFilter === 'All' || resident.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
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
        return 'bg-emerald-100 text-emerald-700';
      case 'Slight Deviation':
        return 'bg-yellow-100 text-yellow-700';
      case 'Concerning Trend':
        return 'bg-amber-100 text-amber-700';
      case 'Early Deterioration':
        return 'bg-orange-100 text-orange-700';
      case 'Active Deterioration':
        return 'bg-red-100 text-red-700';
      case 'Recovery':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Residents</h1>
          <p className="text-sm text-slate-500 mt-1">
            View profiles and care data for residents in your branch.
          </p>
        </div>
      </div>

      <Card noPadding>
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

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Resident</th>
                <th className="px-6 py-4 font-semibold">Room</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Health State</th>
                <th className="px-6 py-4 font-semibold">Last Vitals</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.map((resident) =>
              <tr
                key={resident.id}
                className="hover:bg-slate-50/80 transition-colors group">
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium shrink-0 overflow-hidden">
                        <img
                        src={`https://i.pravatar.cc/150?u=${resident.id}`}
                        alt={getFullName(resident)}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerText = `${resident.firstName[0]}${resident.lastName[0]}`;
                        }} />
                      
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getFullName(resident)}
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
                    <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getHealthStateColor(resident.healthState)}`}>
                    
                      {resident.healthState}
                    </span>
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
                    <Link to={`/staff/residents/${resident.id}`}>
                      <Button variant="ghost" size="sm" icon={ArrowRight}>
                        View Profile
                      </Button>
                    </Link>
                  </td>
                </tr>
              )}
              {filteredResidents.length === 0 &&
              <tr>
                  <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-slate-500">
                  
                    <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-lg font-medium text-slate-900">
                      No residents found
                    </p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </Card>
    </div>);

};