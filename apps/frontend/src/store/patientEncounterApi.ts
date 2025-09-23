import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  PatientEncounter,
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
  EncounterSearchFilters,
  PaginatedResponse,
  EncounterStats
} from '@/interfaces/patient/patient-workflow.interface';

export const patientEncounterApi = createApi({
  reducerPath: 'patientEncounterApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/patient-encounters',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PatientEncounter'],
  endpoints: (builder) => ({
    // Get all encounters with filters
    getPatientEncounters: builder.query<PatientEncounter[], EncounterSearchFilters>({
      query: (filters) => ({
        url: '',
        params: filters,
      }),
      providesTags: ['PatientEncounter'],
    }),

    // Get encounters with pagination
    getPatientEncountersPaginated: builder.query<
      PaginatedResponse<PatientEncounter>,
      { page: number; limit: number; filters: Omit<EncounterSearchFilters, 'limit' | 'offset'> }
    >({
      query: ({ page, limit, filters }) => ({
        url: '/paginated',
        params: { page, limit, ...filters },
      }),
      providesTags: ['PatientEncounter'],
    }),

    // Get encounter by ID
    getPatientEncounterById: builder.query<PatientEncounter, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'PatientEncounter', id }],
    }),

    // Get encounters by patient
    getPatientEncountersByPatientId: builder.query<PatientEncounter[], string>({
      query: (patientId) => `/patient/${patientId}`,
      providesTags: (result, error, patientId) => [
        { type: 'PatientEncounter', id: `patient-${patientId}` },
      ],
    }),

    // Get encounters by physician
    getPatientEncountersByPhysicianId: builder.query<PatientEncounter[], string>({
      query: (physicianId) => `/physician/${physicianId}`,
      providesTags: (result, error, physicianId) => [
        { type: 'PatientEncounter', id: `physician-${physicianId}` },
      ],
    }),

    // Get encounter stats
    getPatientEncounterStats: builder.query<EncounterStats, void>({
      query: () => '/stats',
      providesTags: ['PatientEncounter'],
    }),

    // Create encounter
    createPatientEncounter: builder.mutation<PatientEncounter, CreatePatientEncounterDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { patientId }) => [
        { type: 'PatientEncounter', id: `patient-${patientId}` },
        'PatientEncounter',
      ],
    }),

    // Update encounter
    updatePatientEncounter: builder.mutation<PatientEncounter, { id: string; data: UpdatePatientEncounterDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PatientEncounter', id },
        'PatientEncounter',
      ],
    }),

    // Delete encounter
    deletePatientEncounter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PatientEncounter'],
    }),
  }),
});

export const {
  useGetPatientEncountersQuery,
  useGetPatientEncountersPaginatedQuery,
  useGetPatientEncounterByIdQuery,
  useGetPatientEncountersByPatientIdQuery,
  useGetPatientEncountersByPhysicianIdQuery,
  useGetPatientEncounterStatsQuery,
  useCreatePatientEncounterMutation,
  useUpdatePatientEncounterMutation,
  useDeletePatientEncounterMutation,
} = patientEncounterApi;
