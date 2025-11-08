import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import DicomSeriesReferenceQuery, {
  DicomSeries,
} from "@/interfaces/image-dicom/dicom-series.interface";
import { PaginatedResponse } from "@/interfaces/pagination/pagination.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

import { createApi } from "@reduxjs/toolkit/query/react";

export const dicomSeriesApi = createApi({
  reducerPath: "dicomSeriesApi",
  baseQuery: axiosBaseQuery("/dicom-series"),
  tagTypes: ["DicomSeries", "dicom-series", "series"],
  endpoints: (builder) => ({
    getDicomSeriesReferencedId: builder.query<
      ApiResponse<PaginatedResponse<DicomSeries>>,
      DicomSeriesReferenceQuery
    >({
      query: ({
        id,
        type,
        page,
        limit,
        search,
        searchField,
        sortBy,
        order,
      }) => ({
        url: `/reference/${id}`,
        method: "GET",
        params: { type, page, limit, search, searchField, sortBy, order },
      }),
    }),
  }),
});

export const { useGetDicomSeriesReferencedIdQuery } = dicomSeriesApi;
