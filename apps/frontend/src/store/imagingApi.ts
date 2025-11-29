import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export interface uploadDicomDto {
  dicomFile: File;
  orderId: string;
  performingTechnicianId: string;
  modalityMachineId: string;
}
export const imagingApi = createApi({
  reducerPath: "imagingApi",
  baseQuery: axiosBaseQuery("/imaging-service"),
  tagTypes: ["imaging", "cloudinary"],
  endpoints: (builder) => ({
    uploadDicomFile: builder.mutation<ApiResponse<any>, uploadDicomDto>({
      query: ({
        dicomFile,
        orderId,
        performingTechnicianId,
        modalityMachineId,
      }) => {
        const formData = new FormData();
        formData.append("dicomFile", dicomFile);
        formData.append("orderId", orderId);
        formData.append("performingTechnicianId", performingTechnicianId);
        formData.append("modalityMachineId", modalityMachineId);

        return {
          url: "/upload",
          method: "POST",
          data: formData,
        };
      },
    }),
  }),
});

export const { useUploadDicomFileMutation } = imagingApi;
