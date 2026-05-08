import axios, { AxiosError } from 'axios';
import { AuditLog } from '../types';

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
        return 'Audit logs API returned HTML instead of JSON. Check VITE_API_URL points to backend.';
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

export const auditLogService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const response = await axios.get(`${getApiBase()}/audit-logs`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const payload = response.data;
      if (Array.isArray(payload)) {
        return payload as AuditLog[];
      }
      if (Array.isArray(payload?.data)) {
        return payload.data as AuditLog[];
      }
      if (Array.isArray(payload?.logs)) {
        return payload.logs as AuditLog[];
      }
      return [];
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to fetch audit logs'));
    }
  },
};
