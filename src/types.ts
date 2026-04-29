// ─── Roles ───
export type Role = 'owner' | 'facility_admin' | 'admin' | 'staff';

// ─── Users ───
export interface User {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: Role;
  facilityId?: string; // For facility_admin: the facility they manage
  branchId?: string; // For admin/staff: the branch they belong to
  avatar?: string;
}

// ─── Facility (top-level organization) ───
export interface Facility {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: 'Senior Living' | 'Assisted Living' | 'Memory Care' | 'Multi-Specialty';
  status: 'Active' | 'Pending' | 'Suspended';
  contractStart: string;
  contractEnd: string;
  facilityAdminId: string;
  facilityAdminName: string;
  totalBranches: number;
  totalResidents: number;
}

// ─── Branch (under a Facility) ───
export interface Branch {
  id: string;
  facilityId: string;
  name: string;
  address: string;
  phone: string;
  type: string;
  status: string;
  residentLimit: number;
  currentResidents: number;
  branchAdminId?: string | null;
  branchAdminName?: string | null;
}

// ─── Resident ───
export type ResidentStatus = 'InPatient' | 'Hospitalized' | 'Discharged';

export type ResidentHealthState =
'Stable' |
'Slight Deviation' |
'Concerning Trend' |
'Early Deterioration' |
'Active Deterioration' |
'Recovery';

export interface EmergencyContact {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phone: string;
  relation: string;
  email?: string;
}

export interface Resident {
  id: string;
  branchId: string;
  facilityId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  room: string;
  status: ResidentStatus;
  healthState: ResidentHealthState;
  admissionDate: string;
  weight?: number;
  height?: string;
  emergencyContacts: EmergencyContact[];
  medicalHistory: string;
  allergies?: string;
  primaryDiagnosis?: string;
  lastVitalsDate?: string;
}

// ─── Vitals ───
export interface Vital {
  id: string;
  residentId: string;
  branchId: string;
  date: string;
  systolicBP: number;
  diastolicBP: number;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  bloodSugar?: number;
  weight: number;
  respiratoryRate: number;
  recordedBy: string;
  notes?: string;
}

// ─── Tasks ───
export type TaskCategory =
'Medication' |
'Bathing' |
'Vitals' |
'Therapy' |
'Observation' |
'Meal' |
'General';

export interface Task {
  id: string;
  residentId: string;
  branchId: string;
  facilityId: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: 'Todo' | 'In Progress' | 'Done' | 'Deferred';
  dueDate: string;
  assignedTo?: string;
  createdBy: string;
}

// ─── Alerts ───
export interface Alert {
  id: string;
  facilityId: string;
  branchId?: string;
  residentId?: string;
  title: string;
  message: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Unread' | 'Read' | 'Resolved';
  date: string;
  targetRoles: Role[];
  healthState?: ResidentHealthState;
}

// ─── Rules (Oron Platform Owner only) ───
export type VitalType =
'systolicBP' |
'diastolicBP' |
'heartRate' |
'oxygenSaturation' |
'temperature' |
'bloodSugar';

export interface RuleThreshold {
  normalMin: number;
  normalMax: number;
  lowThreshold: number;
  highThreshold: number;
  criticalLow: number;
  criticalHigh: number;
  unit: string;
}

export interface Rule {
  id: string;
  name: string;
  vitalType: VitalType;
  category: 'Vitals';
  thresholds: RuleThreshold;
  isActive: boolean;
  description: string;
}

// ─── Care Plan ───
export interface CarePlan {
  id: string;
  residentId: string;
  branchId: string;
  generatedDate: string;
  reviewDate: string;
  medications: {
    name: string;
    dosage: string;
    schedule: string;
    status: 'Active' | 'Paused' | 'Discontinued';
  }[];
  actions: string[];
}

// ─── Staff Member ───
export interface StaffMember {
  id: string;
  branchId: string;
  facilityId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: 'Caregiver' | 'Nurse' | 'Coordinator';
  status: 'Active' | 'Inactive';
  lastActive: string;
  permissions: string[];
}

// ─── Audit Log ───
export interface AuditLog {
  id: string;
  facilityId?: string;
  branchId?: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
}

// ─── Note ───
export interface Note {
  id: string;
  residentId: string;
  author: string;
  content: string;
  timestamp: string;
  type: 'Observation' | 'Clinical' | 'General';
}

// ─── Helper to get full name ───
export function getFullName(entity: {
  firstName: string;
  middleName?: string;
  lastName: string;
}): string {
  return [entity.firstName, entity.middleName, entity.lastName].
  filter(Boolean).
  join(' ');
}