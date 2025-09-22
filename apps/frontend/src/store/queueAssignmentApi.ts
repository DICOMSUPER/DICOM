import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  QueueAssignment,
  CreateQueueAssignmentDto,
  UpdateQueueAssignmentDto,
  QueueAssignmentSearchFilters,
  QueueStats
} from '@/interfaces/patient/queue-assignment.interface';

export const queueAssignmentApi = createApi({
  reducerPath: 'queueAssignmentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/queue-assignments',
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['QueueAssignment', 'QueueStats'],
  endpoints: (builder) => ({
    // Queue Assignment endpoints
    getQueueAssignments: builder.query<QueueAssignment[], QueueAssignmentSearchFilters>({
      query: (filters) => ({
        url: '',
        params: filters,
      }),
      providesTags: ['QueueAssignment'],
    }),

    getQueueAssignmentById: builder.query<QueueAssignment, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'QueueAssignment', id }],
    }),

    getQueueAssignmentsByVisitId: builder.query<QueueAssignment[], string>({
      query: (visitId) => ({
        url: '',
        params: { visitId },
      }),
      providesTags: ['QueueAssignment'],
    }),

    createQueueAssignment: builder.mutation<QueueAssignment, CreateQueueAssignmentDto>({
      query: (data) => ({
        url: '',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['QueueAssignment', 'QueueStats'],
    }),

    updateQueueAssignment: builder.mutation<QueueAssignment, { id: string; data: UpdateQueueAssignmentDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'QueueAssignment', id },
        'QueueAssignment',
        'QueueStats'
      ],
    }),

    deleteQueueAssignment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['QueueAssignment', 'QueueStats'],
    }),

    // Queue Stats
    getQueueStats: builder.query<QueueStats, void>({
      query: () => '/stats',
      providesTags: ['QueueStats'],
    }),

    // Utility endpoints
    getNextQueueNumber: builder.query<{ nextNumber: number }, void>({
      query: () => '/next-number',
    }),

    // Convenience mutations
    assignPatientToQueue: builder.mutation<QueueAssignment, { visitId: string; priority?: string; roomId?: string }>({
      query: ({ visitId, priority = 'routine', roomId }) => ({
        url: '/assign',
        method: 'POST',
        body: { visitId, priority, roomId },
      }),
      invalidatesTags: ['QueueAssignment', 'QueueStats'],
    }),

    completeQueueAssignment: builder.mutation<QueueAssignment, string>({
      query: (id) => ({
        url: `/${id}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'QueueAssignment', id },
        'QueueAssignment',
        'QueueStats'
      ],
    }),

    expireQueueAssignment: builder.mutation<QueueAssignment, string>({
      query: (id) => ({
        url: `/${id}/expire`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'QueueAssignment', id },
        'QueueAssignment',
        'QueueStats'
      ],
    }),
  }),
});

export const {
  useGetQueueAssignmentsQuery,
  useGetQueueAssignmentByIdQuery,
  useGetQueueAssignmentsByVisitIdQuery,
  useCreateQueueAssignmentMutation,
  useUpdateQueueAssignmentMutation,
  useDeleteQueueAssignmentMutation,
  useGetQueueStatsQuery,
  useGetNextQueueNumberQuery,
  useAssignPatientToQueueMutation,
  useCompleteQueueAssignmentMutation,
  useExpireQueueAssignmentMutation,
} = queueAssignmentApi;
