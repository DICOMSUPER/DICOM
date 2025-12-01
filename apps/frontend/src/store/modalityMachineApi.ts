import { MachineStatus } from "@/enums/machine-status.enum";
import {
  CreateModalityMachineDto,
  ModalityMachine,
  UpdateModalityMachineDto,
} from "@/interfaces/image-dicom/modality-machine.interface";
import {
  PaginatedQuery,
  PaginatedResponse,
} from "@/interfaces/pagination/pagination.interface";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

import { createApi } from "@reduxjs/toolkit/query/react";

export interface GetAll {
  data: ModalityMachine[];
}

export interface GetOne {
  data: ModalityMachine;
}

export interface ModalityMachineStats {
  totalMachines: number;
  activeMachines: number;
  inactiveMachines: number;
  maintenanceMachines: number;
}

export const modalityMachineApi = createApi({
  baseQuery: axiosBaseQuery("/modality-machines"),
  reducerPath: "ModalityMachine",
  tagTypes: ["Modality", "ModalityMachine"],
  endpoints: (builder) => ({
    getAllModalityMachine: builder.query<
      PaginatedResponse<ModalityMachine>,
      {
        modalityId?: string;
        roomId?: string;
        status?: MachineStatus;
        machineName?: string;
        manufacturer?: string;
        serialNumber?: string;
        model?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        order?: 'asc' | 'desc';
      }
    >({
      query: ({
        modalityId,
        roomId,
        status,
        machineName,
        manufacturer,
        serialNumber,
        model,
        page,
        limit,
        sortBy,
        order,
      }) => ({
        url: "",
        method: "GET",
        params: {
          modalityId,
          roomId,
          status,
          machineName,
          manufacturer,
          serialNumber,
          model,
          page,
          limit,
          sortBy,
          order,
        },
      }),
      transformResponse: (response: any) => {
        if (response?.data) {
          return response.data;
        }
        return response;
      },
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map((machine) => ({
                type: "ModalityMachine" as const,
                id: machine.id,
              })),
              { type: "ModalityMachine", id: "LIST" },
            ]
          : [{ type: "ModalityMachine", id: "LIST" }],
    }),

    getModalityMachineById: builder.query<ApiResponse<GetOne>, string>({
      query: (id: string) => ({
        url: `/${id}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        // Ensure the response structure is correct and modality relation is included
        // Response should be: { success: true, data: { data: ModalityMachine } }
        // ModalityMachine should have modality relation included from backend
        if (response?.data?.data) {
          // Log if modality is missing (for debugging)
          if (!response.data.data.modality && response.data.data.modalityId) {
            console.warn('Modality relation missing in response for machine:', response.data.data.id);
          }
        }
        return response;
      },
      providesTags: (_result, _error, id) => [{ type: "ModalityMachine", id }],
    }),

    getModalityMachinePaginated: builder.query<
      PaginatedResponse<ModalityMachine>,
      PaginatedQuery & { includeDeleted?: boolean }
    >({
      query: (query: PaginatedQuery & { includeDeleted?: boolean }) => ({
        url: "/paginated",
        method: "GET",
        params: {
          ...query,
          sortField: query?.sortBy, // Map sortBy to sortField for backend
          order: query?.order,
        },
      }),
      transformResponse: (response: any) => {
        // Handle nested response structure
        if (response?.data && Array.isArray(response.data)) {
          return {
            data: response.data,
            total: response.total ?? 0,
            page: response.page ?? 1,
            limit: response.limit ?? 10,
            totalPages: response.totalPages ?? Math.ceil((response.total ?? 0) / (response.limit ?? 10)),
            hasNextPage: response.hasNextPage ?? false,
            hasPreviousPage: response.hasPreviousPage ?? false,
          };
        }
        // Handle direct response
        return response;
      },
      providesTags: (result) => {
        const machines = result?.data ?? [];
        return machines.length > 0
          ? [
              ...machines.map((machine: ModalityMachine) => ({
                type: "ModalityMachine" as const,
                id: machine.id,
              })),
              { type: "ModalityMachine", id: "LIST" },
            ]
          : [{ type: "ModalityMachine", id: "LIST" }];
      },
    }),

    createModalityMachine: builder.mutation<
      ApiResponse<GetOne>,
      CreateModalityMachineDto
    >({
      query: (data: CreateModalityMachineDto) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: () => [{ type: "ModalityMachine", id: "LIST" }],
    }),

    updateModalityMachine: builder.mutation<
      ApiResponse<GetOne>,
      { id: string; data: UpdateModalityMachineDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ModalityMachine", id },
        { type: "ModalityMachine", id: "LIST" },
      ],
    }),

    deleteModalityMachine: builder.mutation<
      ApiResponse<boolean>,
      { id: string }
    >({
      query: ({ id }) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "ModalityMachine", id },
        { type: "ModalityMachine", id: "LIST" },
      ],
    }),

    getModalitiesInRoom: builder.query<GetAll, string>({
      query: (id) => ({ url: `/room/${id}`, method: "GET" }),
      transformResponse: (response: any) => {
        // Handle wrapped API response: { success: true, data: ModalityMachine[], ... }
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data };
        }
        // Handle direct array response
        if (Array.isArray(response)) {
          return { data: response };
        }
        // Handle GetAll structure
        return response || { data: [] };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((r) => ({
                type: "ModalityMachine" as const,
                id: r.id,
              })),
              { type: "ModalityMachine", id: "LIST" },
            ]
          : [{ type: "ModalityMachine", id: "LIST" }],
    }),

    // Get modality machine stats
    getModalityMachineStats: builder.query<
      ModalityMachineStats,
      { roomId?: string }
    >({
      query: ({ roomId }) => ({
        url: "/stats",
        method: "GET",
        params: { roomId },
      }),
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["ModalityMachine"],
    }),
  }),
});

export const {
  useGetAllModalityMachineQuery,
  useGetModalityMachineByIdQuery,
  useGetModalityMachinePaginatedQuery,
  useGetModalitiesInRoomQuery,
  useCreateModalityMachineMutation,
  useUpdateModalityMachineMutation,
  useDeleteModalityMachineMutation,
  useGetModalityMachineStatsQuery,
} = modalityMachineApi;
