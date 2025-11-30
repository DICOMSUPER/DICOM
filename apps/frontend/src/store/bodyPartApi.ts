import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { BodyPart } from "@/interfaces/imaging/body-part.interface";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import { mapApiResponse } from "@/utils/adpater";
import { PaginatedResponse, QueryParams } from "@/interfaces/pagination/pagination.interface";

export interface CreateBodyPartDto {
  name: string;
  description?: string;
}

export interface UpdateBodyPartDto {
  name?: string;
  description?: string;
}

export interface BodyPartQueryParams extends QueryParams {
  includeInactive?: boolean;
  includeDeleted?: boolean;
  sortBy?: string; // Alias for sort field
  order?: "asc" | "desc"; // Sort order
}

// ====== RTK QUERY API ======
export const bodyPartApi = createApi({
  reducerPath: "bodyPartApi",
  baseQuery: axiosBaseQuery("/body-part"),
  tagTypes: ["BodyPart"],
  endpoints: (builder) => ({
    // Get all body parts (non-paginated)
    getAllBodyParts: builder.query<ApiResponse<BodyPart[]>, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return { data: response.data };
        }
        if (Array.isArray(response)) {
          return { data: response };
        }
        return response || { data: [] };
      },
      providesTags: ["BodyPart"],
    }),

    // Get all body parts with filters (paginated)
    getBodyParts: builder.query<PaginatedResponse<BodyPart>, BodyPartQueryParams | void>({
      query: (filters) => ({
        url: "/paginated",
        method: "GET",
        params: {
          ...filters,
          sortField: filters?.sortBy || filters?.sort,
          order: filters?.order,
        },
      }),
      transformResponse: (response: any) => mapApiResponse<BodyPart>(response),
      providesTags: ["BodyPart"],
    }),

    // Get body part by ID
    getBodyPartById: builder.query<BodyPart, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "BodyPart", id }],
    }),

    // Create body part
    createBodyPart: builder.mutation<BodyPart, CreateBodyPartDto>({
      query: (body) => ({
        url: "",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BodyPart"],
    }),

    // Update body part
    updateBodyPart: builder.mutation<
      BodyPart,
      { id: string; data: UpdateBodyPartDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "BodyPart", id },
        "BodyPart",
      ],
    }),

    // Delete body part
    deleteBodyPart: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BodyPart"],
    }),
  }),
});

// ====== AUTO HOOKS ======
export const {
  useGetAllBodyPartsQuery,
  useGetBodyPartsQuery,
  useGetBodyPartByIdQuery,
  useCreateBodyPartMutation,
  useUpdateBodyPartMutation,
  useDeleteBodyPartMutation,
} = bodyPartApi;

// Alias for paginated query
export const useGetBodyPartsPaginatedQuery = useGetBodyPartsQuery;
