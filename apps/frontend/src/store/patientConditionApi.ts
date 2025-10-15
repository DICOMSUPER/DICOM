import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  PatientCondition,
  CreatePatientConditionDto,
  UpdatePatientConditionDto,
  PatientConditionSearchFilters,
} from "@/interfaces/patient/patient-condition.interface";

export const patientConditionApi = createApi({
  reducerPath: "patientConditionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/patient-conditions",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["PatientCondition"],
  endpoints: (builder) => ({
    // Patient Condition endpoints
    getConditions: builder.query<
      PatientCondition[],
      PatientConditionSearchFilters
    >({
      query: (filters) => ({
        url: "",
        params: filters,
      }),
      providesTags: ["PatientCondition"],
    }),

    getConditionById: builder.query<PatientCondition, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "PatientCondition", id }],
    }),

    getConditionsByPatientId: builder.query<PatientCondition[], string>({
      query: (patientId) => `/patient/${patientId}`,
      providesTags: (result, error, patientId) => [
        { type: "PatientCondition", id: "LIST" },
        ...(result || []).map(({ id }) => ({
          type: "PatientCondition" as const,
          id,
        })),
      ],
    }),

    createCondition: builder.mutation<
      PatientCondition,
      CreatePatientConditionDto
    >({
      query: (data) => ({
        url: "",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["PatientCondition"],
    }),

    updateCondition: builder.mutation<
      PatientCondition,
      { id: string; data: UpdatePatientConditionDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PatientCondition", id },
        { type: "PatientCondition", id: "LIST" },
      ],
    }),

    deleteCondition: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PatientCondition", id },
        { type: "PatientCondition", id: "LIST" },
      ],
    }),

    // Bulk operations
    createConditionsForPatient: builder.mutation<
      PatientCondition[],
      {
        patientId: string;
        conditions: Omit<CreatePatientConditionDto, "patientId">[];
      }
    >({
      query: ({ patientId, conditions }) => ({
        url: "/bulk",
        method: "POST",
        body: { patientId, conditions },
      }),
      invalidatesTags: ["PatientCondition"],
    }),

    updatePatientConditions: builder.mutation<
      PatientCondition[],
      { patientId: string; conditions: CreatePatientConditionDto[] }
    >({
      query: ({ patientId, conditions }) => ({
        url: `/patient/${patientId}/bulk`,
        method: "PUT",
        body: { conditions },
      }),
      invalidatesTags: ["PatientCondition"],
    }),
  }),
});

export const {
  useGetConditionsQuery,
  useGetConditionByIdQuery,
  useGetConditionsByPatientIdQuery,
  useCreateConditionMutation,
  useUpdateConditionMutation,
  useDeleteConditionMutation,
  useCreateConditionsForPatientMutation,
  useUpdatePatientConditionsMutation,
} = patientConditionApi;
