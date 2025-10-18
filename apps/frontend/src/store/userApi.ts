import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from '@/lib/axiosBaseQuery';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
  isVerified: boolean;
  role?: string;
  departmentId?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

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
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery(''),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    getAllUsers: builder.query<PaginatedResponse<User>, UserFilters>({
      query: (params) => ({
        url: '/user/users',
        method: 'GET',
        params,
      }),
      providesTags: ['User'],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    createUser: builder.mutation<User, Partial<User>>({
      query: (data) => ({
        url: '/user/register',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['User'],
    }),

    updateUser: builder.mutation<User, { id: string; updates: Partial<User> }>({
      query: ({ id, updates }) => ({
        url: `/user/${id}`,
        method: 'PATCH',
        data: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        'User'
      ],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

