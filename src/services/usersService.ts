import { User } from '../types';

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
        ? 'Users API returned HTML instead of JSON. Check VITE_API_URL points to backend.' :
        text || 'Users API returned a non-JSON response.',
    );
  }

  return response.json();
};

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${getApiBase()}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to fetch users');
    }

    const payload = await parseJsonResponse(response);

    if (Array.isArray(payload)) {
      return payload as User[];
    }
    if (Array.isArray(payload?.data)) {
      return payload.data as User[];
    }
    if (Array.isArray(payload?.users)) {
      return payload.users as User[];
    }

    return [];
  },
};