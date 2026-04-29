import axios from 'axios';
import { Resident } from '../types';

const API_BASE = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) return '';
  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

if (!API_BASE) {
  throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getAuthToken()}`,
});

export interface CreateResidentRequest {
  branchId: string;
  facilityId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  gender: string;
  room: string;
  status: string;
  healthState: string;
  admissionDate: string;
  weight: number;
  height: string;
  emergencyContacts: Array<{
    id: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone: string;
    relation: string;
    email?: string;
  }>;
  medicalHistory: string;
  allergies: string;
  primaryDiagnosis: string;
  lastVitalsDate: string;
}

export const residentService = {
  async getAllResidents(): Promise<Resident[]> {
    const response = await axios.get<Resident[]>(`${API_BASE}/residents`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  async createResident(data: CreateResidentRequest): Promise<Resident> {
    const response = await axios.post<Resident>(`${API_BASE}/residents`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },
};
