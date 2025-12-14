import { ApiResponse } from "@/common/interfaces/api-response/api-response.interface";
import { ICreateImagingOrderForm, IImagingOrderForm, ImagingOrderFormFilters } from "@/common/interfaces/image-dicom/imaging-order-form.interface";
import { PaginatedResponse, QueryParams } from "@/common/interfaces/pagination/pagination.interface";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { mapApiResponse } from "@/common/utils/adpater";
import { createApi } from "@reduxjs/toolkit/query/react";

export const imagingOrderFormApi = createApi({
  reducerPath: "imagingOrderFormApi",
  baseQuery: axiosBaseQuery("/imaging-order-form"),
  tagTypes: ["ImagingOrderForm"],
  endpoints: (builder) => ({
    // GET /imaging-order-form (paginated)
    getImagingOrderFormPaginated: builder.query<
      PaginatedResponse<IImagingOrderForm>,
       { filters?: ImagingOrderFormFilters }
    >({
      query: ({ filters }) => ({ url: "", method: "GET", params: filters }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((r) => ({
                type: "ImagingOrderForm" as const,
                id: r.id,
              })),
              { type: "ImagingOrderForm", id: "LIST" },
            ]
          : [{ type: "ImagingOrderForm", id: "LIST" }],
    }),

    // GET /imaging-order-form/patient/:patientId
    getImagingOrderFormsByPatientId: builder.query<
      PaginatedResponse<IImagingOrderForm>,
      { patientId: string } & QueryParams
    >({
      query: ({ patientId, ...params }) => ({
        url: `/patient/${patientId}`,
        method: "GET",
        params,
      }),
      transformResponse: (response: any) =>
        mapApiResponse<IImagingOrderForm>(response),
      providesTags: ["ImagingOrderForm"],
    }),


    getImagingOrderFormById: builder.query<ApiResponse<IImagingOrderForm>, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "ImagingOrderForm", id }],
    }),


    createImagingOrderForm: builder.mutation<ApiResponse<IImagingOrderForm>, ICreateImagingOrderForm>({
      query: (body) => ({ url: "", method: "POST", data: body }),
      invalidatesTags: ["ImagingOrderForm"],
    }),


    deleteImagingOrderForm: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "ImagingOrderForm", id },
        { type: "ImagingOrderForm", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetImagingOrderFormPaginatedQuery,
  useGetImagingOrderFormsByPatientIdQuery,
  useGetImagingOrderFormByIdQuery,
  useCreateImagingOrderFormMutation,
  useDeleteImagingOrderFormMutation,
} = imagingOrderFormApi;