import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { ImageAnnotation } from "@/interfaces/image-dicom/image-annotation.interface";
import { AnnotationStatus } from "@/enums/image-dicom.enum";

type CreateAnnotationPayload = {
  instanceId: string;
  annotationType: string;
  annotationData: object;
  coordinates?: object;
  measurementValue?: number;
  measurementUnit?: string;
  textContent?: string;
  colorCode?: string;
  annotationStatus: AnnotationStatus;
  annotatorId: string;
  annotationDate?: Date;
  reviewDate?: Date;
  notes?: string;
};

type UpdateAnnotationPayload = Partial<{
  annotationData: object;
  coordinates?: object;
  measurementValue?: number;
  measurementUnit?: string;
  textContent?: string;
  colorCode?: string;
  annotationStatus?: AnnotationStatus;
  reviewDate?: Date;
  notes?: string;
}>;

export const annotationApi = createApi({
  reducerPath: "annotationApi",
  baseQuery: axiosBaseQuery("/image-annotations"),
  tagTypes: ["ImageAnnotation"],
  endpoints: (builder) => ({
    createAnnotation: builder.mutation<
      ApiResponse<ImageAnnotation>,
      CreateAnnotationPayload
    >({
      query: (body) => ({
        url: "",
        method: "POST",
        data: body,
      }),
      invalidatesTags: [{ type: "ImageAnnotation", id: "LIST" }],
    }),

    getAnnotationsByInstanceId: builder.query<
      ApiResponse<ImageAnnotation[]>,
      string
    >({
      query: (instanceId) => ({
        url: `/instance/${instanceId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? result.data.map((annotation) => ({
              type: "ImageAnnotation" as const,
              id:
                (annotation as any)?.id ??
                (annotation as any)?.annotation_id ??
                "LIST",
            }))
          : [],
    }),

    getAnnotationsBySeriesId: builder.query<
      ApiResponse<ImageAnnotation[]>,
      string
    >({
      query: (seriesId) => ({
        url: `/series/${seriesId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result?.data
          ? result.data.map((annotation) => ({
              type: "ImageAnnotation" as const,
              id:
                (annotation as any)?.id ??
                (annotation as any)?.annotation_id ??
                "LIST",
            }))
          : [],
    }),

    getAnnotationById: builder.query<ApiResponse<ImageAnnotation>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "ImageAnnotation", id }],
    }),

    updateAnnotation: builder.mutation<
      ApiResponse<ImageAnnotation>,
      { id: string; data: UpdateAnnotationPayload }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "ImageAnnotation", id },
        { type: "ImageAnnotation", id: "LIST" },
      ],
    }),

    deleteAnnotation: builder.mutation<ApiResponse<boolean | void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "ImageAnnotation", id },
        { type: "ImageAnnotation", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateAnnotationMutation,
  useGetAnnotationsByInstanceIdQuery,
  useLazyGetAnnotationsByInstanceIdQuery,
  useGetAnnotationsBySeriesIdQuery,
  useLazyGetAnnotationsBySeriesIdQuery,
  useGetAnnotationByIdQuery,
  useUpdateAnnotationMutation,
  useDeleteAnnotationMutation,
} = annotationApi;

