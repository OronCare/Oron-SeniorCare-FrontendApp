import axios, { AxiosError } from 'axios';
import { Branch } from '../types';

export interface CreateBranchRequest {
  facilityId: string;
  name: string;
  address: string;
  phone: string;
  type: string;
  status: string;
  residentLimit: number;

  branchAdminFirstName: string;
  branchAdminLastName: string;
  branchAdminEmail: string;
  branchAdminPassword: string;
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
        return 'Branch API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
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

export const branchService = {
  async getAllBranches(): Promise<Branch[]> {
    try {
      const response = await axios.get(`${getApiBase()}/branches`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as Branch[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as Branch[];
      }
      if (Array.isArray(payload?.branches)) {
        return payload.branches as Branch[];
      }

      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch branches'));
    }
  },

  async getBranchById(id: string): Promise<Branch> {
    try {
      const response = await axios.get(`${getApiBase()}/branches/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Branch;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch branch details'));
    }
  },

  async createBranch(data: CreateBranchRequest): Promise<Branch> {
    try {
      const response = await axios.post(`${getApiBase()}/branches`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      return response.data as Branch;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create branch'));
    }
  },
};
