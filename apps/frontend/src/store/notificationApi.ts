import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import {
  FilterNotificationDto,
  Notification,
} from "@/interfaces/system/notification.interface";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";

export const notificationApi = createApi({
  reducerPath: "notificationApi",
  baseQuery: axiosBaseQuery("/notifications"),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    // createNotification: builder.mutation<ApiResponse<Notification>, CreateNotificationDto>({
    //   query: (body) => ({ url: "", method: "POST", data: body }),
    //   invalidatesTags: [{ type: "Notification", id: "LIST" }],
    // }),
    getNotifications: builder.query<
      PaginatedResponse<Notification>,
      FilterNotificationDto | void
    >({
      query: (params) => ({ url: "", method: "GET", params }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((n) => ({
                type: "Notification" as const,
                id: n.id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    getNotificationById: builder.query<ApiResponse<Notification>, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Notification", id }],
    }),
    // updateNotification: builder.mutation<ApiResponse<Notification>, { id: string; data: UpdateNotificationDto }>({
    //   query: ({ id, data }) => ({ url: `/${id}`, method: "PUT", data }),
    //   invalidatesTags: (result, error, { id }) => [
    //     { type: "Notification", id },
    //     { type: "Notification", id: "LIST" },
    //   ],
    // }),
    deleteNotification: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),
    markAsRead: builder.mutation<ApiResponse<Notification>, string>({
      query: (id) => ({ url: `/${id}/read`, method: "PATCH" }),
      invalidatesTags: (result, error, id) => [
        { type: "Notification", id },
        { type: "Notification", id: "LIST" },
      ],
    }),
    markAllAsRead: builder.mutation<ApiResponse<Notification>, void>({
      query: () => ({ url: `/read-all`, method: "PATCH" }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),
    getNotificationsByUser: builder.query<
      ApiResponse<Notification[]>,
      { filter?: FilterNotificationDto }
    >({
      query: ({ filter }) => ({
        url: `/findMany`,
        method: "GET",
        params: filter,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((n) => ({
                type: "Notification" as const,
                id: n.id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),
    getUnreadCount: builder.query<number, void>({
      query: () => ({ url: `/unread-count`, method: "GET" }),
      providesTags: (result, error, userId) => [
        { type: "Notification", id: `UNREAD_COUNT_${userId}` },
      ],
    }),
  }),
});

export const {
  //   useCreateNotificationMutation,
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  //   useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetNotificationsByUserQuery,
  // useGetManyNotificationsQuery,
} = notificationApi;
