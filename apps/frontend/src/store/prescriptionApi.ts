import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Prescription, CreatePrescriptionDto, UpdatePrescriptionDto } from '@/interfaces/patient/prescription.interface';

export const prescriptionApi = createApi({
  reducerPath: 'prescriptionApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/prescriptions',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Prescription'],
  endpoints: (builder) => ({
    // Get all prescriptions
    getPrescriptions: builder.query<Prescription[], void>({
      query: () => '',
      providesTags: ['Prescription'],
    }),

    // Get prescription by ID
    getPrescriptionById: builder.query<Prescription, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Prescription', id }],
    }),

    // Get prescriptions by encounter
    getPrescriptionsByEncounter: builder.query<Prescription[], string>({
      query: (encounterId) => `/encounter/${encounterId}`,
      providesTags: (result, error, encounterId) => [
        { type: 'Prescription', id: `encounter-${encounterId}` },
      ],
    }),

    // Get prescriptions by physician
    getPrescriptionsByPhysician: builder.query<Prescription[], string>({
      query: (physicianId) => `/physician/${physicianId}`,
      providesTags: (result, error, physicianId) => [
        { type: 'Prescription', id: `physician-${physicianId}` },
      ],
    }),

    // Get prescription stats
    getPrescriptionStats: builder.query<{
      total: number;
      today: number;
    }, void>({
      query: () => '/stats',
      providesTags: ['Prescription'],
    }),

    // Create prescription
    createPrescription: builder.mutation<Prescription, CreatePrescriptionDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Prescription'],
    }),

    // Update prescription
    updatePrescription: builder.mutation<Prescription, { id: string; data: UpdatePrescriptionDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Prescription', id },
        'Prescription',
      ],
    }),

    // Delete prescription
    deletePrescription: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Prescription'],
    }),
  }),
});

export const {
  useGetPrescriptionsQuery,
  useGetPrescriptionByIdQuery,
  useGetPrescriptionsByEncounterQuery,
  useGetPrescriptionsByPhysicianQuery,
  useGetPrescriptionStatsQuery,
  useCreatePrescriptionMutation,
  useUpdatePrescriptionMutation,
  useDeletePrescriptionMutation,
} = prescriptionApi;
