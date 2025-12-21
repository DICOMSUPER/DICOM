import { TemplateType } from "@/common/enums/report-template.enum";
import { ApiResponse } from "@/common/interfaces/api-response/api-response.interface";
import { ReportTemplate } from "@/common/interfaces/patient/report-template.interface";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { PaginatedResponse } from "./scheduleApi";

export const reportTemplateApi = createApi({
  reducerPath: "reportTemplateApi",
  baseQuery: axiosBaseQuery("/report-templates"),
  tagTypes: ["ReportTemplate"],
  endpoints: (builder) => ({
    // GET /report-templates
    getAllReportTemplates: builder.query<
      ApiResponse<ReportTemplate[]>,
      { bodyPartId?: string; modalityId?: string, templateType?: TemplateType } | void
    >({
      query: (filters) => ({ url: "", method: "GET" ,params: filters }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((r) => ({
                type: "ReportTemplate" as const,
                id: r.reportTemplatesId,
              })),
              { type: "ReportTemplate", id: "LIST" },
            ]
          : [{ type: "ReportTemplate", id: "LIST" }],
    }),

    getReportTemplatesPaginated: builder.query<
      PaginatedResponse<ReportTemplate>,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "/paginated",
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map((r) => ({
                type: "ReportTemplate" as const,
                id: r.reportTemplatesId,
              })),
              { type: "ReportTemplate", id: "LIST" },
            ]
          : [{ type: "ReportTemplate", id: "LIST" }],
    }),

    getReportTemplateById: builder.query<ApiResponse<ReportTemplate>, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "ReportTemplate", id }],
    }),
    createReportTemplate: builder.mutation<
      ReportTemplate,
      Partial<ReportTemplate>
    >({
      query: (body) => ({ url: "", method: "POST", body }),
      invalidatesTags: [{ type: "ReportTemplate", id: "LIST" }],
    }),
    updateReportTemplate: builder.mutation<
      ReportTemplate,
      { id: string; body: Partial<ReportTemplate> }
    >({
      query: ({ id, body }) => ({ url: `${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ReportTemplate", id },
        { type: "ReportTemplate", id: "LIST" },
      ],
    }),

    deleteReportTemplate: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `${id}`, method: "DELETE" }),
      invalidatesTags: (result, error, id) => [
        { type: "ReportTemplate", id },
        { type: "ReportTemplate", id: "LIST" },
      ],
    }),
  }),
});

export const {
    useGetAllReportTemplatesQuery,
    useGetReportTemplatesPaginatedQuery,
    useGetReportTemplateByIdQuery,
    useCreateReportTemplateMutation,
    useUpdateReportTemplateMutation,
    useDeleteReportTemplateMutation,
} = reportTemplateApi;