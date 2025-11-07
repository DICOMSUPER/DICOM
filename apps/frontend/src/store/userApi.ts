import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { User } from "@/interfaces/user/user.interface";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: boolean;
  departmentId?: string;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: axiosBaseQuery("/user"),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getAllUsers: builder.query<PaginatedResponse<User>, UserFilters>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params,
      }),
      providesTags: ["User"],
    }),

    getUsersByRoom: builder.query<
      ApiResponse<User[]>,
      { roomId: string; role: string; search?: string }
    >({
      query: ({ roomId, role, search }) => ({
        url: `/${roomId}/room`,
        method: "GET",
        params: { role, search },
      }),
      providesTags: ["User"],
    }),

    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "/register",
        method: "POST",
        data,
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation<User, { id: string; updates: Partial<User> }>({
      query: ({ id, updates }) => ({
        url: `/${id}`,
        method: "PATCH",
        data: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUsersByRoomQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

export default userApi;
