import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { DigitalSignature } from "@/interfaces/user/digital-signature.interface";
import { PaginatedResponse, QueryParams } from "@/interfaces/pagination/pagination.interface";

// DTO để tạo mới chữ ký số
export interface CreateDigitalSignatureDto {
  userId: string;
  pin: string;
}

// DTO để ký dữ liệu
export interface SignDataDto {
  pin: string;
  data: string;
}

// Response khi ký thành công
export interface SignDataResponse {
  signatureId: string;
  signature: string;
  publicKey: string;
}

// DTO để verify chữ ký
export interface VerifySignatureDto {
  data: string;
  signature: string;
  publicKey: string;
}

// Response khi verify
export interface VerifySignatureResponse {
  isValid: boolean;
}

// DTO để cập nhật chữ ký số
export interface UpdateDigitalSignatureDto {
  keyName?: string;
  pin?: string;
  isActive?: boolean;
}

// Các bộ lọc tìm kiếm chữ ký số
export interface DigitalSignatureSearchFilters {
  userId?: string;
  keyName?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// ====== RTK QUERY API ======
export const digitalSignatureApi = createApi({
  reducerPath: "digitalSignatureApi",
  baseQuery: axiosBaseQuery("/digital-signature"),
  tagTypes: ["DigitalSignature"],
  endpoints: (builder) => ({
    // Lấy danh sách chữ ký số với filter
    getDigitalSignatures: builder.query<PaginatedResponse<DigitalSignature>, QueryParams>({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters || {},
      }),
      providesTags: ["DigitalSignature"],
    }),

    // Lấy chữ ký theo ID
    getDigitalSignatureById: builder.query<DigitalSignature, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DigitalSignature", id }],
    }),

    // Setup chữ ký mới (tạo keypair)
    setupDigitalSignature: builder.mutation<{ message: string }, CreateDigitalSignatureDto>({
      query: (body) => ({
        url: "/setup",
        method: "POST",
        body,
      }),
      invalidatesTags: ["DigitalSignature"],
    }),

    // Ký dữ liệu
    signData: builder.mutation<SignDataResponse, SignDataDto>({
      query: (data) => ({
        url: "/sign",
        method: "POST",
        data
      }),
    }),

    // Verify chữ ký
    verifySignature: builder.mutation<VerifySignatureResponse, VerifySignatureDto>({
      query: (body) => ({
        url: "/verify",
        method: "POST",
        body,
      }),
    }),

    // Lấy public key của user
    getPublicKey: builder.query<{ publicKey: string }, string>({
      query: (userId) => ({
        url: `/public-key/${userId}`,
        method: "GET",
      }),
    }),

    // Cập nhật chữ ký
    updateDigitalSignature: builder.mutation<
      DigitalSignature,
      { id: string; data: UpdateDigitalSignatureDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DigitalSignature", id },
        "DigitalSignature",
      ],
    }),

    // Xóa chữ ký
    deleteDigitalSignature: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DigitalSignature"],
    }),
  }),
});

// ====== AUTO HOOKS ======
export const {
  useGetDigitalSignaturesQuery,
  useGetDigitalSignatureByIdQuery,
  useSetupDigitalSignatureMutation,
  useSignDataMutation,
  useVerifySignatureMutation,
  useGetPublicKeyQuery,
  useUpdateDigitalSignatureMutation,
  useDeleteDigitalSignatureMutation,
} = digitalSignatureApi;