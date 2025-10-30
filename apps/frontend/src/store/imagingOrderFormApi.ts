import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { ICreateImagingOrderForm, IImagingOrderForm, ImagingOrderFormFilters } from "@/interfaces/image-dicom/imaging-order-form.interface";
import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const imagingOrderFormApi = createApi({
  reducerPath: "imagingOrderFormApi",
  baseQuery: axiosBaseQuery("/imaging-order-form"),
  tagTypes: ["ImagingOrderForm"],
  endpoints: (builder) => ({
    // GET /imaging-orders
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



    getImagingOrderFormById: builder.query<IImagingOrderForm, string>({
      query: (id) => ({ url: `${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "ImagingOrderForm", id }],
    }),

    createImagingOrderForm: builder.mutation<ApiResponse<IImagingOrderForm>, ICreateImagingOrderForm>({
      query: (body) => ({ url: "", method: "POST", data: body }),
      invalidatesTags: [{ type: "ImagingOrderForm", id: "LIST" }],
    }),

    // PATCH /imaging-orders/:id
    // updateImagingOrder: builder.mutation<ImagingOrder, { id: string; body: UpdateImagingOrderDto }>({
    //   query: ({ id, body }) => ({ url: `${id}`, method: "PATCH", body }),
    //   invalidatesTags: (result, error, { id }) => [{ type: "ImagingOrder", id }, { type: "ImagingOrder", id: "LIST" }],
    // }),

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
  // useGetAllImagingOrderFormsQuery,
  useGetImagingOrderFormPaginatedQuery,
  useGetImagingOrderFormByIdQuery,
  useCreateImagingOrderFormMutation,
//   useUpdateImagingOrderMutation,
  useDeleteImagingOrderFormMutation,
} = imagingOrderFormApi;
