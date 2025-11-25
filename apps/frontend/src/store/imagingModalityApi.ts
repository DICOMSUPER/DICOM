import { ImagingModality } from "@/interfaces/image-dicom/imaging_modality.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import {
  PaginatedQuery,
  PaginatedResponse,
} from "@/interfaces/pagination/pagination.interface";

export interface CreateImagingModalityDto {
  modalityCode?: string;
  modalityName?: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateImagingModalityDto = Partial<CreateImagingModalityDto>;

export const imagingModalityApi = createApi({
  reducerPath: "imagingModalityApi",
  baseQuery: axiosBaseQuery("/imaging-modalities"),
  tagTypes: ["ImagingModality", "ImagingModalityList"],
  endpoints: (builder) => ({
    getAllImagingModality: builder.query<
      ApiResponse<ImagingModality[]>,
      void
    >({
      query: () => ({
        url: "",
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "ImagingModality" as const,
                id,
              })),
              { type: "ImagingModalityList" as const, id: "LIST" },
            ]
          : [{ type: "ImagingModalityList" as const, id: "LIST" }],
    }),

    getImagingModalityPaginated: builder.query<
      PaginatedResponse<ImagingModality>,
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
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "ImagingModality" as const,
                id,
              })),
              { type: "ImagingModalityList" as const, id: "PAGINATED" },
            ]
          : [{ type: "ImagingModalityList" as const, id: "PAGINATED" }],
    }),

    getImagingModalityById: builder.query<
      ApiResponse<ImagingModality>,
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "ImagingModality", id },
      ],
    }),

    createImagingModality: builder.mutation<
      ApiResponse<ImagingModality>,
      CreateImagingModalityDto
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: () => [{ type: "ImagingModalityList", id: "LIST" }],
    }),

    updateImagingModality: builder.mutation<
      ApiResponse<ImagingModality>,
      { id: string; data: UpdateImagingModalityDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ImagingModality", id },
        { type: "ImagingModalityList", id: "LIST" },
        { type: "ImagingModalityList", id: "PAGINATED" },
      ],
    }),

    deleteImagingModality: builder.mutation<
      ApiResponse<boolean>,
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ImagingModality", id },
        { type: "ImagingModalityList", id: "LIST" },
        { type: "ImagingModalityList", id: "PAGINATED" },
      ],
    }),
  }),
});

export const {
  useGetAllImagingModalityQuery,
  useGetImagingModalityPaginatedQuery,
  useGetImagingModalityByIdQuery,
  useCreateImagingModalityMutation,
  useUpdateImagingModalityMutation,
  useDeleteImagingModalityMutation,
} = imagingModalityApi;
