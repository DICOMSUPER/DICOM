import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { User } from "@/common/interfaces/user/user.interface";
import { ApiResponse } from "@/common/interfaces/api-response/api-response.interface";

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
  excludeRole?: string;
  isActive?: boolean;
  departmentId?: string;
  includeInactive?: boolean;
  includeDeleted?: boolean;
  sortBy?: string; // Field to sort by
  order?: "asc" | "desc"; // Sort order
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
}

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: axiosBaseQuery("/user"),
  tagTypes: ["User", "Profile"],
  endpoints: (builder) => ({
    getAllUsers: builder.query<PaginatedResponse<User>, UserFilters>({
      query: (params) => ({
        url: "/users",
        method: "GET",
        params: {
          ...params,
          sortField: params?.sortBy,  
          order: params?.order,
        },
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

    getCurrentProfile: builder.query<ApiResponse<User>, void>({
      query: () => ({
        url: "/profile",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),

    getUserStats: builder.query<UserStats, void>({
      query: () => ({
        url: "/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response,
      providesTags: ["User"],
    }),

    createStaffAccount: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: "/users",
        method: "POST",
        data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUsersByRoomQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useCreateUserMutation,
  useCreateStaffAccountMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetCurrentProfileQuery,
  useGetUserStatsQuery,
} = userApi;

export default userApi;
