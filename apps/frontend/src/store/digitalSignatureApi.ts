import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import {
  DigitalSignature,
  PublicKeyResponse,
  SetupSignatureDto,
  SignatureResponse,
  SignDataDto,
  VerifyResponse,
  VerifySignatureDto,
} from "@/interfaces/user/digital-signature.interface";

// Types/Interfaces

export const digitalSignatureApi = createApi({
  reducerPath: "digitalSignatureApi",
  baseQuery: axiosBaseQuery("/digital-signature"),
  tagTypes: ["DigitalSignature", "HasSignature"],
  endpoints: (builder) => ({
    setupSignature: builder.mutation<
      ApiResponse<DigitalSignature>,
      SetupSignatureDto
    >({
      query: (dto) => ({
        url: "/setup",
        method: "POST",
        data: dto,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "DigitalSignature", id: userId },
        "DigitalSignature",
        "HasSignature",
      ],
    }),

    // Sign data with PIN
    signData: builder.mutation<SignatureResponse, SignDataDto>({
      query: (dto) => ({
        url: "/sign",
        method: "POST",
        data: dto,
      }),
    }),

    // Verify signature
    verifySignature: builder.mutation<VerifyResponse, VerifySignatureDto>({
      query: (dto) => ({
        url: "/verify",
        method: "POST",
        data: dto,
      }),
    }),

    // Get public key by userId
    getPublicKey: builder.query<PublicKeyResponse, string>({
      query: (userId) => ({ url: `/public-key/${userId}`, method: "GET" }),
      providesTags: (result, error, userId) => [
        { type: "DigitalSignature", id: userId },
      ],
    }),

    // Get digital signature by ID
    getDigitalSignatureById: builder.query<
      ApiResponse<DigitalSignature>,
      string
    >({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "DigitalSignature", id }],
    }),

    removeSignature: builder.mutation<{ message: string }, string>({
      query: (userId) => ({
        url: `/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "DigitalSignature", id: userId },
        "DigitalSignature",
      ],
    }),
    hasSignature: builder.query<ApiResponse<{ hasSignature: boolean }>, void>({
      query: () => ({
        url: `/has-signature`,
        method: "GET",
      }),
      providesTags: ["HasSignature"],
    }),
  }),
});

export const {
  useSetupSignatureMutation,
  useSignDataMutation,
  useVerifySignatureMutation,
  useGetPublicKeyQuery,
  useGetDigitalSignatureByIdQuery,
  useRemoveSignatureMutation,
  useHasSignatureQuery,
} = digitalSignatureApi;
