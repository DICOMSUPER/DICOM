import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  QueueAssignment,
  CreateQueueAssignmentDto,
  UpdateQueueAssignmentDto,
  QueueAssignmentSearchFilters,
  QueueStats,
} from "@/interfaces/patient/queue-assignment.interface";
import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const queueAssignmentApi = createApi({
  reducerPath: "queueAssignmentApi",
  baseQuery: axiosBaseQuery("/queue-assignments"),
  tagTypes: ["QueueAssignment", "QueueStats"],
  endpoints: (builder) => ({
    // Queue Assignment endpoints
    getQueueAssignments: builder.query<
      QueueAssignment[],
      QueueAssignmentSearchFilters
    >({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters,
      }),
      providesTags: ["QueueAssignment"],
    }),

    getQueueAssignmentById: builder.query<QueueAssignment, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "QueueAssignment", id }],
    }),

    getQueueAssignmentsByVisitId: builder.query<QueueAssignment[], string>({
      query: (visitId) => ({
        url: "",
        method: "GET",
        params: { visitId },
      }),
      providesTags: ["QueueAssignment"],
    }),

    createQueueAssignment: builder.mutation<
      QueueAssignment,
      CreateQueueAssignmentDto
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: ["QueueAssignment", "QueueStats"],
    }),

    updateQueueAssignment: builder.mutation<
      QueueAssignment,
      { id: string; data: UpdateQueueAssignmentDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "QueueAssignment", id },
        "QueueAssignment",
        "QueueStats",
      ],
    }),
    // skip queue assignment
    skipQueueAssignment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}/skip`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "QueueAssignment", id },
        "QueueAssignment",
        "QueueStats",
      ],
    }),

    deleteQueueAssignment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["QueueAssignment", "QueueStats"],
    }),

    // Queue Stats
    getQueueStats: builder.query<QueueStats, { date?: string; roomId?: string }>({
      query: ({ date, roomId }) => ({ url: "/stats", method: "GET", params: { date, roomId } }),
      providesTags: ["QueueStats"],
    }),

    
    // Utility endpoints
    getNextQueueNumber: builder.query<{ nextNumber: number }, void>({
      query: () => ({ url: "/next-number", method: "GET" }),
    }),

    // Convenience mutations
    assignPatientToQueue: builder.mutation<
      QueueAssignment,
      { visitId: string; priority?: string; roomId?: string }
    >({
      query: ({ visitId, priority = "routine", roomId }) => ({
        url: "/assign",
        method: "POST",
        body: { visitId, priority, roomId },
      }),
      invalidatesTags: ["QueueAssignment", "QueueStats"],
    }),

    completeQueueAssignment: builder.mutation<QueueAssignment, string>({
      query: (id) => ({
        url: `/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "QueueAssignment", id },
        "QueueAssignment",
        "QueueStats",
      ],
    }),

    expireQueueAssignment: builder.mutation<QueueAssignment, string>({
      query: (id) => ({
        url: `/${id}/expire`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "QueueAssignment", id },
        "QueueAssignment",
        "QueueStats",
      ],
    }),
    getQueueAssignmentsInRoom: builder.query<
      PaginatedResponse<QueueAssignment>,
      { filters?: QueueAssignmentSearchFilters }
    >({
      query: ({ filters }) => ({
        url: "/in-room",
        method: "GET",
        params: {
          ...filters,
        },
      }),
      providesTags: ["QueueAssignment"],
    }),
  }),
});

export const {
  useGetQueueAssignmentsInRoomQuery,
  //
  useGetQueueAssignmentsQuery,
  useGetQueueAssignmentByIdQuery,
  useGetQueueAssignmentsByVisitIdQuery,
  useCreateQueueAssignmentMutation,
  useUpdateQueueAssignmentMutation,
  useDeleteQueueAssignmentMutation,
  useSkipQueueAssignmentMutation,
  useGetQueueStatsQuery,
  useGetNextQueueNumberQuery,
  useAssignPatientToQueueMutation,
  useCompleteQueueAssignmentMutation,
  useExpireQueueAssignmentMutation,
} = queueAssignmentApi;
