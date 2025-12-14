import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { ApiResponse } from "@/common/interfaces/api-response/api-response.interface";
import { DicomInstance } from "@/common/interfaces/image-dicom/dicom-instances.interface";
import { PaginatedResponse } from "@/common/interfaces/pagination/pagination.interface";
import { CommonQueryParams } from "@/common/utils/queryString";

export type InstanceReferenceType = "sopInstanceUid" | "series";

type InstancesByReferenceArgs = {
  id: string;
  type: InstanceReferenceType;
  params?: CommonQueryParams;
};

export const dicomInstanceApi = createApi({
  reducerPath: "dicomInstanceApi",
  baseQuery: axiosBaseQuery("/dicom-instances"),
  tagTypes: ["DicomInstance"],
  endpoints: (builder) => ({
    getDicomInstancesPaginated: builder.query<
      PaginatedResponse<DicomInstance>,
      CommonQueryParams | void
    >({
      query: (params) => ({
        url: "/paginated",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((instance) => ({
                type: "DicomInstance" as const,
                id: instance.id,
              })),
              { type: "DicomInstance", id: "LIST" },
            ]
          : [{ type: "DicomInstance", id: "LIST" }],
    }),

    getDicomInstanceById: builder.query<DicomInstance, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DicomInstance", id }],
    }),

    getInstancesByReference: builder.query<
      ApiResponse<PaginatedResponse<DicomInstance>>,
      InstancesByReferenceArgs
    >({
      query: ({ id, type, params }) => ({
        url: `/reference/${id}`,
        method: "GET",
        params: { type, ...(params || {}) },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? result.data.data.map((instance) => ({
              type: "DicomInstance" as const,
              id: instance.id,
            }))
          : [],
    }),
  }),
});

export const {
  useGetDicomInstancesPaginatedQuery,
  useGetDicomInstanceByIdQuery,
  useGetInstancesByReferenceQuery,
  useLazyGetInstancesByReferenceQuery,
} = dicomInstanceApi;
