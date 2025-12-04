import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";
import {
  CreateImagingOrderDto,
  ImagingOrder,
  QueueInfo,
  UpdateImagingOrderDto,
} from "@/interfaces/image-dicom/imaging-order.interface";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { ImagingOrderStatus } from "@/enums/image-dicom.enum";

export interface RoomFilter {
  id: string;
  filterParams: {
    modalityId?: string;
    orderStatus?: ImagingOrderStatus;
    procedureId?: string;
    bodyPart?: string;
    mrn?: string;
    patientFirstName?: string;
    patientLastName?: string;
    startDate?: Date | string;
    endDate?: Date | string;
  };
}

export const imagingOrderApi = createApi({
  reducerPath: "imagingOrderApi",
  baseQuery: axiosBaseQuery("/imaging-orders"),
  tagTypes: ["ImagingOrder"],
  endpoints: (builder) => ({
    // GET /imaging-orders
    getAllImagingOrders: builder.query<ImagingOrder[], void>({
      query: () => ({ url: "", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((r) => ({
                type: "ImagingOrder" as const,
                id: r.id,
              })),
              { type: "ImagingOrder", id: "LIST" },
            ]
          : [{ type: "ImagingOrder", id: "LIST" }],
    }),

    getImagingOrdersPaginated: builder.query<
      PaginatedResponse<ImagingOrder>,
      {
        page?: number;
        limit?: number;
        search?: string;
        searchField?: string;
        sortField?: string;
        order?: string;
      } | void
    >({
      query: (params) => ({ url: "/paginated", method: "GET", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((r) => ({
                type: "ImagingOrder" as const,
                id: r.id,
              })),
              { type: "ImagingOrder", id: "LIST" },
            ]
          : [{ type: "ImagingOrder", id: "LIST" }],
    }),

    findByReferenceId: builder.query<
      PaginatedResponse<ImagingOrder>,
      {
        id: string;
        type: "physician" | "room" | "patient" | "visit";
        page?: number;
        limit?: number;
        search?: string;
      }
    >({
      query: ({ id, type, page, limit, search }) => ({
        url: "/find-by-reference",
        method: "GET",
        params: { id, type, page, limit, search },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((r) => ({
                type: "ImagingOrder" as const,
                id: r.id,
              })),
              { type: "ImagingOrder", id: "LIST" },
            ]
          : [{ type: "ImagingOrder", id: "LIST" }],
    }),

    getImagingOrderById: builder.query<ApiResponse<ImagingOrder>, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "ImagingOrder", id }],
    }),

    createImagingOrder: builder.mutation<ImagingOrder, CreateImagingOrderDto>({
      query: (body) => ({ url: "", method: "POST", data: body }),
      invalidatesTags: [{ type: "ImagingOrder", id: "LIST" }],
    }),

    updateImagingOrder: builder.mutation<
      ImagingOrder,
      { id: string; body: UpdateImagingOrderDto }
    >({
      query: ({ id, body }) => ({ url: `/${id}`, method: "PATCH", data: body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ImagingOrder", id },
        { type: "ImagingOrder", id: "LIST" },
      ],
    }),

    deleteImagingOrder: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "ImagingOrder", id },
        { type: "ImagingOrder", id: "LIST" },
      ],
    }),

    //find  by id patient
    getImagingOrdersByPatientId: builder.query<
      ImagingOrder[],
      { patientId: string }
    >({
      query: ({ patientId }) => ({
        url: `/patient/${patientId}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        // Handle nested pagination structure: { data: [...], total: 1 }
        if (response && typeof response === 'object' && 'data' in response) {
          if (Array.isArray(response.data)) {
            return response.data;
          }
        }
        // Handle direct array
        if (Array.isArray(response)) {
          return response;
        }
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map((r) => ({
                type: "ImagingOrder" as const,
                id: r.id,
              })),
              { type: "ImagingOrder", id: "LIST" },
            ]
          : [{ type: "ImagingOrder", id: "LIST" }],
    }),

    getImagingOrderByRoomIdFilter: builder.query<
      PaginatedResponse<ImagingOrder>,
      RoomFilter & { page?: number; limit?: number; sortBy?: string; order?: 'asc' | 'desc' }
    >({
      query: ({ id, filterParams, page, limit, sortBy, order }) => ({
        url: `/${id}/room/filter`,
        method: "GET",
        params: {
          ...filterParams,
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
    }),

    getOrderStatsForRoom: builder.query<ApiResponse<QueueInfo>, string>({
      query: (id) => ({
        url: `/${id}/room-stats`,
        method: "GET",
      }),
    }),

    getOrderStatsForRoomInDate: builder.query<
      ApiResponse<QueueInfo>,
      { id: string; startDate?: Date | string; endDate?: Date | string }
    >({
      query: ({ id, startDate, endDate }) => ({
        url: `/${id}/room-stats-in-date`,
        method: "GET",
        params: {
          startDate:
            startDate instanceof Date
              ? startDate?.toISOString()?.split("T")[0]
              : startDate,
          endDate:
            endDate instanceof Date
              ? endDate?.toISOString()?.split("T")[0]
              : endDate,
        },
      }),
    }),
  }),
});

export const {
  useGetAllImagingOrdersQuery,
  useGetImagingOrdersPaginatedQuery,
  useFindByReferenceIdQuery,
  useGetImagingOrderByIdQuery,
  useCreateImagingOrderMutation,
  useGetImagingOrderByRoomIdFilterQuery,
  useGetOrderStatsForRoomQuery,
  useGetOrderStatsForRoomInDateQuery,
  useGetImagingOrdersByPatientIdQuery,
  //   useUpdateImagingOrderMutation,

  useUpdateImagingOrderMutation,
  useDeleteImagingOrderMutation,
} = imagingOrderApi;
