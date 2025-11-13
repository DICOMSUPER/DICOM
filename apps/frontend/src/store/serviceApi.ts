import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import {
  CreateServiceDto,
  Services,
  UpdateServiceDto,
} from "@/interfaces/user/service.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  PaginatedQuery,
  PaginatedResponse,
} from "@/interfaces/pagination/pagination.interface";

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: axiosBaseQuery("/services"),
  tagTypes: ["Service", "ServiceList"],
  endpoints: (builder) => ({
    // Get all services (non-paginated)
    getServices: builder.query<ApiResponse<Services[]>, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Service" as const,
                id,
              })),
              { type: "ServiceList" as const, id: "LIST" },
            ]
          : [{ type: "ServiceList" as const, id: "LIST" }],
    }),

    // Get paginated services
    getServicesPaginated: builder.query<
      ApiResponse<PaginatedResponse<Services>>,
      PaginatedQuery | void
    >({
      query: (params = {}) => ({
        url: "/paginated",
        method: "GET",
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          searchField: params?.searchField,
          sortBy: params?.sortBy,
          order: params?.order,
        },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map(({ id }) => ({
                type: "Service" as const,
                id,
              })),
              { type: "ServiceList" as const, id: "PAGINATED" },
            ]
          : [{ type: "ServiceList" as const, id: "PAGINATED" }],
    }),

    // Get active services by department ID
    getActiveServicesByDepartmentId: builder.query<
      ApiResponse<Services[]>,
      string
    >({
      query: (departmentId) => ({
        url: `/${departmentId}/department`,
        method: "GET",
      }),
      providesTags: (result, error, departmentId) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Service" as const,
                id,
              })),
              {
                type: "ServiceList" as const,
                id: `DEPARTMENT_${departmentId}`,
              },
            ]
          : [
              {
                type: "ServiceList" as const,
                id: `DEPARTMENT_${departmentId}`,
              },
            ],
    }),

    // Get service by ID
    getServiceById: builder.query<ApiResponse<Services>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Service", id }],
    }),

    // Create service
    createService: builder.mutation<ApiResponse<Services>, CreateServiceDto>({
      query: (createServiceDto) => ({
        url: "",
        method: "POST",
        data: createServiceDto,
      }),
      invalidatesTags: [
        { type: "ServiceList", id: "LIST" },
        { type: "ServiceList", id: "PAGINATED" },
      ],
    }),

    // Update service
    updateService: builder.mutation<
      ApiResponse<Services>,
      { id: string; updateServiceDto: UpdateServiceDto }
    >({
      query: ({ id, updateServiceDto }) => ({
        url: `/${id}`,
        method: "PATCH",
        data: updateServiceDto,
      }),
      invalidatesTags: (result, error, { id, updateServiceDto }) => [
        { type: "Service", id },
        { type: "ServiceList", id: "LIST" },
        { type: "ServiceList", id: "PAGINATED" },
      ],
    }),

    // Delete service
    deleteService: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Service", id },
        { type: "ServiceList", id: "LIST" },
        { type: "ServiceList", id: "PAGINATED" },
      ],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useGetServicesPaginatedQuery,
  useGetActiveServicesByDepartmentIdQuery,
  useGetServiceByIdQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = serviceApi;
