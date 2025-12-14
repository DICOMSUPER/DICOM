import { ApiResponse } from "@/common/interfaces/patient/patient-workflow.interface";
import {
  CreateServiceDto,
  Services,
  UpdateServiceDto,
} from "@/common/interfaces/user/service.interface";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  PaginatedQuery,
  PaginatedResponse,
} from "@/common/interfaces/pagination/pagination.interface";

export interface ServicePaginatedQuery extends PaginatedQuery {
  includeInactive?: boolean;
  includeDeleted?: boolean;
}

export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
}

export const serviceApi = createApi({
  reducerPath: "serviceApi",
  baseQuery: axiosBaseQuery("/services"),
  tagTypes: ["Service", "ServiceList", "ServiceRoom", "ServiceRoomList", "RoomService"],
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
      PaginatedResponse<Services>,
      ServicePaginatedQuery | void
    >({
      query: (params = {}) => ({
        url: "/paginated",
        method: "GET",
        params: {
          page: params?.page,
          limit: params?.limit,
          search: params?.search,
          searchField: params?.searchField,
          sortField: params?.sortBy,
          order: params?.order,
          includeInactive: params?.includeInactive,
          includeDeleted: params?.includeDeleted,
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "Service" as const,
                id,
              })),
              { type: "ServiceList" as const, id: "PAGINATED" },
            ]
          : [{ type: "ServiceList" as const, id: "PAGINATED" }],
    }),

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
        "ServiceRoomList",
        { type: "ServiceRoom", id: "LIST" },
        "RoomService",
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
        "ServiceRoomList",
        { type: "ServiceRoom", id: "LIST" },
        "RoomService",
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
        "ServiceRoomList",
        { type: "ServiceRoom", id: "LIST" },
        "RoomService",
      ],
    }),

    // Get service stats
    getServiceStats: builder.query<ServiceStats, void>({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["Service"],
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
  useGetServiceStatsQuery,
} = serviceApi;
