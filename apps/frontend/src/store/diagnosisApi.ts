import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { DiagnosisReport, CreateDiagnosisReportDto, UpdateDiagnosisReportDto, DiagnosisSearchFilters } from '@/interfaces/patient/patient-workflow.interface';

export const diagnosisApi = createApi({
  reducerPath: 'diagnosisApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/diagnoses',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Diagnosis'],
  endpoints: (builder) => ({
    // Get all diagnoses with filters
    getDiagnoses: builder.query<DiagnosisReport[], DiagnosisSearchFilters>({
      query: (filters) => ({
        url: '',
        params: filters,
      }),
      providesTags: ['Diagnosis'],
    }),

    // Get diagnosis by ID
    getDiagnosisById: builder.query<DiagnosisReport, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Diagnosis', id }],
    }),

    // Get diagnoses by encounter
    getDiagnosesByEncounter: builder.query<DiagnosisReport[], string>({
      query: (encounterId) => `/encounter/${encounterId}`,
      providesTags: (result, error, encounterId) => [
        { type: 'Diagnosis', id: `encounter-${encounterId}` },
      ],
    }),

    // Get diagnoses by patient
    getDiagnosesByPatient: builder.query<DiagnosisReport[], { patientId: string; limit?: number }>({
      query: ({ patientId, limit }) => ({
        url: `/patient/${patientId}`,
        params: { limit },
      }),
      providesTags: (result, error, { patientId }) => [
        { type: 'Diagnosis', id: `patient-${patientId}` },
      ],
    }),

    // Get diagnoses by physician
    getDiagnosesByPhysician: builder.query<DiagnosisReport[], string>({
      query: (physicianId) => `/physician/${physicianId}`,
      providesTags: (result, error, physicianId) => [
        { type: 'Diagnosis', id: `physician-${physicianId}` },
      ],
    }),

    // Get diagnosis stats
    getDiagnosisStats: builder.query<{
      total: number;
      active: number;
      resolved: number;
      critical: number;
      today: number;
    }, void>({
      query: () => '/stats',
      providesTags: ['Diagnosis'],
    }),

    // Get diagnoses by type
    getDiagnosesByType: builder.query<{
      primary: number;
      secondary: number;
      differential: number;
    }, void>({
      query: () => '/types',
      providesTags: ['Diagnosis'],
    }),

    // Create diagnosis
    createDiagnosis: builder.mutation<DiagnosisReport, CreateDiagnosisReportDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { encounterId }) => [
        { type: 'Diagnosis', id: `encounter-${encounterId}` },
        'Diagnosis',
      ],
    }),

    // Update diagnosis
    updateDiagnosis: builder.mutation<DiagnosisReport, { id: string; data: UpdateDiagnosisReportDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Diagnosis', id },
        'Diagnosis',
      ],
    }),

    // Delete diagnosis
    deleteDiagnosis: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Diagnosis'],
    }),
  }),
});

export const {
  useGetDiagnosesQuery,
  useGetDiagnosisByIdQuery,
  useGetDiagnosesByEncounterQuery,
  useGetDiagnosesByPatientQuery,
  useGetDiagnosesByPhysicianQuery,
  useGetDiagnosisStatsQuery,
  useGetDiagnosesByTypeQuery,
  useCreateDiagnosisMutation,
  useUpdateDiagnosisMutation,
  useDeleteDiagnosisMutation,
} = diagnosisApi;
