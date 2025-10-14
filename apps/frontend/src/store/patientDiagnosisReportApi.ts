import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

export const patientDiagnosisApi = createApi({
  reducerPath: "patientDiagnosisApi",
  baseQuery: axiosBaseQuery("/patient-diagnosis"),
  //not mapped in backend yet
});
