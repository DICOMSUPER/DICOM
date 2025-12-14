import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { ApiResponse } from "@/common/interfaces/patient/patient-workflow.interface";
import { mapApiResponse } from "@/common/utils/adpater";
import { PaginatedResponse, QueryParams } from "@/common/interfaces/pagination/pagination.interface";
import {
    ReportTemplate,
    CreateReportTemplateDto,
    UpdateReportTemplateDto,
} from "@/common/interfaces/patient/diagnosis-report-template.interface";

export const reportTemplateApi = createApi({
    reducerPath: "reportTemplateApi",
    baseQuery: axiosBaseQuery("/report-templates"),
    tagTypes: ["ReportTemplate"],
    endpoints: (builder) => ({
        // Get all templates with search and pagination
        getReportTemplates: builder.query<
            PaginatedResponse<ReportTemplate>,
            QueryParams
        >({
            query: (filters) => ({
                url: "",
                method: "GET",
                params: filters || {},
            }),
            transformResponse: (response: any) =>
                mapApiResponse<ReportTemplate>(response),
            providesTags: ["ReportTemplate"],
        }),

        // Get template by ID
        getReportTemplateById: builder.query<ReportTemplate, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "ReportTemplate", id }],
        }),

        getTemplatesByModalityBodyPart: builder.mutation<ReportTemplate[], { modalityId: string; bodyPartId: string }>({
            query: ({ modalityId, bodyPartId }) => ({
                url: `/by-modality-bodypart`,
                method: "POST",
                data: { modalityId, bodyPartId },
            }),
            invalidatesTags: ["ReportTemplate"],
        }),

        // Create report template
        createReportTemplate: builder.mutation<ReportTemplate, CreateReportTemplateDto>({
            query: (body) => ({
                url: "",
                method: "POST",
                body,
            }),
            invalidatesTags: ["ReportTemplate"],
        }),

        // Update report template
        updateReportTemplate: builder.mutation<
            ReportTemplate,
            { id: string; data: UpdateReportTemplateDto }
        >({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "ReportTemplate", id },
                "ReportTemplate",
            ],
        }),

        // Delete report template
        deleteReportTemplate: builder.mutation<void, string>({
            query: (id) => ({
                url: `/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["ReportTemplate"],
        }),
    }),
});

// Auto hooks
export const {
    useGetReportTemplatesQuery,
    useGetReportTemplateByIdQuery,
    useGetTemplatesByModalityBodyPartMutation,
    useCreateReportTemplateMutation,
    useUpdateReportTemplateMutation,
    useDeleteReportTemplateMutation,

} = reportTemplateApi;
