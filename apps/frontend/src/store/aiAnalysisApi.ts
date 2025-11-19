import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import {
    PaginatedResponse
} from "@/interfaces/pagination/pagination.interface";
import {
    AiAnalysis,
    CreateAiAnalysisDto,
    FilterAiAnalysisDto,
} from "@/interfaces/system/ai-analysis.interface";
import { AiResultDiagnosis } from "@/interfaces/system/ai-result.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
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
    //       @Post('/diagnosis-image')
    //   @Public()
    //   async diagnosisImageByAI(
    //     @Body()
    //     body: {
    //       base64Image: string;
    //       aiModelId?: string;
    //     }
    //   ) {
    //     return this.systemService.send(
    //       'SystemService.AiAnalysis.DiagnosisImage',
    //       body
    //     );
    //   }
    diagnosisImageByAI: builder.mutation<
      ApiResponse<AiResultDiagnosis>,
      { base64Image: string; aiModelId?: string }
    >({
      query: (body) => ({
        url: "/diagnosis-image",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["AiAnalysis"],
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
      invalidatesTags: ["AiAnalysis"],
    }),

    deleteAiAnalysis: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "AiAnalysis", id },
        { type: "AiAnalysis", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAiAnalysisPaginatedQuery,
  useGetAiAnalysisByIdQuery,
  useCreateAiAnalysisMutation,
  useDeleteAiAnalysisMutation,
  useDiagnosisImageByAIMutation,
} = aiAnalysisApi;
