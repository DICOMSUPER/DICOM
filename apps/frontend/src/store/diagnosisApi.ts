import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  DiagnosisReport,
  CreateDiagnosisReportDto,
  UpdateDiagnosisReportDto,
  DiagnosisSearchFilters,
} from "@/interfaces/patient/patient-workflow.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const diagnosisApi = createApi({
  reducerPath: "diagnosisApi",
  baseQuery: axiosBaseQuery("/diagnosis-reports"),
  tagTypes: ["Diagnosis"],
  endpoints: (builder) => ({
    // Get all diagnoses with filters
    getDiagnoses: builder.query<DiagnosisReport[], DiagnosisSearchFilters>({
      query: (filters) => ({
        url: "",
        params: filters,
        method: "GET",
      }),
      providesTags: ["Diagnosis"],
    }),

    // Get diagnosis by ID
    getDiagnosisById: builder.query<DiagnosisReport, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "Diagnosis", id }],
    }),

    // Get diagnoses by encounter
    getDiagnosesByEncounter: builder.query<DiagnosisReport[], string>({
      query: (encounterId) => ({
        url: `/encounter/${encounterId}`,
        method: "GET",
      }),
      providesTags: (result, error, encounterId) => [
        { type: "Diagnosis", id: `encounter-${encounterId}` },
      ],
    }),

    // Get diagnoses by patient
    getDiagnosesByPatient: builder.query<
      DiagnosisReport[],
      { patientId: string; limit?: number }
    >({
      query: ({ patientId, limit }) => ({
        url: `/patient/${patientId}`,
        method: "GET",
        params: { limit },
      }),
      providesTags: (result, error, { patientId }) => [
        { type: "Diagnosis", id: `patient-${patientId}` },
      ],
    }),

    getDiagnoseByStudyId: builder.query<DiagnosisReport[], string>({
      query: (studyId) => ({
        url: `/studyId/${studyId}`,
        method: "GET",
      }),
      providesTags: (result, error, studyId) => [
        { type: "Diagnosis", id: `study-${studyId}` },
      ],
    }),

    // Get diagnoses by physician
    getDiagnosesByPhysician: builder.query<DiagnosisReport[], string>({
      query: (physicianId) => ({
        url: `/physician/${physicianId}`,
        method: "GET",
      }),
      providesTags: (result, error, physicianId) => [
        { type: "Diagnosis", id: `physician-${physicianId}` },
      ],
    }),

    // Get diagnosis stats
    getDiagnosisStats: builder.query<
      {
        total: number;
        active: number;
        resolved: number;
        critical: number;
        today: number;
      },
      void
    >({
      query: () => ({ url: "/stats", method: "GET" }),
      providesTags: ["Diagnosis"],
    }),

    // Get diagnoses by type
    getDiagnosesByType: builder.query<
      {
        primary: number;
        secondary: number;
        differential: number;
      },
      void
    >({
      query: () => ({ url: "/types", method: "GET" }),
      providesTags: ["Diagnosis"],
    }),

    getDiagnoseByPatientId: builder.query<DiagnosisReport[], string>({
      query: (patientId) => ({
        url: `/patient/${patientId}`,
        method: "GET",
      }),
      providesTags: (result, error, patientId) => [
        { type: "Diagnosis", id: `patient-${patientId}` },
      ],
    }),

    // Create diagnosis
    createDiagnosis: builder.mutation<
      DiagnosisReport,
      CreateDiagnosisReportDto
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: (result, error, { encounterId }) => [
        { type: "Diagnosis", id: `encounter-${encounterId}` },
        "Diagnosis",
      ],
    }),


    // Update diagnosis
    updateDiagnosis: builder.mutation<
      DiagnosisReport,
      { id: string; data: UpdateDiagnosisReportDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Diagnosis", id },
        "Diagnosis",
      ],
    }),

    // Delete diagnosis
    deleteDiagnosis: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Diagnosis"],
    }),
  }),
});

export const {
  useGetDiagnosesQuery,
  useGetDiagnosisByIdQuery,
  useGetDiagnosesByEncounterQuery,
  useGetDiagnosesByPatientQuery,
  useGetDiagnoseByPatientIdQuery,
  useGetDiagnosesByPhysicianQuery,
  useGetDiagnosisStatsQuery,
  useGetDiagnosesByTypeQuery,
  useCreateDiagnosisMutation,
  useUpdateDiagnosisMutation,
  useDeleteDiagnosisMutation,
  useGetDiagnoseByStudyIdQuery,
} = diagnosisApi;
