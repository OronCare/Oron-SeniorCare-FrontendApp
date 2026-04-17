import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  HeartPulse,
  Building2,
  Camera,
  Plus,
  Trash2 } from
'lucide-react';
import { Card, Button, Input } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { mockBranches } from '../../mockData';
export const FacAdminAddResident = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const facilityId = user?.facilityId || 'fac1';
  const myBranches = mockBranches.filter((b) => b.facilityId === facilityId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([
  {
    id: '1',
    firstName: '',
    lastName: '',
    phone: '',
    relation: ''
  }]
  );
  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/facility-admin/residents');
    }, 1000);
  };
  const addContact = () => {
    setEmergencyContacts([
    ...emergencyContacts,
    {
      id: Math.random().toString(),
      firstName: '',
      lastName: '',
      phone: '',
      relation: ''
    }]
    );
  };
  const removeContact = (id: string) => {
    if (emergencyContacts.length > 1) {
      setEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
    }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/facility-admin/residents"
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Add New Resident
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Enter resident details to create a new profile.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/facility-admin/residents')}>
            
            Cancel
          </Button>
          <Button icon={Save} isLoading={isSubmitting} onClick={handleSave}>
            Save Resident
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Photo & Quick Info */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center text-center">
            <label className="h-32 w-32 rounded-full bg-slate-100 border-4 border-white shadow-sm flex items-center justify-center mb-4 relative group cursor-pointer overflow-hidden">
              <input
                type="file"
                className="hidden"
                accept="image/jpeg, image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const img = document.getElementById(
                        'preview-image'
                      ) as HTMLImageElement;
                      const icon = document.getElementById('placeholder-icon');
                      if (img && e.target?.result) {
                        img.src = e.target.result as string;
                        img.classList.remove('hidden');
                        if (icon) icon.classList.add('hidden');
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }} />
              
              <img
                id="preview-image"
                className="h-full w-full object-cover hidden"
                alt="Preview" />
              
              <User
                id="placeholder-icon"
                className="h-12 w-12 text-slate-300" />
              
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white mb-1" />
                <span className="text-xs text-white font-medium">
                  Upload Photo
                </span>
              </div>
            </label>
            <h3 className="text-sm font-medium text-slate-900">
              Resident Photo
            </h3>
            <p className="text-xs text-slate-500 mt-1">JPG or PNG, max 5MB</p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Building2 className="h-4 w-4 text-slate-400" />
              Branch Assignment
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                  <option value="">Select a branch</option>
                  {myBranches.map((b) =>
                  <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  )}
                </select>
              </div>
              <Input label="Room Number" placeholder="e.g. 101A" />
              <Input
                label="Admission Date"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]} />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                  <option value="InPatient">InPatient</option>
                  <option value="Hospitalized">Hospitalized</option>
                  <option value="Discharged">Discharged</option>
                </select>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Forms */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-slate-400" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="First Name *" placeholder="Jane" />
              <Input label="Middle Name" placeholder="A." />
              <Input label="Last Name *" placeholder="Doe" />

              <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Date of Birth" type="date" />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Gender
                  </label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
                    <option value="">Select Gender</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Weight (lbs)
                  </label>
                  <input
                    type="number"
                    placeholder="150"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />
                  
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700">
                    Height
                  </label>
                  <input
                    type="text"
                    placeholder="5'6&quot;"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />
                  
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                Emergency Contacts
              </h3>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={addContact}>
                
                Add Contact
              </Button>
            </div>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) =>
              <div
                key={contact.id}
                className="p-4 bg-slate-50 border border-slate-100 rounded-lg relative">
                
                  {emergencyContacts.length > 1 &&
                <button
                  onClick={() => removeContact(contact.id)}
                  className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                  
                      <Trash2 className="h-4 w-4" />
                    </button>
                }
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Contact {index + 1}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First Name *" placeholder="First Name" />
                    <Input label="Middle Name" placeholder="Middle Name" />
                    <Input label="Last Name *" placeholder="Last Name" />
                    <Input
                    label="Email"
                    placeholder="Email Address"
                    type="email" />
                  
                    <Input
                    label="Phone Number *"
                    placeholder="(555) 000-0000" />
                  
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-slate-700">
                        Relationship *
                      </label>
                      <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white">
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
                </div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <HeartPulse className="h-4 w-4 text-slate-400" />
              Medical Summary
            </h3>
            <div className="space-y-4">
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
                placeholder="e.g. Dementia, Hypertension" />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Allergies
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Peanuts (Leave blank if none)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500" />
                
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-700">
                  Medical History & Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[100px] resize-y"
                  placeholder="Enter relevant medical history, previous surgeries, and special instructions...">
                </textarea>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>);

};