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

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(
      text.includes('<!doctype') || text.includes('<html')
        ? 'Facility API returned HTML instead of JSON. Check VITE_API_URL points to backend.'
        : text || 'Facility API returned a non-JSON response.',
    );
  }

  return response.json();
};

export const facilityService = {
  async getAllFacilities(): Promise<Facility[]> {
    const response = await fetch(`${getApiBase()}/facilities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch facilities');
    }

    const payload = await parseJsonResponse(response);

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
  },

  async getFacilityById(id: string): Promise<Facility> {
    const response = await fetch(`${getApiBase()}/facilities/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch facility');
    }

    return parseJsonResponse(response);
  },

  async createFacility(data: CreateFacilityRequest): Promise<CreateFacilityResponse> {
    const response = await fetch(`${getApiBase()}/facilities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create facility');
    }

    return parseJsonResponse(response);
  },
};
