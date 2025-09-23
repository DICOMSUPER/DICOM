import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  Patient,
  PatientEncounter,
  DiagnosisReport,
  CreatePatientDto,
  UpdatePatientDto,
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
  CreateDiagnosisReportDto,
  UpdateDiagnosisReportDto,
  PatientSearchFilters,
  EncounterSearchFilters,
  DiagnosisSearchFilters,
  PaginatedResponse,
  PatientStats,
  EncounterStats,
  DiagnosisStats
} from '@/interfaces/patient/patient-workflow.interface';

export const patientApi = createApi({
  reducerPath: 'patientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/patients',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Patient', 'Encounter', 'Diagnosis', 'Stats'],
  endpoints: (builder) => ({
    // Patient endpoints
    getPatients: builder.query<Patient[], PatientSearchFilters>({
      query: (filters) => ({
        url: '',
        params: filters,
      }),
      providesTags: ['Patient'],
    }),

    getPatientsPaginated: builder.query<
      PaginatedResponse<Patient>,
      { page: number; limit: number; filters: Omit<PatientSearchFilters, 'limit' | 'offset'> }
    >({
      query: ({ page, limit, filters }) => ({
        url: '/paginated',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Patient'],
    }),

    getPatientById: builder.query<Patient, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),

    getPatientByCode: builder.query<Patient, string>({
      query: (patientCode) => `/code/${patientCode}`,
      providesTags: (result, error, patientCode) => [{ type: 'Patient', id: patientCode }],
    }),

    searchPatientsByName: builder.query<Patient[], { searchTerm: string; limit?: number }>({
      query: ({ searchTerm, limit = 10 }) => ({
        url: '/search',
        params: { q: searchTerm, limit },
      }),
      providesTags: ['Patient'],
    }),

    createPatient: builder.mutation<Patient, CreatePatientDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Patient', 'Stats'],
    }),

    updatePatient: builder.mutation<Patient, { id: string; data: UpdatePatientDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Patient', id },
        'Patient',
        'Stats',
      ],
    }),

    deletePatient: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Patient', 'Stats'],
    }),

    restorePatient: builder.mutation<Patient, string>({
      query: (id) => ({
        url: `/${id}/restore`,
        method: 'POST',
      }),
      invalidatesTags: ['Patient', 'Stats'],
    }),

    getPatientStats: builder.query<PatientStats, void>({
      query: () => '/stats',
      providesTags: ['Stats'],
    }),

    // Encounter endpoints
    getEncountersByPatientId: builder.query<PatientEncounter[], { patientId: string; limit?: number }>({
      query: ({ patientId, limit }) => ({
        url: `/encounters/patient/${patientId}`,
        params: { limit },
      }),
      providesTags: (result, error, { patientId }) => [
        { type: 'Encounter', id: `patient-${patientId}` },
      ],
    }),

    getAllEncounters: builder.query<PatientEncounter[], EncounterSearchFilters>({
      query: (filters) => ({
        url: '/encounters',
        params: filters,
      }),
      providesTags: ['Encounter'],
    }),

    getEncountersPaginated: builder.query<
      PaginatedResponse<PatientEncounter>,
      { page: number; limit: number; filters: Omit<EncounterSearchFilters, 'limit' | 'offset'> }
    >({
      query: ({ page, limit, filters }) => ({
        url: '/encounters/paginated',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Encounter'],
    }),

    getEncounterById: builder.query<PatientEncounter, string>({
      query: (id) => `/encounters/${id}`,
      providesTags: (result, error, id) => [{ type: 'Encounter', id }],
    }),

    createEncounter: builder.mutation<PatientEncounter, CreatePatientEncounterDto>({
      query: (data) => ({
        url: '/encounters',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { patientId }) => [
        { type: 'Encounter', id: `patient-${patientId}` },
        'Encounter',
        'Stats',
      ],
    }),

    updateEncounter: builder.mutation<PatientEncounter, { id: string; data: UpdatePatientEncounterDto }>({
      query: ({ id, data }) => ({
        url: `/encounters/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Encounter', id },
        'Encounter',
        'Stats',
      ],
    }),

    deleteEncounter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/encounters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Encounter', 'Stats'],
    }),

    getEncounterStats: builder.query<EncounterStats, string | undefined>({
      query: (patientId) => ({
        url: '/encounters/stats',
        params: patientId ? { patientId } : {},
      }),
      providesTags: ['Stats'],
    }),

    // Diagnosis endpoints
    getDiagnosesByEncounterId: builder.query<DiagnosisReport[], string>({
      query: (encounterId) => `/encounters/${encounterId}/diagnoses`,
      providesTags: (result, error, encounterId) => [
        { type: 'Diagnosis', id: `encounter-${encounterId}` },
      ],
    }),

    getDiagnosesByPatientId: builder.query<DiagnosisReport[], { patientId: string; limit?: number }>({
      query: ({ patientId, limit }) => ({
        url: `/${patientId}/diagnoses`,
        params: { limit },
      }),
      providesTags: (result, error, { patientId }) => [
        { type: 'Diagnosis', id: `patient-${patientId}` },
      ],
    }),

    getAllDiagnoses: builder.query<DiagnosisReport[], DiagnosisSearchFilters>({
      query: (filters) => ({
        url: '/diagnoses',
        params: filters,
      }),
      providesTags: ['Diagnosis'],
    }),

    getDiagnosesPaginated: builder.query<
      PaginatedResponse<DiagnosisReport>,
      { page: number; limit: number; filters: Omit<DiagnosisSearchFilters, 'limit' | 'offset'> }
    >({
      query: ({ page, limit, filters }) => ({
        url: '/diagnoses/paginated',
        params: { page, limit, ...filters },
      }),
      providesTags: ['Diagnosis'],
    }),

    getDiagnosisById: builder.query<DiagnosisReport, string>({
      query: (id) => `/diagnoses/${id}`,
      providesTags: (result, error, id) => [{ type: 'Diagnosis', id }],
    }),

    createDiagnosis: builder.mutation<DiagnosisReport, CreateDiagnosisReportDto>({
      query: (data) => ({
        url: `/encounters/${data.encounterId}/diagnoses`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { encounterId }) => [
        { type: 'Diagnosis', id: `encounter-${encounterId}` },
        'Diagnosis',
        'Stats',
      ],
    }),

    updateDiagnosis: builder.mutation<DiagnosisReport, { id: string; data: UpdateDiagnosisReportDto }>({
      query: ({ id, data }) => ({
        url: `/diagnoses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Diagnosis', id },
        'Diagnosis',
        'Stats',
      ],
    }),

    deleteDiagnosis: builder.mutation<void, string>({
      query: (id) => ({
        url: `/diagnoses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Diagnosis', 'Stats'],
    }),

    getDiagnosisStats: builder.query<DiagnosisStats, string | undefined>({
      query: (patientId) => ({
        url: '/diagnoses/stats',
        params: patientId ? { patientId } : {},
      }),
      providesTags: ['Stats'],
    }),

    getFollowupRequiredDiagnoses: builder.query<DiagnosisReport[], number | undefined>({
      query: (limit) => ({
        url: '/diagnoses/followup-required',
        params: limit ? { limit } : {},
      }),
      providesTags: ['Diagnosis'],
    }),
  }),
});

export const {
  // Patient hooks
  useGetPatientsQuery,
  useGetPatientsPaginatedQuery,
  useGetPatientByIdQuery,
  useGetPatientByCodeQuery,
  useSearchPatientsByNameQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
  useRestorePatientMutation,
  useGetPatientStatsQuery,

  // Encounter hooks
  useGetEncountersByPatientIdQuery,
  useGetAllEncountersQuery,
  useGetEncountersPaginatedQuery,
  useGetEncounterByIdQuery,
  useCreateEncounterMutation,
  useUpdateEncounterMutation,
  useDeleteEncounterMutation,
  useGetEncounterStatsQuery,

  // Diagnosis hooks
  useGetDiagnosesByEncounterIdQuery,
  useGetDiagnosesByPatientIdQuery,
  useGetAllDiagnosesQuery,
  useGetDiagnosesPaginatedQuery,
  useGetDiagnosisByIdQuery,
  useCreateDiagnosisMutation,
  useUpdateDiagnosisMutation,
  useDeleteDiagnosisMutation,
  useGetDiagnosisStatsQuery,
  useGetFollowupRequiredDiagnosesQuery,
} = patientApi;
