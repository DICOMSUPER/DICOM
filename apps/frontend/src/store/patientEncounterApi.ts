import { createApi } from "@reduxjs/toolkit/query/react";
import {
  PatientEncounter,
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
  EncounterSearchFilters,
  PaginatedResponse,
  EncounterStats,
  ApiResponse,
  EncounterStatsInDateRange,
} from "@/common/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import {
  FilterEncounterWithPaginationParams,
  PatientEncounterFilters,
} from "@/common/interfaces/patient/patient-visit.interface";
import {
  PaginatedQuery,
  PaginatedResponse as PaginationResponse,
} from "@/common/interfaces/pagination/pagination.interface";
import { roomApi } from "./roomsApi";

export const patientEncounterApi = createApi({
  reducerPath: "patientEncounterApi",
  baseQuery: axiosBaseQuery("/encounters"),
  tagTypes: ["PatientEncounter"],
  endpoints: (builder) => ({
    // Get all encounters with filters
    getPatientEncounters: builder.query<
      PatientEncounter[],
      EncounterSearchFilters
    >({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: {
          ...filters,
          sortField: filters?.sortBy, // Map sortBy to sortField for backend
          order: filters?.sortOrder, // Support both sortOrder and order
        },
      }),
      providesTags: ["PatientEncounter"],
    }),

    // Get encounters with pagination
    getPatientEncountersPaginated: builder.query<
      PaginatedResponse<PatientEncounter>,
      {
        page: number;
        limit: number;
        filters: Omit<EncounterSearchFilters, "limit" | "offset">;
      }
    >({
      query: ({ page, limit, filters }) => ({
        url: "/paginated",
        params: {
          page,
          limit,
          ...filters,
          sortField: filters?.sortBy, // Map sortBy to sortField for backend
          order: filters?.sortOrder, // Support both sortOrder and order
        },
        method: "GET",
      }),
      providesTags: ["PatientEncounter"],
    }),

    // Get encounter by ID
    getPatientEncounterById: builder.query<
      ApiResponse<PatientEncounter>,
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "PatientEncounter", id }],
    }),

    // Get encounters by patient
    // Note: axiosBaseQuery unwraps ApiResponse wrapper, so this returns PaginatedResponse directly
    getPatientEncountersByPatientId: builder.query<
      PaginatedResponse<PatientEncounter>,
      { patientId: string; pagination: PaginatedQuery }
    >({
      query: ({ patientId, pagination }) => ({
        url: `/patient/${patientId}`,
        method: "GET",
        params: pagination,
      }),
      providesTags: (result, error, { patientId }) => [
        { type: "PatientEncounter", id: `patient-${patientId}` },
      ],
    }),

    // Get encounters by physician
    getPatientEncountersByPhysicianId: builder.query<
      ApiResponse<PatientEncounter[]>,
      string
    >({
      query: (physicianId) => ({
        url: `/physician/${physicianId}`,
        method: "GET",
      }),
      providesTags: (result, error, physicianId) => [
        { type: "PatientEncounter", id: `physician-${physicianId}` },
      ],
    }),

    // Get encounter stats
    getPatientEncounterStats: builder.query<ApiResponse<EncounterStats>, void>({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      providesTags: ["PatientEncounter"],
    }),

    // Create encounter
    createPatientEncounter: builder.mutation<
      ApiResponse<PatientEncounter>,
      CreatePatientEncounterDto
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: (result, error, { patientId }) => [
        { type: "PatientEncounter", id: `patient-${patientId}` },
        "PatientEncounter",
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(roomApi.util.invalidateTags(["Room"]));
      },
    }),

    // Update encounter
    updatePatientEncounter: builder.mutation<
      ApiResponse<PatientEncounter>,
      { id: string; data: UpdatePatientEncounterDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PatientEncounter", id },
        "PatientEncounter",
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(roomApi.util.invalidateTags(["Room"]));
      },
    }),
    transferPatientEncounter: builder.mutation<
      ApiResponse<PatientEncounter>,
      { id: string; data: UpdatePatientEncounterDto }
    >({
      query: ({ id, data }) => ({
        url: `/transfer/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PatientEncounter", id },
        "PatientEncounter",
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(roomApi.util.invalidateTags(["Room"]));
      },
    }),
    // Delete encounter
    deletePatientEncounter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PatientEncounter"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(roomApi.util.invalidateTags(["Room"]));
      },
    }),

    getPatientEncountersInRoom: builder.query<
      PaginationResponse<PatientEncounter>,
      { filters?: PatientEncounterFilters }
    >({
      query: ({ filters }) => ({
        url: "/in-room",
        method: "GET",
        params: {
          ...filters,
        },
      }),
      providesTags: ["PatientEncounter"],
    }),

    getStatsInDateRange: builder.query<
      ApiResponse<EncounterStatsInDateRange>,
      { dateFrom: string; dateTo: string; roomId?: string }
    >({
      query: ({ dateFrom, dateTo, roomId }) => ({
        url: "/stats-in-date-range",
        method: "GET",
        params: {
          dateFrom,
          dateTo,
          roomId,
        },
      }),
      providesTags: ["PatientEncounter"],
    }),

    skipEncounter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}/skip`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PatientEncounter", id },
        "PatientEncounter",
      ],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(roomApi.util.invalidateTags(["Room"]));
      },
    }),

    filterEncounterWithPagination: builder.query<
      PaginatedResponse<PatientEncounter>,
      FilterEncounterWithPaginationParams
    >({
      query: (params) => ({
        url: "/filter",
        method: "GET",
        params: {
          ...params,
          sortField: params?.sortField || params?.sortBy, // Map sortBy to sortField for backend
          order: params?.order,
        },
      }),
      providesTags: ["PatientEncounter"],
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
  useGetPatientEncountersInRoomQuery,
  useGetStatsInDateRangeQuery,
  useSkipEncounterMutation,
  useFilterEncounterWithPaginationQuery,
  useTransferPatientEncounterMutation,
} = patientEncounterApi;
