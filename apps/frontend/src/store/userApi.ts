import { User } from "@/interfaces/user/user.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: axiosBaseQuery("/user"),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUsersByRoom: builder.query<
      User[],
      { roomId: string; role: string; search?: string }
    >({
      query: ({ roomId, role, search }) => ({
        url: `/${roomId}/room`,
        method: "GET",
        params: { role, search },
      }),
      providesTags: ["User"],
    }),

    getUserById: builder.query<User, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: ["User"],
    }),
  }),
});

export const { useGetUsersByRoomQuery, useGetUserByIdQuery } = userApi;
export default userApi;
