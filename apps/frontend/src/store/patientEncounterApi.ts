import { createApi } from "@reduxjs/toolkit/query/react";
import {
  PatientEncounter,
  CreatePatientEncounterDto,
  UpdatePatientEncounterDto,
  EncounterSearchFilters,
  PaginatedResponse,
  EncounterStats,
  ApiResponse,
  PaginationParams,
} from "@/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

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
        params: filters,
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
        params: { page, limit, ...filters },
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
    getPatientEncountersByPatientId: builder.query<
      ApiResponse<PaginatedResponse<PatientEncounter>>,
      { patientId: string; pagination: PaginationParams }
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
    getPatientEncounterStats: builder.query<EncounterStats, void>({
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
    }),

    // Delete encounter
    deletePatientEncounter: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PatientEncounter"],
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
