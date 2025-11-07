import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { DicomSeries } from "@/interfaces/image-dicom/dicom-series.interface";
import { PaginatedQuery, PaginatedResponse } from "@/interfaces/pagination/pagination.interface";

export type SeriesReferenceType =
  | "study"
  | "seriesInstanceUid"
  | "order"
  | "modality";

type SeriesReferenceArgs = {
  id: string;
  type: SeriesReferenceType;
  params?: PaginatedQuery;
};

export const dicomSeriesApi = createApi({
  reducerPath: "dicomSeriesApi",
  baseQuery: axiosBaseQuery("/dicom-series"),
  tagTypes: ["DicomSeries", "DicomSeriesList"],
  endpoints: (builder) => ({
    getDicomSeriesPaginated: builder.query<
      ApiResponse<PaginatedResponse<DicomSeries[]>>,
      PaginatedQuery | void
    >({
      query: (params) => ({
        url: "/paginated",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result?.data?.data
          ? [
              ...result.data.data.map((series) => ({
                type: "DicomSeries" as const,
                id: series.id,
              })),
              { type: "DicomSeriesList", id: "LIST" },
            ]
          : [{ type: "DicomSeriesList", id: "LIST" }],
    }),

    getDicomSeriesById: builder.query<ApiResponse<DicomSeries>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DicomSeries", id }],
    }),

    getDicomSeriesByReference: builder.query<
      ApiResponse<PaginatedResponse<DicomSeries[]>>,
      SeriesReferenceArgs
    >({
      query: ({ id, type, params }) => ({
        url: `/reference/${id}`,
        method: "GET",
        params: { type, ...(params || {}) },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? result.data.data.map((series) => ({
              type: "DicomSeries" as const,
              id: series.id,
            }))
          : [],
    }),
  }),
});

export const {
  useGetDicomSeriesPaginatedQuery,
  useGetDicomSeriesByIdQuery,
  useLazyGetDicomSeriesByReferenceQuery,
} = dicomSeriesApi;

