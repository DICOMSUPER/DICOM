import {
  PaginatedQuery,
  PaginatedResponse,
} from "@/interfaces/pagination/pagination.interface";
import { ApiResponse } from "@/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import DicomStudyReferenceQuery, {
  DicomStudy,
  DicomStudyFilterQuery,
} from "@/interfaces/image-dicom/dicom-study.interface";
import { createApi } from "@reduxjs/toolkit/query/react";
import { string } from "zod";

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

    getPaginatedDicomStudies: builder.query<
      ApiResponse<PaginatedResponse<DicomStudy[]>>,
      PaginatedQuery
    >({
      query: (params) => ({ url: "/paginated", method: "GET", params }),
      providesTags: [{ type: "DicomStudies", id: "LIST" }],
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
      { id: string; data: Partial<DicomStudy> }
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
  }),
});

export const {
  useGetAllDicomStudiesQuery,
  useGetPaginatedDicomStudiesQuery,
  useGetOneDicomStudyQuery,
  useGetDicomStudiesFilteredQuery,
  useGetDicomStudiesByOrderIdQuery,
  useCreateDicomStudyMutation,
  useUpdateDicomStudyMutation,
  useDeleteDicomStudyMutation,
  useUseGetDicomStudyByReferenceIdQuery,
} = dicomStudyApi;
