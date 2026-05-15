import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  Facility,
  Branch,
  Resident,
  Alert,
  Rule,
  AuditLog,
  User,
} from '../../types';
import { normalizeAlert, type AlertPayload } from '../../services/alertsService';
import { parseRulesApiResponse } from '../../services/rulesService';
import type { CreateFacilityResponse, UpdateFacilityRequest } from '../../services/facilityService';
import type { CreateBranchRequest } from '../../services/branchService';

export interface OwnerDashboardTotals {
  facilities: number;
  branches: number;
  residents: number;
}

export interface OwnerDashboardSnapshot {
  facilities: Facility[];
  branches: Branch[];
  residents: Resident[];
  alerts: Alert[];
  totals: OwnerDashboardTotals;
}

const getApiBase = (): string => {
  const base = import.meta.env.VITE_API_URL;
  if (!base) {
    throw new Error('Missing VITE_API_URL. Set your backend API URL in frontend .env.');
  }
  return String(base).replace(/\/$/, '');
};

const getAuthToken = (): string => {
  const auth = localStorage.getItem('oron_auth');
  if (!auth) return '';
  try {
    return (JSON.parse(auth) as { token?: string }).token || '';
  } catch {
    return '';
  }
};

const asAlertArray = (value: unknown): Alert[] => {
  if (!Array.isArray(value)) return [];
  return (value as AlertPayload[]).map(normalizeAlert);
};

const normalizeAuditLogsResponse = (payload: unknown): AuditLog[] => {
  if (Array.isArray(payload)) return payload as AuditLog[];
  if (payload && typeof payload === 'object') {
    const d = payload as { data?: unknown; logs?: unknown };
    if (Array.isArray(d.data)) return d.data as AuditLog[];
    if (Array.isArray(d.logs)) return d.logs as AuditLog[];
  }
  return [];
};

const extractFacilitiesPayload = (payload: unknown): Facility[] => {
  if (Array.isArray(payload)) return payload as Facility[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: Facility[] }).data;
  }
  if (Array.isArray((payload as { facilities?: unknown })?.facilities)) {
    return (payload as { facilities: Facility[] }).facilities;
  }
  return [];
};

const extractBranchesPayload = (payload: unknown): Branch[] => {
  if (Array.isArray(payload)) return payload as Branch[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: Branch[] }).data;
  }
  if (Array.isArray((payload as { branches?: unknown })?.branches)) {
    return (payload as { branches: Branch[] }).branches;
  }
  return [];
};

const extractResidentsPayload = (payload: unknown): Resident[] => {
  if (Array.isArray(payload)) return payload as Resident[];
  if (Array.isArray((payload as { data?: unknown })?.data)) {
    return (payload as { data: Resident[] }).data;
  }
  if (Array.isArray((payload as { residents?: unknown })?.residents)) {
    return (payload as { residents: Resident[] }).residents;
  }
  return [];
};

const extractPaginatedTotal = (payload: unknown, fallback: number): number => {
  if (
    payload &&
    typeof payload === 'object' &&
    typeof (payload as { total?: unknown }).total === 'number'
  ) {
    return (payload as { total: number }).total;
  }
  return fallback;
};

const extractOwnerDashboardTotals = (
  response: Record<string, unknown>,
  facilities: Facility[],
  branches: Branch[],
  residents: Resident[],
): OwnerDashboardTotals => {
  const fromApi = response.totals;
  if (fromApi && typeof fromApi === 'object') {
    const t = fromApi as Partial<OwnerDashboardTotals>;
    return {
      facilities:
        typeof t.facilities === 'number'
          ? t.facilities
          : extractPaginatedTotal(response.facilities, facilities.length),
      branches:
        typeof t.branches === 'number'
          ? t.branches
          : extractPaginatedTotal(response.branches, branches.length),
      residents:
        typeof t.residents === 'number'
          ? t.residents
          : extractPaginatedTotal(response.residents, residents.length),
    };
  }
  return {
    facilities: extractPaginatedTotal(response.facilities, facilities.length),
    branches: extractPaginatedTotal(response.branches, branches.length),
    residents: extractPaginatedTotal(response.residents, residents.length),
  };
};

export const oronApi = createApi({
  reducerPath: 'oronApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getApiBase(),
    prepareHeaders: (headers) => {
      const token = getAuthToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'OwnerDashboard',
    'Facility',
    'Facilities',
    'Branch',
    'Branches',
    'Resident',
    'User',
    'Rules',
    'AuditLogs',
    'Alerts',
  ],
  endpoints: (builder) => ({
    getOwnerDashboard: builder.query<OwnerDashboardSnapshot, void>({
      query: () => '/dashboards/owner',
      providesTags: () => [{ type: 'OwnerDashboard', id: 'OWNER' }],
      transformResponse: (response: Record<string, unknown>): OwnerDashboardSnapshot => {
        const facilitiesRaw = extractFacilitiesPayload(response?.facilities);
        const branches = extractBranchesPayload(response?.branches);
        const residents = extractResidentsPayload(response?.residents);
        const totals = extractOwnerDashboardTotals(
          response,
          facilitiesRaw,
          branches,
          residents,
        );
        const residentCountsByFacility = residents.reduce(
          (acc, resident) => {
            if (resident.facilityId) {
              acc[resident.facilityId] = (acc[resident.facilityId] ?? 0) + 1;
            }
            return acc;
          },
          {} as Record<string, number>,
        );
        const facilities = facilitiesRaw.map((facility) => ({
          ...facility,
          totalResidents:
            residentCountsByFacility[facility.id] ??
            facility.totalResidents ??
            0,
        }));
        const alerts = asAlertArray(response?.alerts)
          .slice()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return { facilities, branches, residents, alerts, totals };
      },
    }),

    getFacilities: builder.query<Facility[], void>({
      query: () => '/facilities',
      providesTags: (result) =>
        result
          ? [
              { type: 'Facilities' as const, id: 'LIST' },
              ...result.map((f) => ({ type: 'Facility' as const, id: f.id })),
            ]
          : [{ type: 'Facilities', id: 'LIST' }],
      transformResponse: (response: unknown) => extractFacilitiesPayload(response),
    }),

    getFacilityById: builder.query<Facility, string>({
      query: (id) => `/facilities/${id}`,
      providesTags: (_r, _e, id) => [
        { type: 'Facility', id },
        { type: 'Facilities', id: 'LIST' },
      ],
    }),

    getBranches: builder.query<Branch[], void>({
      query: () => '/branches',
      providesTags: (result) =>
        result
          ? [
              { type: 'Branches' as const, id: 'LIST' },
              ...result.map((b) => ({ type: 'Branch' as const, id: b.id })),
            ]
          : [{ type: 'Branches', id: 'LIST' }],
      transformResponse: (response: unknown) => extractBranchesPayload(response),
    }),

    getBranchById: builder.query<Branch, string>({
      query: (id) => `/branches/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Branch', id }],
    }),

    getResidentById: builder.query<Resident, string>({
      query: (id) => `/residents/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Resident', id }],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    getRules: builder.query<Rule[], void>({
      query: () => '/rules',
      providesTags: [{ type: 'Rules', id: 'LIST' }],
      transformResponse: (response: unknown) => parseRulesApiResponse(response),
    }),

    getAuditLogs: builder.query<AuditLog[], void>({
      query: () => '/audit-logs',
      providesTags: [{ type: 'AuditLogs', id: 'LIST' }],
      transformResponse: (response: unknown) => normalizeAuditLogsResponse(response),
    }),

    getAlerts: builder.query<Alert[], void>({
      query: () => '/alerts',
      providesTags: [{ type: 'Alerts', id: 'LIST' }],
      transformResponse: (response: unknown) => {
        if (Array.isArray(response)) return asAlertArray(response);
        const d = response as { data?: unknown; alerts?: unknown };
        if (Array.isArray(d?.data)) return asAlertArray(d.data);
        if (Array.isArray(d?.alerts)) return asAlertArray(d.alerts);
        return [];
      },
    }),

    createFacility: builder.mutation<CreateFacilityResponse, FormData>({
      query: (body) => ({
        url: '/facilities',
        method: 'POST',
        body,
      }),
      invalidatesTags: () => [
        { type: 'Facilities', id: 'LIST' },
        { type: 'OwnerDashboard', id: 'OWNER' },
      ],
    }),

    updateFacility: builder.mutation<
      Facility,
      { id: string; body: UpdateFacilityRequest }
    >({
      query: ({ id, body }) => ({
        url: `/facilities/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Facility', id },
        { type: 'Facilities', id: 'LIST' },
        { type: 'OwnerDashboard', id: 'OWNER' },
        { type: 'Branches', id: 'LIST' },
      ],
    }),

    createBranch: builder.mutation<Branch, CreateBranchRequest>({
      query: (body) => ({
        url: '/branches',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Branches', id: 'LIST' },
        { type: 'Facility', id: arg.facilityId },
        { type: 'OwnerDashboard', id: 'OWNER' },
      ],
    }),

    updateRule: builder.mutation<Rule, { id: string; body: Partial<Rule> }>({
      query: ({ id, body }) => ({
        url: `/rules/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (payload: unknown) => {
        const raw = (payload as { data?: unknown })?.data ?? payload;
        const list = parseRulesApiResponse(Array.isArray(raw) ? raw : raw != null ? [raw] : []);
        return list[0] as Rule;
      },
      invalidatesTags: () => [{ type: 'Rules', id: 'LIST' }],
    }),

    updateAlertStatus: builder.mutation<
      Alert,
      { id: string; status: Alert['status'] }
    >({
      query: ({ id, status }) => ({
        url: `/alerts/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (payload: unknown) =>
        normalizeAlert(payload as AlertPayload),
      invalidatesTags: () => [
        { type: 'Alerts', id: 'LIST' },
        { type: 'OwnerDashboard', id: 'OWNER' },
      ],
    }),
  }),
});

export const {
  useGetOwnerDashboardQuery,
  useGetFacilitiesQuery,
  useGetFacilityByIdQuery,
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useGetResidentByIdQuery,
  useGetUserByIdQuery,
  useGetRulesQuery,
  useGetAuditLogsQuery,
  useGetAlertsQuery,
  useCreateFacilityMutation,
  useUpdateFacilityMutation,
  useCreateBranchMutation,
  useUpdateRuleMutation,
  useUpdateAlertStatusMutation,
} = oronApi;
