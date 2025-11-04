import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";
import {
  CreateImagingOrderDto,
  ImagingOrder,
  UpdateImagingOrderDto,
} from "@/interfaces/image-dicom/imaging-order.interface";
import { ApiResponse } from "@/services/imagingApi";
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

    getImagingOrderById: builder.query<ImagingOrder, string>({
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
      PaginatedResponse<ImagingOrder>,
      { patientId: string; page?: number; limit?: number }
    >({
      query: ({ patientId, page, limit }) => ({
        url: `/patient/${patientId}`,
        method: "GET",
        params: { page, limit },
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

    getImagingOrderByRoomIdFilter: builder.query<
      ApiResponse<ImagingOrder[]>,
      RoomFilter
    >({
      query: ({ id, filterParams }) => ({
        url: `/${id}/room/filter`,
        method: "GET",
        params: filterParams,
      }),
    }),

    getOrderStatsForRoom: builder.query<ApiResponse<unknown>, string>({
      query: (id) => ({
        url: `/${id}/room-stats`,
        method: "GET",
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

  useGetImagingOrdersByPatientIdQuery,
  //   useUpdateImagingOrderMutation,

  useUpdateImagingOrderMutation,
  useDeleteImagingOrderMutation,
} = imagingOrderApi;
