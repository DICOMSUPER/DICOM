import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { ApiResponse } from "@/common/interfaces/api-response/api-response.interface";
import { DicomSeries } from "@/common/interfaces/image-dicom/dicom-series.interface";
import {
  PaginatedQuery,
  PaginatedResponse,
} from "@/common/interfaces/pagination/pagination.interface";

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
      ApiResponse<PaginatedResponse<DicomSeries>>,
      PaginatedQuery | void
    >({
      query: (params) => ({
        url: "/paginated",
        method: "GET",
        params,
      }),
      providesTags: (result) => {
        const seriesList = result?.data?.data;
        return seriesList
          ? [
              ...seriesList.map((series) => ({
                type: "DicomSeries" as const,
                id: series.id,
              })),
              { type: "DicomSeriesList", id: "LIST" },
            ]
          : [{ type: "DicomSeriesList", id: "LIST" }];
      },
    }),

    getDicomSeriesById: builder.query<ApiResponse<DicomSeries>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DicomSeries", id }],
    }),

    getDicomSeriesByReference: builder.query<
      ApiResponse<PaginatedResponse<DicomSeries>>,
      SeriesReferenceArgs
    >({
      query: ({ id, type, params }) => ({
        url: `/reference/${id}`,
        method: "GET",
        params: { type, ...(params || {}) },
      }),
      providesTags: (result) => {
        const seriesList = result?.data?.data;
        return seriesList
          ? seriesList.map((series) => ({
              type: "DicomSeries" as const,
              id: series.id,
            }))
          : [];
      },
    }),
  }),
});

export const {
  useGetDicomSeriesPaginatedQuery,
  useGetDicomSeriesByIdQuery,
  useGetDicomSeriesByReferenceQuery,
  useLazyGetDicomSeriesByReferenceQuery,
} = dicomSeriesApi;
