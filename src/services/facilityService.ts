import axios, { AxiosError } from 'axios';
import { Facility } from '../types';

export interface CreateFacilityRequest {
  name: string;
  phone: string;
  email: string;
  type: string;
  status: string;
  contractStart: string;
  contractEnd: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface CreateFacilityResponse {
  facility: Facility;
  facilityAdminTemporaryPassword?: string;
}

export interface UpdateFacilityRequest {
  name: string;
  phone: string;
  email: string;
  type: string;
  status: string;
  contractStart: string;
  contractEnd: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword?: string;
}

const API_BASE = import.meta.env.VITE_API_URL;

const getAuthToken = () => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) {
    return '';
  }

  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

const getApiBase = () => {
  if (!API_BASE) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return API_BASE;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const payload = error.response?.data;
    if (typeof payload === 'string') {
      if (payload.includes('<!doctype') || payload.includes('<html')) {
        return 'Facility API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
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

export const facilityService = {
  async getAllFacilities(): Promise<Facility[]> {
    try {
      const response = await axios.get(`${getApiBase()}/facilities`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as Facility[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as Facility[];
      }
      if (Array.isArray(payload?.facilities)) {
        return payload.facilities as Facility[];
      }

      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch facilities'));
    }
  },

  async getFacilityById(id: string): Promise<Facility> {
    try {
      const response = await axios.get(`${getApiBase()}/facilities/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Facility;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch facility'));
    }
  },

  async createFacility(data: CreateFacilityRequest): Promise<CreateFacilityResponse> {
    try {
      const response = await axios.post(`${getApiBase()}/facilities`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as CreateFacilityResponse;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create facility'));
    }
  },

  async updateFacility(id: string, data: UpdateFacilityRequest): Promise<Facility> {
    try {
      const response = await axios.put(`${getApiBase()}/facilities/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Facility;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update facility'));
    }
  },
};
