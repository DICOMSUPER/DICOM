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

export const modalityMachineApi = createApi({
  baseQuery: axiosBaseQuery("/modality-machines"),
  reducerPath: "ModalityMachine",
  tagTypes: ["Modality", "ModalityMachine"],
  endpoints: (builder) => ({
    getAllModalityMachine: builder.query<ApiResponse<GetAll>, string | void>({
      query: (modalityId?: string) => ({
        url: "",
        method: "GET",
        params: modalityId ? { modalityId } : {},
      }),
    }),

    getModalityMachineById: builder.query<ApiResponse<GetOne>, string>({
      query: (id: string) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),

    getModalityMachinePaginated: builder.query<
      ApiResponse<PaginatedResponse<ModalityMachine>>,
      PaginatedQuery
    >({
      query: (query: PaginatedQuery) => ({
        url: "paginated",
        method: "GET",
        params: query,
      }),
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
    }),

    deleteModalityMachine: builder.mutation<
      ApiResponse<boolean>,
      { id: string }
    >({ query: (id) => ({ url: `/${id}`, method: "DELETE" }) }),

    getModalitiesInRoom: builder.query<GetAll, string>({
      query: (id) => ({ url: `/room/${id}`, method: "GET" }),
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
} = modalityMachineApi;
