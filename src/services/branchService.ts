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

const parseJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(
      text.includes('<!doctype') || text.includes('<html')
        ? 'Branch API returned HTML instead of JSON. Check VITE_API_URL points to backend.'
        : text || 'Branch API returned a non-JSON response.',
    );
  }

  return response.json();
};

export const branchService = {
  async getAllBranches(): Promise<Branch[]> {
    const response = await fetch(`${getApiBase()}/branches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch branches');
    }

    const payload = await parseJsonResponse(response);

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
  },

  async createBranch(data: CreateBranchRequest): Promise<Branch> {
    const response = await fetch(`${getApiBase()}/branches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create branch');
    }

    return parseJsonResponse(response);
  },
};
