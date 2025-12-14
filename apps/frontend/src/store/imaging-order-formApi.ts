import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { mapApiResponse } from "@/common/utils/adpater";
import { ApiResponse } from "@/common/interfaces/api-response/api-response.interface";
import {
  PaginatedResponse,
  QueryParams,
} from "@/common/interfaces/pagination/pagination.interface";
import {
  ImagingOrderForm,
} from "@/common/interfaces/image-dicom/imaging-order-form.interface";

/**
 * ==============================
 *  Imaging Order Form API (by Room)
 * ==============================
 */

export const imagingOrderFormApi = createApi({
  reducerPath: "imagingOrderFormApi",
  baseQuery: axiosBaseQuery("/imaging-order-form"),
  tagTypes: ["ImagingOrderForm"],

  endpoints: (builder) => ({
    getImagingOrderFormsByPatientId: builder.query<
      PaginatedResponse<ImagingOrderForm>,
      { patientId: string } & QueryParams
    >({
      query: ({ patientId, ...params }) => ({
        url: `/patient/${patientId}`,
        method: "GET",
        params,
      }),
      transformResponse: (response: any) =>
        mapApiResponse<ImagingOrderForm>(response),
      providesTags: ["ImagingOrderForm"],
    }),


    getImagingOrderFormById: builder.query<ApiResponse<ImagingOrderForm>, string>(
      {
        query: (id) => ({
          url: `/${id}`,
          method: "GET",
        }),
        providesTags: (result, error, id) => [
          { type: "ImagingOrderForm", id },
        ],
      }
    ),

    // createImagingOrderForm: builder.mutation<
    //   ApiResponse<ImagingOrderForm>,
    //   Partial<ImagingOrderForm>
    // >({
    //   query: (data) => ({
    //     url: "",
    //     method: "POST",
    //     data,
    //   }),
    //   invalidatesTags: ["ImagingOrderForm"],
    // }),

    // updateImagingOrderForm: builder.mutation<
    //   ApiResponse<ImagingOrderForm>,
    //   { id: string; data: Partial<ImagingOrderForm> }
    // >({
    //   query: ({ id, data }) => ({
    //     url: `/${id}`,
    //     method: "PATCH",
    //     data,
    //   }),
    //   invalidatesTags: (result, error, { id }) => [
    //     { type: "ImagingOrderForm", id },
    //     "ImagingOrderForm",
    //   ],
    // }),

    deleteImagingOrderForm: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ImagingOrderForm"],
    }),
  }),
});

// =============================
// Auto-generated hooks
// =============================
export const {
  useGetImagingOrderFormsByPatientIdQuery,
  useGetImagingOrderFormByIdQuery,
//   useCreateImagingOrderFormMutation,
//   useUpdateImagingOrderFormMutation,
  useDeleteImagingOrderFormMutation,
} = imagingOrderFormApi;
