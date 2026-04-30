import axios from 'axios';
import { StaffMember } from '../types';

const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
}

const getAuthToken = () => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) return '';
  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

export interface CreateStaffRequest {
  branchId: string;
  facilityId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: StaffMember['role'];
  status: StaffMember['status'];
  permissions: string[];
}

export interface UpdateStaffRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  role: StaffMember['role'];
  status: StaffMember['status'];
  permissions: string[];
}

type StaffApiPayload = Partial<StaffMember> & { id?: string; _id?: string };

const normalizeRole = (role?: string): StaffMember['role'] => {
  if (!role) return 'Caregiver';
  const normalized = role.toLowerCase();
  if (normalized.includes('nurse')) return 'Nurse';
  if (normalized.includes('coord')) return 'Coordinator';
  return 'Caregiver';
};

const normalizeStatus = (status?: string): StaffMember['status'] => {
  if (!status) return 'Active';
  return status.toLowerCase() === 'inactive' ? 'Inactive' : 'Active';
};

const normalizeStaff = (item: StaffApiPayload): StaffMember => ({
  id: item.id || item._id || '',
  branchId: item.branchId || '',
  facilityId: item.facilityId || '',
  firstName: item.firstName || '',
  middleName: item.middleName || '',
  lastName: item.lastName || '',
  email: item.email || '',
  role: normalizeRole(item.role),
  status: normalizeStatus(item.status),
  lastActive: item.lastActive || new Date().toISOString(),
  permissions: Array.isArray(item.permissions) ? item.permissions : [],
});

const extractArrayPayload = (payload: unknown): StaffApiPayload[] => {
  if (Array.isArray(payload)) return payload as StaffApiPayload[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: StaffApiPayload[] }).data;
  }
  if (Array.isArray((payload as { staff?: unknown })?.staff)) {
    return (payload as { staff: StaffApiPayload[] }).staff;
  }
  return [];
};

const extractSinglePayload = (payload: unknown): StaffApiPayload => {
  if ((payload as StaffApiPayload)?.id || (payload as StaffApiPayload)?._id) {
    return payload as StaffApiPayload;
  }
  if ((payload as { data?: StaffApiPayload })?.data) {
    return (payload as { data: StaffApiPayload }).data;
  }
  if ((payload as { staff?: StaffApiPayload })?.staff) {
    return (payload as { staff: StaffApiPayload }).staff;
  }
  return {} as StaffApiPayload;
};

export const staffService = {
  async getAllStaff(): Promise<StaffMember[]> {
    const response = await axios.get(`${API_BASE}/staff`, {
      headers: getHeaders(),
    });
    return extractArrayPayload(response.data).map(normalizeStaff);
  },

  async createStaff(data: CreateStaffRequest): Promise<StaffMember> {
    const response = await axios.post(`${API_BASE}/staff`, data, {
      headers: getHeaders(),
    });
    return normalizeStaff(extractSinglePayload(response.data));
  },

  async updateStaff(id: string, data: UpdateStaffRequest): Promise<StaffMember> {
    const response = await axios.put(`${API_BASE}/staff/${id}`, data, {
      headers: getHeaders(),
    });
    return normalizeStaff(extractSinglePayload(response.data));
  },
};
