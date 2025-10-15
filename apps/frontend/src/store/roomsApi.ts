import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

// ====== INTERFACES ======
export interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  status: "available" | "occupied" | "maintenance";
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoomDto {
  name: string;
  type: string;
  capacity: number;
}

export interface UpdateRoomDto {
  name?: string;
  type?: string;
  capacity?: number;
  status?: "available" | "occupied" | "maintenance";
}

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
    getRooms: builder.query<Room[], RoomSearchFilters>({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters,
      }),
      providesTags: ["Room"],
    }),

    // Get room by ID
    getRoomById: builder.query<Room, string>({
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
        body: data,
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
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),
  }),
});

// ====== AUTO-GENERATED HOOKS ======
export const {
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomApi;
