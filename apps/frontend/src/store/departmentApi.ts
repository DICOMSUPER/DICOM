import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

// ====== INTERFACES ======
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: string;
  phoneNumber?: string;
  location?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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

// ====== RTK QUERY API ======
export const departmentApi = createApi({
  reducerPath: "departmentApi",
  baseQuery: axiosBaseQuery("/departments"),
  tagTypes: ["Department"],
  endpoints: (builder) => ({
    // Get all departments with filters
    getDepartments: builder.query<
      { data: Department[]; pagination?: any },
      DepartmentSearchFilters
    >({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters,
      }),
      transformResponse: (response: any) => {
        // ⚡ Tự động unwrap data nếu backend trả lồng nhau
        const departments = response?.data?.data?.data ?? response;
        const pagination = response?.data?.data?.pagination;
        return { data: departments, pagination };
      },
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
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Department"],
    }),

    // Update department
    updateDepartment: builder.mutation<
      Department,
      { id: string; data: UpdateDepartmentDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Department", id },
        "Department",
      ],
    }),

    // Delete department
    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
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
} = departmentApi;
