import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface BBoxSegmentationRequest {
  imageUrl: string;
  bbox: [number, number, number, number]; // [x_min, y_min, x_max, y_max]
  frameNumber: number;
  instanceId: string;
}

export interface SegmentationResult {
  imageId: string;
  originalImageId: string;
  frameNumber: number;
  instanceId: string;
  pixelData: string; // base64 zlib-compressed Uint8Array
  isCompressed: boolean;
  width: number;
  height: number;
}

export interface PointSegmentationRequest {
  imageUrl: string;
  points: [number, number][]; // [[x, y], ...]
  labels: number[]; // 1 = foreground, 0 = background
  frameNumber: number;
  instanceId: string;
}

export interface MultiFrameSegmentationRequest {
  imageUrls: string[];
  bbox: [number, number, number, number];
  frameNumbers: number[];
  instanceId: string;
}

const MEDSAM_API_URL = process.env.NEXT_PUBLIC_MEDSAM_API_URL || "http://localhost:8000";

export const aiSegmentationApi = createApi({
  reducerPath: "aiSegmentationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: MEDSAM_API_URL,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["AISegmentation"],
  endpoints: (builder) => ({
    // Segment with bounding box
    segmentWithBBox: builder.mutation<SegmentationResult, BBoxSegmentationRequest>({
      query: (body) => ({
        url: "/medsam2/segment-bbox",
        method: "POST",
        body,
      }),
    }),

    // Segment with points
    segmentWithPoints: builder.mutation<SegmentationResult, PointSegmentationRequest>({
      query: (body) => ({
        url: "/medsam2/segment-points",
        method: "POST",
        body,
      }),
    }),

    // Segment multiple frames
    segmentMultiFrame: builder.mutation<SegmentationResult[], MultiFrameSegmentationRequest>({
      query: (body) => ({
        url: "/medsam2/segment-multi-frame",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useSegmentWithBBoxMutation,
  useSegmentWithPointsMutation,
  useSegmentMultiFrameMutation,
} = aiSegmentationApi;
