import { ApiResponse } from "@/common/interfaces/api-response/api-response.interface";
import {
    PaginatedResponse
} from "@/common/interfaces/pagination/pagination.interface";
import {
    AiAnalysis,
    CreateAiAnalysisDto,
    FilterAiAnalysisDto,
    SubmitFeedbackDto,
} from "@/common/interfaces/system/ai-analysis.interface";
import { AiResultDiagnosis } from "@/common/interfaces/system/ai-result.interface";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const aiAnalysisApi = createApi({
  reducerPath: "aiAnalysisApi",
  baseQuery: axiosBaseQuery("/ai-analyses"),
  tagTypes: ["AiAnalysis"],
  endpoints: (builder) => ({
    getAiAnalysisPaginated: builder.query<
      PaginatedResponse<AiAnalysis>,
      { filters?: FilterAiAnalysisDto }
    >({
      query: ({ filters }) => ({ url: "", method: "GET", params: filters }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((r) => ({
                type: "AiAnalysis" as const,
                id: r.analysisId,
              })),
              { type: "AiAnalysis", id: "LIST" },
            ]
          : [{ type: "AiAnalysis", id: "LIST" }],
    }),
    diagnosisImageByAI: builder.mutation<
      ApiResponse<AiResultDiagnosis>,
      { base64Image: string; aiModelId?: string, modelName?: string, versionName?: string, selectedStudyId?: string, folder: string }
    >({
      query: (body) => ({
        url: "/diagnosis-image",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [
        { type: "AiAnalysis", id: "LIST" },
        { type: "AiAnalysis", id: "STATS" },
      ],
    }),

    getAiAnalysisById: builder.query<ApiResponse<AiAnalysis>, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "AiAnalysis", id }],
    }),

    createAiAnalysis: builder.mutation<
      ApiResponse<AiAnalysis>,
      CreateAiAnalysisDto
    >({
      query: (body) => ({ url: "", method: "POST", data: body }),
      invalidatesTags: [
        { type: "AiAnalysis", id: "LIST" },
        { type: "AiAnalysis", id: "STATS" },
      ],
    }),

    deleteAiAnalysis: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "AiAnalysis", id },
        { type: "AiAnalysis", id: "LIST" },
        { type: "AiAnalysis", id: "STATS" },
      ],
    }),

    submitFeedback: builder.mutation<
      ApiResponse<AiAnalysis>,
      { id: string; feedback: SubmitFeedbackDto }
    >({
      query: ({ id, feedback }) => ({
        url: `/${id}/feedback`,
        method: "POST",
        data: feedback,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "AiAnalysis", id },
        { type: "AiAnalysis", id: "LIST" },
      ],
    }),
    exportToExcel: builder.mutation<
      Blob,
      {
        fromDate?: string;
        toDate?: string;
        status?: string;
        isHelpful?: boolean;
      }
    >({
      query: (filters) => ({
        url: "/export-excel",
        method: "POST",
        data: filters,
        responseType: "blob",
      }),
      // Don't cache blob response to avoid serialization issues
      extraOptions: { maxRetries: 0 },
    }),

    getAiAnalysisStats: builder.query<
      ApiResponse<{data:{
        total: number;
        completed: number;
        failed: number;
        pending: number;
      }}>,
      void
    >({
      query: () => ({ url: "/stats", method: "GET" }),
      providesTags: [{ type: "AiAnalysis", id: "STATS" }],
    }),
  }),
});

export const {
  useGetAiAnalysisPaginatedQuery,
  useGetAiAnalysisByIdQuery,
  useCreateAiAnalysisMutation,
  useDeleteAiAnalysisMutation,
  useDiagnosisImageByAIMutation,
  useSubmitFeedbackMutation,
  useExportToExcelMutation,
  useGetAiAnalysisStatsQuery,
} = aiAnalysisApi;
