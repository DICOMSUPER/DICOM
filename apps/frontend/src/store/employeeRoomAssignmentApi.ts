import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { BodyPart } from "@/interfaces/image-dicom/body-part.interface";
import { PaginatedResponse } from "./scheduleApi";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { FilterEmployeeRoomAssignment, IEmployeeRoomAssignment } from "@/interfaces/user/employee-room-assignment.interface";

export const employeeRoomAssignmentApi = createApi({
  reducerPath: "employeeRoomAssignmentApi",
  baseQuery: axiosBaseQuery("/employee-room-assignments"),
  tagTypes: ["EmployeeRoomAssignment"],
  endpoints: (builder) => ({

    // 
    getEmployeeRoomAssignmentsInCurrentSession: builder.query<
     IEmployeeRoomAssignment[],
      void
    >({
      query: () => ({
        url: `/current-session`,
        method: "GET",
      }),
      providesTags: ["EmployeeRoomAssignment"],
    }),
    getEmployeeRoomAssignments: builder.query<
      IEmployeeRoomAssignment[],
      {filter: FilterEmployeeRoomAssignment}
    >({
      query: ({ filter }) => ({
        url: `/`,
        method: "GET",
        params: filter,
      }),
      providesTags: ["EmployeeRoomAssignment"],
    }),
  }),
});

export const {
  useGetEmployeeRoomAssignmentsInCurrentSessionQuery,
  useGetEmployeeRoomAssignmentsQuery,
} = employeeRoomAssignmentApi;