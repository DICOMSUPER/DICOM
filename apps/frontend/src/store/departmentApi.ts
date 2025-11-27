import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { Department } from "@/interfaces/user/department.interface";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import { mapApiResponse } from "@/utils/adpater";
import { PaginatedResponse, QueryParams } from "@/interfaces/pagination/pagination.interface";

export interface DepartmentQueryParams extends QueryParams {
  includeInactive?: boolean;
  includeDeleted?: boolean;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  phoneNumber?: string;
  location?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  description?: string;
  headOfDepartment?: string;
  headDepartmentId?: string;
  phoneNumber?: string;
  location?: string;
  isActive?: boolean;
}

export interface DepartmentSearchFilters {
  name?: string;
  code?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface DepartmentStats {
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  totalRooms: number;
}

// ====== RTK QUERY API ======
export const departmentApi = createApi({
  reducerPath: "departmentApi",
  baseQuery: axiosBaseQuery("/departments"),
  tagTypes: ["Department", "Room"],
  endpoints: (builder) => ({
    // Get all departments with filters
    getDepartments: builder.query<PaginatedResponse<Department>, DepartmentQueryParams>({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters || {},
      }),
      transformResponse: (response: any) => mapApiResponse<Department>(response),
      providesTags: ["Department"],
    }),

    // Get department by ID
    getDepartmentById: builder.query<Department, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Department", id }],
    }),

    // Create department
    createDepartment: builder.mutation<Department, CreateDepartmentDto>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Department", "Room"],
    }),

    // Update department
    updateDepartment: builder.mutation<
      Department,
      { id: string; data: UpdateDepartmentDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Department", id },
        "Department",
        "Room",
      ],
    }),

    // Delete department
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department", "Room"],
    }),

    // Get department stats
    getDepartmentStats: builder.query<DepartmentStats, void>({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["Department"],
    }),
  }),
});

// ====== AUTO HOOKS ======
export const {
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentStatsQuery,
} = departmentApi;
