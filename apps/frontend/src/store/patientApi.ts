import {
  ApiResponse,
  CreatePatientDto,
  PaginatedResponse,
  Patient,
  PatientOverview,
  PatientSearchFilters,
  PatientStats,
  UpdatePatientDto,
} from "@/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface IRepositoryPagination {
  page?: number;
  limit?: number;
  searchField?: string;
  search?: string;
  sortField?: string;
  order?: "asc" | "desc";
  relation?: string[];
}

export const patientApi = createApi({
  reducerPath: "patientApi",
  baseQuery: axiosBaseQuery("/patients"),
  tagTypes: ["Patient", "Encounter", "Diagnosis", "Stats"],
  endpoints: (builder) => ({
    // Patient endpoints
    getPatients: builder.query<ApiResponse<Patient[]>, IRepositoryPagination>({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters,
      }),
      providesTags: ["Patient"],
    }),

    getPatientsPaginated: builder.query<
      PaginatedResponse<Patient>,
      {
        page: number;
        limit: number;
        filters: Omit<PatientSearchFilters, "limit" | "offset">;
      }
    >({
      query: ({ page, limit, filters }) => ({
        url: "/paginated",
        method: "GET",
        params: { page, limit, ...filters },
      }),
      providesTags: ["Patient"],
    }),

    getPatientById: builder.query<ApiResponse<Patient>, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Patient", id }],
    }),

    getPatientByCode: builder.query<ApiResponse<Patient>, string>({
      query: (patientCode) => ({ url: `/code/${patientCode}`, method: "GET" }),
      providesTags: (result, error, patientCode) => [
        { type: "Patient", id: patientCode },
      ],
    }),

    getPatientOverview: builder.query<ApiResponse<PatientOverview>, string>({
      query: (patientCode) => ({
        url: `/overview/${patientCode}`,
        method: "GET",
      }),
      providesTags: (result, error, patientCode) => [
        { type: "Patient", id: patientCode },
      ],
    }),

    searchPatientsByName: builder.query<
      Patient[],
      { searchTerm: string; limit?: number }
    >({
      query: ({ searchTerm, limit = 10 }) => ({
        url: "/search",
        method: "GET",
        params: { q: searchTerm, limit },
      }),
      providesTags: ["Patient"],
    }),

    createPatient: builder.mutation<Patient, CreatePatientDto>({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Patient", "Stats"],
    }),

    updatePatient: builder.mutation<
      Patient,
      { id: string; data: UpdatePatientDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Patient", id },
        "Patient",
        "Stats",
      ],
    }),

    deletePatient: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Patient", "Stats"],
    }),

    restorePatient: builder.mutation<Patient, string>({
      query: (id) => ({
        url: `/${id}/restore`,
        method: "POST",
      }),
      invalidatesTags: ["Patient", "Stats"],
    }),

    getPatientStats: builder.query<ApiResponse<PatientStats>, void>({
      query: () => ({ url: "/stats", method: "GET" }),
      providesTags: ["Stats"],
    }),
  }),
});

export const {
  // Patient hooks
  useGetPatientOverviewQuery,
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
} = patientApi;
