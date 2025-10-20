import { ImagingModality } from "@/interfaces/image-dicom/imaging_modality.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const imagingModalityApi = createApi({
  reducerPath: "imagingModalitiesApi",
  baseQuery: axiosBaseQuery("/imaging-modalities"),
  tagTypes: ["Modality", "Modalities", "ImagingModality", "Imaging"],
  endpoints: (builder) => ({
    getAllImagingModality: builder.query<ImagingModality[], void>({
      query: () => ({
        url: "",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetAllImagingModalityQuery } = imagingModalityApi;
