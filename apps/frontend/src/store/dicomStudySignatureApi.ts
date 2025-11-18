import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { SignatureType } from "@/enums/signature-type";
import {
  DicomStudySignature,
  SignatureDetails,
  SignStudyDto,
  SignStudyResponse,
  VerifySignatureResponse,
  VerifyStudySignatureDto,
} from "@/interfaces/user/dicom-study-signature.interface";

export const dicomStudySignatureApi = createApi({
  reducerPath: "dicomStudySignatureApi",
  baseQuery: axiosBaseQuery("/dicom-study-signatures"),
  tagTypes: ["DicomStudySignature", "StudySignatures"],
  endpoints: (builder) => ({
    // Technician verify study
    technicianVerifyStudy: builder.mutation<
      ApiResponse<SignStudyResponse>,
      SignStudyDto
    >({
      query: (dto) => ({
        url: "/technician-verify",
        method: "POST",
        data: dto,
      }),
      invalidatesTags: (result, error, { studyId }) => [
        { type: "StudySignatures", id: studyId },
        { type: "DicomStudySignature", id: `${studyId}-TECHNICIAN` },
        "DicomStudySignature",
      ],
    }),

    // Physician approve study
    physicianApproveStudy: builder.mutation<
      ApiResponse<SignStudyResponse>,
      SignStudyDto
    >({
      query: (dto) => ({
        url: "/physician-approve",
        method: "POST",
        data: dto,
      }),
      invalidatesTags: (result, error, { studyId }) => [
        { type: "StudySignatures", id: studyId },
        { type: "DicomStudySignature", id: `${studyId}-PHYSICIAN` },
        "DicomStudySignature",
      ],
    }),

    // Verify study signature
    verifyStudySignature: builder.mutation<
      ApiResponse<VerifySignatureResponse>,
      VerifyStudySignatureDto
    >({
      query: (dto) => ({
        url: "/verify",
        method: "POST",
        data: dto,
      }),
    }),

    // Get all signatures for a study
    getStudySignatures: builder.query<ApiResponse<SignatureDetails[]>, string>({
      query: (studyId) => ({
        url: `/${studyId}`,
        method: "GET",
      }),
      providesTags: (result, error, studyId) => [
        { type: "StudySignatures", id: studyId },
      ],
    }),

    // Get signature details by studyId and signatureType
    getSignatureDetails: builder.query<
      ApiResponse<DicomStudySignature>,
      { studyId: string; signatureType: SignatureType }
    >({
      query: ({ studyId, signatureType }) => ({
        url: `/${studyId}/${signatureType}`,
        method: "GET",
      }),
      providesTags: (result, error, { studyId, signatureType }) => [
        { type: "DicomStudySignature", id: `${studyId}-${signatureType}` },
      ],
    }),
  }),
});

export const {
  useTechnicianVerifyStudyMutation,
  usePhysicianApproveStudyMutation,
  useVerifyStudySignatureMutation,
  useGetStudySignaturesQuery,
  useLazyGetStudySignaturesQuery,
  useGetSignatureDetailsQuery,
  useLazyGetSignatureDetailsQuery,
} = dicomStudySignatureApi;
