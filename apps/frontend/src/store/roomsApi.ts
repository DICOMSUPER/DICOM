import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { Room } from "@/interfaces/user/room.interface";
import { CreateRoomDto } from "@/interfaces/user/room.interface";
import { UpdateRoomDto } from "@/interfaces/user/room.interface";
import {
  PaginatedResponse,
  QueryParams,
} from "@/interfaces/pagination/pagination.interface";
import { mapApiResponse } from "@/utils/adpater";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { Roles } from "@/enums/user.enum";

export interface RoomSearchFilters {
  type?: string;
  status?: string;
  minCapacity?: number;
  maxCapacity?: number;
}

// ====== RTK QUERY API ======
export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: axiosBaseQuery("/rooms"),
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    // Get all rooms with filters
    getRooms: builder.query<PaginatedResponse<Room>, QueryParams>({
      query: (params) => ({
        url: "",
        method: "GET",
        params,
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

    // Create new room
    createRoom: builder.mutation<Room, CreateRoomDto>({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Room"],
    }),

    // Update room
    updateRoom: builder.mutation<Room, { id: string; data: UpdateRoomDto }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Room", id },
        "Room",
      ],
    }),

    // Delete room
    deleteRoom: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
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
  }),
});

// ====== AUTO-GENERATED HOOKS ======
export const {
  useGetRoomsQuery,
  useGetRoomsByDepartmentIdQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomsByDepartmentAndServiceQuery,
} = roomApi;
