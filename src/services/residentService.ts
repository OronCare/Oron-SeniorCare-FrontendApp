import axios, { AxiosError } from 'axios';
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

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === 'string') {
      if (payload.includes('<!doctype') || payload.includes('<html')) {
        return 'Residents API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
      }
      return payload || fallback;
    }
    if (payload && typeof payload === 'object') {
      const message = (payload as { message?: unknown }).message;
      if (typeof message === 'string') return message;
    }
  }
  return fallback;
};

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
    try {
      const response = await axios.get(`${API_BASE}/residents`, {
        headers: getHeaders(),
      });

      const payload = response.data;

      if (Array.isArray(payload)) {
        return payload as Resident[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as Resident[];
      }
      if (Array.isArray(payload?.residents)) {
        return payload.residents as Resident[];
      }

      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch residents'));
    }
  },

  async createResident(data: CreateResidentRequest): Promise<Resident> {
    try {
      const response = await axios.post(`${API_BASE}/residents`, data, {
        headers: getHeaders(),
      });

      return response.data as Resident;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create resident'));
    }
  },

  async getResidentById(id: string): Promise<Resident> {
    try {
      const response = await axios.get(`${API_BASE}/residents/${id}`, {
        headers: getHeaders(),
      });
      return response.data as Resident;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch resident details'));
    }
  },
};
