// services/authApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../lib/axiosBaseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  endpoints: (builder) => ({
    login: builder.mutation<
      { token: string },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        data: credentials,
      }),
    }),
    getProfile: builder.query<any, void>({
      query: () => ({
        url: "/auth/profile",
        method: "GET",
      }),
    }),
  }),
});

export const { useLoginMutation, useGetProfileQuery } = authApi;
