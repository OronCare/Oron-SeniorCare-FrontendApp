import axios, { AxiosError } from 'axios';
import { CarePlan } from '../types';

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

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === 'string') {
      if (payload.includes('<!doctype') || payload.includes('<html')) {
        return 'Care Plans API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
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

const extractArrayPayload = (payload: unknown): CarePlan[] => {
  if (Array.isArray(payload)) return payload as CarePlan[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: CarePlan[] }).data;
  }
  if (Array.isArray((payload as { carePlans?: unknown })?.carePlans)) {
    return (payload as { carePlans: CarePlan[] }).carePlans;
  }
  return [];
};

export const carePlanService = {
  async getCarePlansByResident(residentId: string): Promise<CarePlan[]> {
    try {
      const response = await axios.get(`${API_BASE}/care-plans/resident/${residentId}`, {
        headers: getHeaders(),
      });
      return extractArrayPayload(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch care plans'));
    }
  },
};

