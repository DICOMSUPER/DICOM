import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { BodyPart } from "@/interfaces/image-dicom/body-part.interface";
import { PaginatedResponse } from "./scheduleApi";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";

export const bodyPartApi = createApi({
  reducerPath: "bodyPartApi",
  baseQuery: axiosBaseQuery("/body-parts/"),
  tagTypes: ["BodyPart"],
  endpoints: (builder) => ({
    // GET /body-part
    getAllBodyParts: builder.query<ApiResponse<BodyPart[]>, void>({
      query: () => ({ url: "", method: "GET" }),
      providesTags: (result) =>
        result
          ? [...result.data.map((r) => ({ type: "BodyPart" as const, id: r.id })), { type: "BodyPart", id: "LIST" }]
          : [{ type: "BodyPart", id: "LIST" }],
    }),

    getBodyPartsPaginated: builder.query<
      PaginatedResponse<BodyPart>,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "paginated",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
            ...result.data.map((r) => ({
              type: "BodyPart" as const,
              id: r.id,
            })),
            { type: "BodyPart", id: "LIST" },
          ]
          : [{ type: "BodyPart", id: "LIST" }],
    }),

    getBodyPartById: builder.query<BodyPart, string>({
      query: (id) => ({ url: `${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "BodyPart", id }],
    }),
    createBodyPart: builder.mutation<BodyPart, Partial<BodyPart>>({
      query: (body) => ({ url: "", method: "POST", body }),
      invalidatesTags: [{ type: "BodyPart", id: "LIST" }],
    }),
    updateBodyPart: builder.mutation<
      BodyPart,
      { id: string; body: Partial<BodyPart> }
    >({
      query: ({ id, body }) => ({ url: `${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BodyPart", id },
        { type: "BodyPart", id: "LIST" },
      ],
    }),

    deleteBodyPart: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "BodyPart", id },
        { type: "BodyPart", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllBodyPartsQuery,
  useGetBodyPartsPaginatedQuery,
  useGetBodyPartByIdQuery,
  useCreateBodyPartMutation,
  useUpdateBodyPartMutation,
  useDeleteBodyPartMutation,
} = bodyPartApi;
