import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import {
  CreateImageSegmentationLayerDto,
  ImageSegmentationLayer,
  UpdateImageSegmentationLayerDto,
} from "@/interfaces/image-dicom/image-segmentation-layer.interface";
import { PaginatedQuery } from "@/interfaces/pagination/pagination.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { create } from "domain";

type PaginatedQueryWithInstanceId = PaginatedQuery & {
  instanceId?: string;
};
export const ImageSegmentationLayerApi = createApi({
  reducerPath: "imageSegmentationLayerApi",
  baseQuery: axiosBaseQuery("/image-segmentation-layers"),
  tagTypes: ["ImageSegmentationLayer"],
  endpoints: (builder) => ({
    getImageSegmentationLayersPaginated: builder.query<
      ApiResponse<ImageSegmentationLayer>,
      PaginatedQueryWithInstanceId
    >({
      query: (params) => ({
        url: "/",
        method: "GET",
        params: params,
      }),
    }),

    getAllImageSegmentationLayers: builder.query<
      ApiResponse<ImageSegmentationLayer>,
      void
    >({
      query: () => ({
        url: "/",
        method: "GET",
      }),
    }),
    getImageSegmentationLayersBySeriesId: builder.query<
      ApiResponse<ImageSegmentationLayer[]>,
      string
    >({
      query: (seriesId) => ({
        url: `/series/${seriesId}`,
        method: "GET",
      }),
      providesTags: ["ImageSegmentationLayer"],
    }),

    createImageSegmentationLayer: builder.mutation<
      ApiResponse<ImageSegmentationLayer>,
      CreateImageSegmentationLayerDto
    >({
      query: (body) => ({
        url: "/",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["ImageSegmentationLayer"],
    }),

    updateImageSegmentationLayer: builder.mutation<
      ApiResponse<ImageSegmentationLayer>,
      {
        updateImageSegmentationLayerDto: UpdateImageSegmentationLayerDto;
        id: string;
      }
    >({
      query: (body) => ({
        url: `/${body.id}`,
        method: "PATCH",
        data: body.updateImageSegmentationLayerDto,
      }),
      invalidatesTags: ["ImageSegmentationLayer"],
    }),

    deleteImageSegmentationLayer: builder.mutation<
      ApiResponse<boolean>,
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ImageSegmentationLayer"],
    }),
  }),
});

export const {
  useGetImageSegmentationLayersPaginatedQuery,
  useGetAllImageSegmentationLayersQuery,
  useGetImageSegmentationLayersBySeriesIdQuery,
  useLazyGetImageSegmentationLayersBySeriesIdQuery,
  useLazyGetAllImageSegmentationLayersQuery,
  useLazyGetImageSegmentationLayersPaginatedQuery,
  useCreateImageSegmentationLayerMutation,
  useUpdateImageSegmentationLayerMutation,
  useDeleteImageSegmentationLayerMutation,
} = ImageSegmentationLayerApi;
