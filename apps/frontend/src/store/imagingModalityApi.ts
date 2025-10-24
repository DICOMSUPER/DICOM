import { ImagingModality } from "@/interfaces/image-dicom/imaging_modality.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { number, success } from "zod";

export interface ResponseData {
  success: boolean;
  data: ImagingModality[];
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
  method: string;
  traceId: string;
}
export const imagingModalityApi = createApi({
  reducerPath: "imagingModalityApi",
  baseQuery: axiosBaseQuery("/imaging-modalities"),
  tagTypes: ["Modality", "Modalities", "ImagingModality", "Imaging"],
  endpoints: (builder) => ({
    getAllImagingModality: builder.query<ResponseData, void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllImagingModalityQuery } = imagingModalityApi;
