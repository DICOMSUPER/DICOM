import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import {
  CreateServiceRoomDto,
  FilterServiceRoomDto,
  ServiceRoom,
  UpdateServiceRoomDto,
} from "@/interfaces/user/service-room.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface ServiceRoomStats {
  totalAssignments: number;
  activeAssignments: number;
  inactiveAssignments: number;
  uniqueRooms: number;
}

const serviceRoomApi = createApi({
  reducerPath: "serviceRoomApi",
  baseQuery: axiosBaseQuery("/service-rooms"),
  tagTypes: ["ServiceRoom", "RoomService", "ServiceRoomList"],
  endpoints: (builder) => ({
    // Create service room assignment
    createServiceRoom: builder.mutation<ServiceRoom, CreateServiceRoomDto>({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: ["ServiceRoomList", { type: "ServiceRoom", id: "LIST" }],
    }),

    // Get paginated service rooms
    getServiceRoomsPaginated: builder.query<
      PaginatedResponse<ServiceRoom>,
      FilterServiceRoomDto
    >({
      query: (params) => ({
        url: "/paginated",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "ServiceRoom" as const,
                id,
              })),
              { type: "ServiceRoom", id: "LIST" },
              "ServiceRoomList",
            ]
          : [{ type: "ServiceRoom", id: "LIST" }, "ServiceRoomList"],
    }),

    // Get all service rooms without pagination
    getAllServiceRooms: builder.query<
      ApiResponse<ServiceRoom[]>,
      FilterServiceRoomDto
    >({
      query: (params) => ({
        url: "",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: "ServiceRoom" as const,
                id,
              })),
              { type: "ServiceRoom", id: "LIST" },
              "ServiceRoomList",
            ]
          : [{ type: "ServiceRoom", id: "LIST" }, "ServiceRoomList"],
    }),

    // Get rooms by service ID
    getRoomsByService: builder.query<ApiResponse<ServiceRoom[]>, string>({
      query: (serviceId) => ({
        url: `/service/${serviceId}`,
        method: "GET",
      }),
      providesTags: (result, error, serviceId) => [
        { type: "RoomService", id: serviceId },
        "ServiceRoomList",
      ],
    }),

    // Get services by room ID
    getServicesByRoom: builder.query<ApiResponse<ServiceRoom[]>, string>({
      query: (roomId) => ({
        url: `/room/${roomId}`,
        method: "GET",
      }),
      providesTags: (result, error, roomId) => [
        { type: "RoomService", id: roomId },
        "ServiceRoomList",
      ],
    }),

    // Get single service room by ID
    getServiceRoomById: builder.query<ApiResponse<ServiceRoom>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ServiceRoom", id }],
    }),

    // Update service room
    updateServiceRoom: builder.mutation<
      ApiResponse<ServiceRoom>,
      { id: string; data: UpdateServiceRoomDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ServiceRoom", id },
        { type: "ServiceRoom", id: "LIST" },
        "ServiceRoomList",
        "RoomService",
      ],
    }),

    // Delete service room
    deleteServiceRoom: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ServiceRoom", id },
        { type: "ServiceRoom", id: "LIST" },
        "ServiceRoomList",
        "RoomService",
      ],
    }),

    // Get service room stats
    getServiceRoomStats: builder.query<ServiceRoomStats, void>({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["ServiceRoomList"],
    }),
  }),
});

export const {
  useCreateServiceRoomMutation,
  useGetServiceRoomsPaginatedQuery,
  useGetAllServiceRoomsQuery,
  useGetRoomsByServiceQuery,
  useGetServicesByRoomQuery,
  useGetServiceRoomByIdQuery,
  useUpdateServiceRoomMutation,
  useDeleteServiceRoomMutation,
  useGetServiceRoomStatsQuery,
} = serviceRoomApi;

export default serviceRoomApi;
