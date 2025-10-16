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
        body: data,
      }),
      invalidatesTags: ["QueueAssignment", "QueueStats"],
    }),

    updateQueueAssignment: builder.mutation<
      QueueAssignment,
      { id: string; data: UpdateQueueAssignmentDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
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
    getQueueStats: builder.query<QueueStats, void>({
      query: () => ({ url: "/stats", method: "GET" }),
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
        method: "PUT",
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
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "QueueAssignment", id },
        "QueueAssignment",
        "QueueStats",
      ],
    }),
    getQueueAssignmentsInRoom: builder.query<
      ApiResponse<PaginatedResponse<QueueAssignment>>,
      { userId: string; filters?: QueueAssignmentSearchFilters }
    >({
      query: ({ userId, filters }) => ({
        url: "/in-room",
        method:"GET",
        params: {
          userId,
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
  useGetQueueStatsQuery,
  useGetNextQueueNumberQuery,
  useAssignPatientToQueueMutation,
  useCompleteQueueAssignmentMutation,
  useExpireQueueAssignmentMutation,
} = queueAssignmentApi;
