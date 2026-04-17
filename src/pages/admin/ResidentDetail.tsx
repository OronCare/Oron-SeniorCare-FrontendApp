import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  HeartPulse,
  ClipboardList,
  Pill,
  MessageSquare,
  Activity,
  Calendar,
  Plus,
  Edit2,
  Save,
  CheckCircle2 } from
'lucide-react';
import { Card, Button, Badge, Input, Modal } from '../../components/UI';
import {
  mockResidents,
  mockVitals,
  mockCarePlans,
  mockNotes,
  mockTasks,
  mockStaffMembers } from
'../../mockData';
import { getFullName } from '../../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend } from
'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
export const ResidentDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('careplan');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('Observation');
  const [isLoggingVitals, setIsLoggingVitals] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const resident = mockResidents.find((r) => r.id === id) || mockResidents[0];
  const fullName = getFullName(resident);
  const vitals = mockVitals.
  filter((v) => v.residentId === resident.id).
  sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const carePlan = mockCarePlans.find((cp) => cp.residentId === resident.id);
  const notes = mockNotes.
  filter((n) => n.residentId === resident.id).
  sort(
    (a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const residentTasks = mockTasks.filter((t) => t.residentId === resident.id);
  // Calculate age
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
  // Format vitals for chart (reverse to show chronological order left to right)
  const chartData = [...vitals].reverse().map((v) => ({
    date: new Date(v.date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric'
    }),
    systolic: v.systolicBP,
    diastolic: v.diastolicBP,
    heartRate: v.heartRate
  }));
  const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: User
  },
  {
    id: 'vitals',
    label: 'Vitals History',
    icon: Activity
  },
  {
    id: 'careplan',
    label: 'Care Plan',
    icon: ClipboardList
  },
  {
    id: 'medications',
    label: 'Medications',
    icon: Pill
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckCircle2
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: MessageSquare
  }];

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
  const getTaskCategoryColor = (category: string) => {
    switch (category) {
      case 'Medication':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Bathing':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Vitals':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Therapy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Meal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'Clinical':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Observation':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <Link
          to={`/${user?.role === 'owner' ? 'owner/facilities' : user?.role === 'facility_admin' ? 'facility-admin/residents' : user?.role === 'staff' ? 'staff/residents' : 'admin/residents'}`}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
          
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xl border-2 border-white shadow-sm overflow-hidden">
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
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
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getHealthStateColor(resident.healthState)}`}>
                
                {resident.healthState}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              {getAge(resident.dob)} years old • {resident.gender} • Room{' '}
              {resident.room}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            icon={Edit2}
            onClick={() => setIsEditProfileOpen(true)}>
            
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex gap-6 min-w-max">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
            
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' &&
          <motion.div
            key="overview"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-slate-400" /> Personal
                    Information
                  </h2>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Date of Birth
                      </p>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {new Date(resident.dob).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Admission Date
                      </p>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {new Date(resident.admissionDate).toLocaleDateString()}
                      </p>
                    </div>
                    {resident.weight &&
                  <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Weight
                        </p>
                        <p className="text-sm text-slate-900 mt-0.5">
                          {resident.weight} lbs
                        </p>
                      </div>
                  }
                    {resident.height &&
                  <div>
                        <p className="text-xs text-slate-500 font-medium">
                          Height
                        </p>
                        <p className="text-sm text-slate-900 mt-0.5">
                          {resident.height}
                        </p>
                      </div>
                  }
                  </div>
                </Card>

                <Card>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-slate-400" /> Medical
                    Summary
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Primary Diagnosis
                      </p>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {resident.primaryDiagnosis || 'None recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Allergies
                      </p>
                      <p className="text-sm text-red-600 font-medium mt-0.5">
                        {resident.allergies || 'No known allergies'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">
                        Medical History
                      </p>
                      <p className="text-sm text-slate-900 mt-0.5">
                        {resident.medicalHistory}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-slate-400" /> Emergency
                    Contacts
                  </h2>
                  <div className="space-y-3">
                    {resident.emergencyContacts.map((contact) =>
                  <div
                    key={contact.id}
                    className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center justify-between">
                    
                        <div>
                          <p className="font-medium text-slate-900">
                            {getFullName(contact as any)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {contact.relation}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            {contact.phone}
                          </p>
                        </div>
                      </div>
                  )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-brand-50 border-brand-100">
                  <h2 className="text-sm font-semibold text-brand-900 mb-4 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-600" /> Latest
                    Vitals
                  </h2>
                  {vitals.length > 0 ?
                <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-brand-700">
                          Blood Pressure
                        </span>
                        <span className="text-sm font-semibold text-brand-900">
                          {vitals[0].systolicBP}/{vitals[0].diastolicBP}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-brand-700">
                          Heart Rate
                        </span>
                        <span className="text-sm font-semibold text-brand-900">
                          {vitals[0].heartRate} bpm
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-brand-700">SpO2</span>
                        <span className="text-sm font-semibold text-brand-900">
                          {vitals[0].oxygenSaturation}%
                        </span>
                      </div>
                      <div className="pt-3 border-t border-brand-200/50 text-right">
                        <span className="text-[10px] text-brand-600">
                          Recorded{' '}
                          {new Date(vitals[0].date).toLocaleDateString()}
                        </span>
                      </div>
                    </div> :

                <p className="text-sm text-brand-700">
                      No vitals recorded yet.
                    </p>
                }
                </Card>
              </div>
            </motion.div>
          }

          {activeTab === 'vitals' &&
          <motion.div
            key="vitals"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            className="space-y-6">
            
              {isLoggingVitals ?
            <Card className="border-brand-200 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-brand-500" /> Record
                      New Vitals
                    </h2>
                    <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLoggingVitals(false)}>
                  
                      Cancel
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Blood Pressure
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                      type="number"
                      placeholder="120"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />
                    
                        <span className="text-slate-400 text-lg">/</span>
                        <input
                      type="number"
                      placeholder="80"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />
                    
                        <span className="text-xs text-slate-500 ml-1">
                          mmHg
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Heart Rate
                      </label>
                      <div className="relative">
                        <input
                      type="number"
                      placeholder="72"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-12" />
                    
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          bpm
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Temperature
                      </label>
                      <div className="relative">
                        <input
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-10" />
                    
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          °F
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Oxygen Saturation (SpO2)
                      </label>
                      <div className="relative">
                        <input
                      type="number"
                      placeholder="98"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 pr-8" />
                    
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                  icon={Save}
                  onClick={() => setIsLoggingVitals(false)}>
                  
                      Save Vitals
                    </Button>
                  </div>
                </Card> :

            <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Vitals Trends
                    </h2>
                    <div className="flex gap-3">
                      <select className="text-sm border-slate-200 rounded-md">
                        <option>Last 7 Days</option>
                        <option>Last 30 Days</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 20,
                      bottom: 5,
                      left: 0
                    }}>
                    
                        <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0" />
                    
                        <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#64748B',
                        fontSize: 12
                      }} />
                    
                        <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#64748B',
                        fontSize: 12
                      }}
                      domain={['dataMin - 10', 'dataMax + 10']} />
                    
                        <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#64748B',
                        fontSize: 12
                      }}
                      domain={['dataMin - 10', 'dataMax + 10']} />
                    
                        <Tooltip
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }} />
                    
                        <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle" />
                    
                        <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="systolic"
                      name="Systolic BP"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{
                        r: 4
                      }}
                      activeDot={{
                        r: 6
                      }} />
                    
                        <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="diastolic"
                      name="Diastolic BP"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{
                        r: 4
                      }}
                      activeDot={{
                        r: 6
                      }} />
                    
                        <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="heartRate"
                      name="Heart Rate"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{
                        r: 4
                      }}
                      activeDot={{
                        r: 6
                      }} />
                    
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
            }

              <Card noPadding>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Vitals Log
                  </h2>
                  <Button
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsLoggingVitals(true)}>
                  
                    Log Vitals
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3 font-medium">Date & Time</th>
                        <th className="px-5 py-3 font-medium">BP</th>
                        <th className="px-5 py-3 font-medium">HR</th>
                        <th className="px-5 py-3 font-medium">Temp</th>
                        <th className="px-5 py-3 font-medium">SpO2</th>
                        <th className="px-5 py-3 font-medium">Recorded By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vitals.map((v) =>
                    <tr key={v.id} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <p className="font-medium text-slate-900">
                              {new Date(v.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(v.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                            </p>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {v.systolicBP}/{v.diastolicBP}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {v.heartRate}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {v.temperature}°F
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {v.oxygenSaturation}%
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {v.recordedBy}
                          </td>
                        </tr>
                    )}
                      {vitals.length === 0 &&
                    <tr>
                          <td
                        colSpan={6}
                        className="px-5 py-8 text-center text-slate-500">
                        
                            No vitals recorded yet.
                          </td>
                        </tr>
                    }
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          }

          {activeTab === 'careplan' &&
          <motion.div
            key="careplan"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}>
            
              {carePlan ?
            <div className="space-y-6">
                  <Card>
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-brand-500" />{' '}
                        Care Plan
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Evolving care plan based on staff inputs and
                        assessments.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">
                            Generated Date
                          </p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(
                          carePlan.generatedDate
                        ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">Next Review</p>
                          <p className="text-sm font-medium text-slate-900">
                            {new Date(carePlan.reviewDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-slate-900 uppercase tracking-wider">
                        Required Actions
                      </h3>
                      <ul className="space-y-2">
                        {carePlan.actions.map((action, idx) =>
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg hover:border-brand-200 transition-colors">
                      
                            <div className="mt-0.5 h-4 w-4 rounded-full border-2 border-brand-500 flex-shrink-0"></div>
                            <span className="text-sm text-slate-700">
                              {action}
                            </span>
                          </li>
                    )}
                      </ul>
                    </div>
                  </Card>
                </div> :

            <Card className="text-center py-12">
                  <ClipboardList className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                  <h3 className="text-lg font-medium text-slate-900">
                    No Active Care Plan
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 mb-4">
                    A care plan has not been generated for this resident yet.
                  </p>
                  <Button>Generate Care Plan</Button>
                </Card>
            }
            </motion.div>
          }

          {activeTab === 'medications' &&
          <motion.div
            key="medications"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}>
            
              <Card noPadding>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Current Medications
                  </h2>
                  <Button size="sm" icon={Plus}>
                    Add Medication
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-5 py-3 font-medium">Medication</th>
                        <th className="px-5 py-3 font-medium">Dosage</th>
                        <th className="px-5 py-3 font-medium">Schedule</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {carePlan?.medications.map((med, idx) =>
                    <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Pill className="h-4 w-4 text-brand-500" />
                              <span className="font-medium text-slate-900">
                                {med.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {med.dosage}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {med.schedule}
                          </td>
                          <td className="px-5 py-4">
                            <Badge
                          variant={
                          med.status === 'Active' ?
                          'success' :
                          med.status === 'Paused' ?
                          'warning' :
                          'default'
                          }>
                          
                              {med.status}
                            </Badge>
                          </td>
                        </tr>
                    )}
                      {(!carePlan || carePlan.medications.length === 0) &&
                    <tr>
                          <td
                        colSpan={4}
                        className="px-5 py-8 text-center text-slate-500">
                        
                            No medications recorded.
                          </td>
                        </tr>
                    }
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          }

          {activeTab === 'tasks' &&
          <motion.div
            key="tasks"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}>
            
              <Card noPadding>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Resident Tasks
                  </h2>
                  <Button
                  size="sm"
                  icon={Plus}
                  onClick={() => setIsCreateTaskOpen(true)}>
                  
                    Create Task
                  </Button>
                </div>
                <div className="p-5 space-y-4">
                  {residentTasks.map((task) => {
                  const assignedStaff = mockStaffMembers.find(
                    (s) => s.id === task.assignedTo
                  );
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow">
                      
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900">
                              {task.title}
                            </h3>
                            <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getTaskCategoryColor(task.category)}`}>
                            
                              {task.category}
                            </span>
                          </div>
                          <Badge
                          variant={
                          task.status === 'Todo' ?
                          'default' :
                          task.status === 'In Progress' ?
                          'info' :
                          'success'
                          }>
                          
                            {task.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 mb-3">
                          {task.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span>
                              {assignedStaff ?
                            getFullName(assignedStaff) :
                            'Unassigned'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                              Due: {new Date(task.dueDate).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>);

                })}
                  {residentTasks.length === 0 &&
                <div className="text-center py-8 text-slate-500 text-sm">
                      No tasks assigned for this resident.
                    </div>
                }
                </div>
              </Card>
            </motion.div>
          }

          {activeTab === 'notes' &&
          <motion.div
            key="notes"
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              y: -10
            }}
            className="space-y-6">
            
              <Card>
                <h2 className="text-sm font-semibold text-slate-900 mb-3">
                  Add Note
                </h2>
                <div className="space-y-3">
                  <div className="flex gap-2 mb-2">
                    {['Observation', 'Clinical', 'General'].map((type) =>
                  <button
                    key={type}
                    onClick={() => setNoteType(type)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${noteType === type ? getNoteTypeColor(type) : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
                    
                        {type}
                      </button>
                  )}
                  </div>
                  <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[80px] resize-y"
                  placeholder="Type your observation or note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}>
                </textarea>
                  <div className="flex justify-end">
                    <Button disabled={!newNote.trim()}>Save Note</Button>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                {notes.map((note) =>
              <Card
                key={note.id}
                className="hover:border-slate-300 transition-colors">
                
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-medium text-slate-600">
                          {note.author.
                      split(' ').
                      map((n) => n[0]).
                      join('')}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {note.author}
                        </span>
                        <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${getNoteTypeColor(note.type)}`}>
                      
                          {note.type}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(note.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 pl-8">
                      {note.content}
                    </p>
                  </Card>
              )}
                {notes.length === 0 &&
              <div className="text-center py-8 text-slate-500 text-sm">
                    No notes yet.
                  </div>
              }
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </div>

      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Resident Profile">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              <option value="">Select a branch</option>
              <option value={resident.branchId}>Current Branch ({resident.branchId})</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Room Number" defaultValue={resident.room} />
            <Input
              label="Admission Date"
              type="date"
              defaultValue={resident.admissionDate} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="First Name" defaultValue={resident.firstName} />
            <Input label="Middle Name" defaultValue={resident.middleName} />
            <Input label="Last Name" defaultValue={resident.lastName} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date of Birth" type="date" defaultValue={resident.dob} />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Gender
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                defaultValue={resident.gender}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Weight (lbs)"
              type="number"
              defaultValue={resident.weight?.toString() || ''} />
            <Input label="Height" defaultValue={resident.height || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                defaultValue={resident.status}>
                
                <option>InPatient</option>
                <option>Hospitalized</option>
                <option>Discharged</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-700">
                Relationship
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
                defaultValue={resident.emergencyContacts[0]?.relation || ''}>
                <option value="">Select Relationship</option>
                <option>Spouse</option>
                <option>Son</option>
                <option>Daughter</option>
                <option>Sibling</option>
                <option>Friend</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Code Status
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              <option value="">Select Code Status</option>
              <option>Full Code</option>
              <option>DNR</option>
              <option>DNI</option>
              <option>DNR/DNI</option>
              <option>Comfort Care</option>
            </select>
          </div>
          <Input
            label="Primary Diagnosis"
            defaultValue={resident.primaryDiagnosis} />
          
          <Input label="Allergies" defaultValue={resident.allergies} />
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="First Name"
                defaultValue={resident.emergencyContacts[0]?.firstName || ''} />
              <Input
                label="Middle Name"
                defaultValue={resident.emergencyContacts[0]?.middleName || ''} />
              <Input
                label="Last Name"
                defaultValue={resident.emergencyContacts[0]?.lastName || ''} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Input
                label="Phone Number"
                defaultValue={resident.emergencyContacts[0]?.phone || ''} />
              <Input
                label="Email"
                type="email"
                defaultValue={resident.emergencyContacts[0]?.email || ''} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Medical History & Notes
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[100px] resize-y"
              defaultValue={resident.medicalHistory || ''}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsEditProfileOpen(false)}>
              
              Cancel
            </Button>
            <Button onClick={() => setIsEditProfileOpen(false)}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        title="Create New Task">
        
        <div className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Administer Morning Meds" />
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              <option>Medication</option>
              <option>Bathing</option>
              <option>Vitals</option>
              <option>Therapy</option>
              <option>Observation</option>
              <option>Meal</option>
              <option>General</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Assign To
            </label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
              <option value="">Unassigned</option>
              {mockStaffMembers.map((staff) =>
              <option key={staff.id} value={staff.id}>
                  {getFullName(staff)} - {staff.role}
                </option>
              )}
            </select>
          </div>
          <Input label="Due Date" type="datetime-local" />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[80px] resize-y"
              placeholder="Add any additional details or instructions...">
            </textarea>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => setIsCreateTaskOpen(false)}>
              
              Cancel
            </Button>
            <Button onClick={() => setIsCreateTaskOpen(false)}>
              Create Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>);

};