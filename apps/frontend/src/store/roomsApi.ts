import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { Room } from "@/interfaces/user/room.interface";
import { CreateRoomDto } from "@/interfaces/user/room.interface";
import { UpdateRoomDto } from "@/interfaces/user/room.interface";
import {
  PaginatedResponse,
  QueryParams,
} from "@/interfaces/pagination/pagination.interface";

export interface RoomQueryParams extends QueryParams {
  includeInactive?: boolean;
  includeDeleted?: boolean;
}
import { mapApiResponse } from "@/utils/adpater";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { Roles } from "@/enums/user.enum";

export interface RoomSearchFilters {
  type?: string;
  status?: string;
  minCapacity?: number;
  maxCapacity?: number;
}

export interface RoomStats {
  totalRooms: number;
  activeRooms: number;
  inactiveRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  maintenanceRooms: number;
}

// ====== RTK QUERY API ======
export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: axiosBaseQuery("/rooms"),
  tagTypes: [
    "Room",
    "ServiceRoom",
    "ServiceRoomList",
    "RoomService",
    "ModalityMachine",
  ],
  endpoints: (builder) => ({
    // Get all rooms with filters
    getRooms: builder.query<PaginatedResponse<Room>, RoomQueryParams>({
      query: (params) => ({
        url: "",
        method: "GET",
        params: {
          ...params,
          sortField: params?.sort || params?.sortBy, // Map sort/sortBy to sortField for backend
          order: params?.order,
        },
      }),
      transformResponse: (response: any) => mapApiResponse<Room>(response),
      providesTags: ["Room"],
    }),

    // Get rooms by departmentID
    getRoomsByDepartmentId: builder.query<
      ApiResponse<Room[]>,
      {
        id: string;
        search?: string;
        applyScheduleFilter?: boolean;
        role?: Roles;
      }
    >({
      query: ({ id, search, applyScheduleFilter, role }) => ({
        url: `/${id}/department`,
        method: "GET",
        params: {
          search: search || "",
          applyScheduleFilter: applyScheduleFilter || false,
          role: role || undefined,
        },
      }),
    }),

    // Get room by ID
    getRoomById: builder.query<ApiResponse<{ room: Room }>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Room", id }],
    }),
    getRoomByDepartmentIdV2: builder.query<
      ApiResponse<{ data: Room[] }>,
      string
    >({
      query: (departmentId) => ({
        url: `/department/${departmentId}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Room", id }],
    }),

    // Create new room
    createRoom: builder.mutation<ApiResponse<{ room: Room }>, CreateRoomDto>({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: [
        "Room",
        "ServiceRoomList",
        { type: "ServiceRoom", id: "LIST" },
        "RoomService",
        { type: "ModalityMachine", id: "LIST" },
      ],
    }),

    // Update room
    updateRoom: builder.mutation<Room, { id: string; data: UpdateRoomDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Room", id },
        "Room",
        "ServiceRoomList",
        { type: "ServiceRoom", id: "LIST" },
        "RoomService",
        { type: "ModalityMachine", id: "LIST" },
      ],
    }),

    // Delete room
    deleteRoom: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        "Room",
        "ServiceRoomList",
        { type: "ServiceRoom", id: "LIST" },
        "RoomService",
        { type: "ModalityMachine", id: "LIST" },
      ],
    }),

    getRoomsByDepartmentAndService: builder.query<
      ApiResponse<Room[]>,
      { serviceId: string; departmentId: string; role?: Roles }
    >({
      query: ({ serviceId, departmentId, role }) => ({
        url: "/by-department-and-service",
        method: "GET",
        params: { serviceId, departmentId, role },
      }),
    }),

    // Get room stats
    getRoomStats: builder.query<RoomStats, void>({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["Room"],
    }),
  }),
});

// ====== AUTO-GENERATED HOOKS ======
export const {
  useGetRoomsQuery,
  useGetRoomsByDepartmentIdQuery,
  useGetRoomByDepartmentIdV2Query,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomsByDepartmentAndServiceQuery,
  useGetRoomStatsQuery,
} = roomApi;
