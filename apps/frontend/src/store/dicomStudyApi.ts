import {
  PaginatedQuery,
  PaginatedResponse,
} from "@/interfaces/pagination/pagination.interface";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import {
  DicomStudy,
  DicomStudyFilterQuery,
} from "@/interfaces/image-dicom/dicom-study.interface";
import { createApi } from "@reduxjs/toolkit/query/react";

export const dicomStudyApi = createApi({
  reducerPath: "dicomStudyApi",
  baseQuery: axiosBaseQuery("/dicom-studies"),
  tagTypes: ["DicomStudy", "DicomStudies", "Studies"],
  endpoints: (builder) => ({
    getAllDicomStudies: builder.query<ApiResponse<DicomStudy[]>, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),

    getPaginatedDicomStudies: builder.query<
      ApiResponse<PaginatedResponse<DicomStudy[]>>,
      PaginatedQuery
    >({
      query: (query) => ({ url: "/paginated", method: "GET", params: query }),
    }),

    getOneDicomStudy: builder.query<ApiResponse<DicomStudy>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
    }),

    getDicomStudiesFiltered: builder.query<
      ApiResponse<DicomStudy[]>,
      DicomStudyFilterQuery
    >({
      query: (filter) => ({
        url: "/filter",
        method: "GET",
        params: filter,
      }),
    }),
  }),
});

export const {
  useGetDicomStudiesFilteredQuery,
  useGetAllDicomStudiesQuery,
  useGetOneDicomStudyQuery,
  useGetPaginatedDicomStudiesQuery,
} = dicomStudyApi;
