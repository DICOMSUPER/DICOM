import DicomStudyReferenceQuery, {
  DicomStudy,
  DicomStudyFilterQuery,
  DicomStudyFilters,
  UpdateDicomStudyPayload,
} from "@/common/interfaces/image-dicom/dicom-study.interface";
import {
  PaginatedQuery,
  PaginatedResponse,
} from "@/common/interfaces/pagination/pagination.interface";
import { ApiResponse, DicomStudyStatsInDateRange } from "@/common/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

type StudyReferenceType =
  | "modality"
  | "order"
  | "patient"
  | "performingPhysician"
  | "technician"
  | "referringPhysician"
  | "studyInstanceUid";

type StudiesByReferenceArgs = {
  id: string;
  type: StudyReferenceType;
  params?: PaginatedQuery;
};

export const dicomStudyApi = createApi({
  reducerPath: "dicomStudyApi",
  baseQuery: axiosBaseQuery("/dicom-studies"),
  tagTypes: ["DicomStudy", "DicomStudies"],

  endpoints: (builder) => ({
    getAllDicomStudies: builder.query<ApiResponse<DicomStudy[]>, void>({
      query: () => ({ url: "", method: "GET" }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((s) => ({
                type: "DicomStudy" as const,
                id: s.id,
              })),
              { type: "DicomStudies", id: "LIST" },
            ]
          : [{ type: "DicomStudies", id: "LIST" }],
    }),

    getOneDicomStudy: builder.query<ApiResponse<DicomStudy>, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (r, e, id) => [{ type: "DicomStudy", id }],
    }),

    getDicomStudiesFilteredWithPagination: builder.query<
      PaginatedResponse<DicomStudy>,
      { filters?: DicomStudyFilters }
    >({
      query: ({ filters }) => ({
        url: "/filter-with-pagination",
        method: "GET",
        params: filters,
      }),
      keepUnusedDataFor: 60, // Keep cached data for 60 seconds
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((r) => ({
                type: "DicomStudy" as const,
                id: r.id,
              })),
              { type: "DicomStudy", id: "LIST" },
            ]
          : [{ type: "DicomStudy", id: "LIST" }],
    }),

    getPaginatedDicomStudies: builder.query<
      ApiResponse<PaginatedResponse<DicomStudy>>,
      PaginatedQuery
    >({
      query: (params) => ({ url: "/paginated", method: "GET", params }),
      providesTags: [{ type: "DicomStudies", id: "LIST" }],
    }),

    getDicomStudiesByReference: builder.query<
      ApiResponse<PaginatedResponse<DicomStudy>>,
      StudiesByReferenceArgs
    >({
      query: ({ id, type, params }) => ({
        url: `/reference/${id}`,
        method: "GET",
        params: { type, ...(params || {}) },
      }),
      providesTags: (result) =>
        result?.data?.data
          ? result.data.data.map((study) => ({
              type: "DicomStudy" as const,
              id: study.id,
            }))
          : [],
    }),

    getDicomStudiesFiltered: builder.query<
      ApiResponse<DicomStudy[]>,
      DicomStudyFilterQuery
    >({
      query: (filter) => ({ url: "/filter", method: "GET", params: filter }),
      providesTags: [{ type: "DicomStudies", id: "FILTERED" }],
    }),

    getDicomStudiesByOrderId: builder.query<ApiResponse<DicomStudy[]>, string>({
      query: (orderId) => ({
        url: `/order/${orderId}`,
        method: "GET",
      }),
      providesTags: (result, error, orderId) => [
        { type: "DicomStudies", id: `ORDER-${orderId}` },
      ],
    }),

    createDicomStudy: builder.mutation<
      ApiResponse<DicomStudy>,
      Partial<DicomStudy>
    >({
      query: (body) => ({
        url: "",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "DicomStudies", id: "LIST" }],
    }),

    updateDicomStudy: builder.mutation<
      ApiResponse<DicomStudy>,
      { id: string; data: Partial<UpdateDicomStudyPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          dicomStudyApi.util.updateQueryData(
            "getOneDicomStudy",
            id,
            (draft) => {
              Object.assign(draft.data, data);
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (r, e, { id }) => [
        { type: "DicomStudy", id },
        { type: "DicomStudies", id: "LIST" },
      ],
    }),

    deleteDicomStudy: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "DicomStudies", id: "LIST" }],
    }),

    useGetDicomStudyByReferenceId: builder.query<
      ApiResponse<PaginatedResponse<DicomStudy>>,
      DicomStudyReferenceQuery
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


    getStatsInDateRange: builder.query<
      DicomStudyStatsInDateRange,
      { dateFrom?: string; dateTo?: string; roomId?: string }
    >({
      query: ({ dateFrom, dateTo, roomId }) => ({
        url: "/stats-in-date-range",
        method: "GET",
        params: {
          dateFrom,
          dateTo,
          roomId,
        },
      }),
      transformResponse: (response: any) => {
        // Backend returns the stats directly in the format: { today: {...}, total: {...} }
        // If wrapped in ApiResponse, extract data; otherwise return as-is
        if (response?.data?.today && response?.data?.total) {
          return response.data;
        }
        return response;
      },
      providesTags: ["DicomStudy"],
    }),
  }),
});

export const {
  useGetAllDicomStudiesQuery,
  useGetPaginatedDicomStudiesQuery,
  useGetDicomStudiesByReferenceQuery,
  useLazyGetDicomStudiesByReferenceQuery,
  useGetOneDicomStudyQuery,
  useGetDicomStudiesFilteredQuery,
  useGetDicomStudiesByOrderIdQuery,
  useCreateDicomStudyMutation,
  useUpdateDicomStudyMutation,
  useDeleteDicomStudyMutation,
  useUseGetDicomStudyByReferenceIdQuery,
  useGetDicomStudiesFilteredWithPaginationQuery,
  useGetStatsInDateRangeQuery,
} = dicomStudyApi;
