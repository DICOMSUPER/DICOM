import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { RequestProcedure } from "@/interfaces/image-dicom/request-procedure.interface";
import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";


export const requestProcedureApi = createApi({
  reducerPath: "requestProcedureApi",
  baseQuery: axiosBaseQuery("/request-procedure"),
  tagTypes: ["RequestProcedure"],
  endpoints: (builder) => ({
    getAllRequestProcedures: builder.query<ApiResponse<RequestProcedure[]>, { bodyPartId?: string; modalityId?: string } | void>({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters,
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map((r) => ({ type: "RequestProcedure" as const, id: r.id })), { type: "RequestProcedure", id: "LIST" }]
          : [{ type: "RequestProcedure", id: "LIST" }],
    }),

    getRequestProceduresPaginated: builder.query<
      PaginatedResponse<RequestProcedure>,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "paginated",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [...result.data.map((r) => ({ type: "RequestProcedure" as const, id: r.id })), { type: "RequestProcedure", id: "LIST" }]
          : [{ type: "RequestProcedure", id: "LIST" }],
    }),

    getRequestProcedureById: builder.query<RequestProcedure, string>({
      query: (id) => ({ url: `${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "RequestProcedure", id }],
    }),

    createRequestProcedure: builder.mutation<RequestProcedure, Partial<RequestProcedure>>({
      query: (body) => ({ url: "", method: "POST", body }),
      invalidatesTags: [{ type: "RequestProcedure", id: "LIST" }],
    }),

    updateRequestProcedure: builder.mutation<RequestProcedure, { id: string; body: Partial<RequestProcedure> }>({
      query: ({ id, body }) => ({ url: `${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "RequestProcedure", id }, { type: "RequestProcedure", id: "LIST" }],
    }),

    deleteRequestProcedure: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [{ type: "RequestProcedure", id }, { type: "RequestProcedure", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAllRequestProceduresQuery,
  useGetRequestProceduresPaginatedQuery,
  useGetRequestProcedureByIdQuery,
  useCreateRequestProcedureMutation,
  useUpdateRequestProcedureMutation,
  useDeleteRequestProcedureMutation,
} = requestProcedureApi;