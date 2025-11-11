import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { FilterEmployeeRoomAssignment, EmployeeRoomAssignment } from "@/interfaces/user/employee-room-assignment.interface";

export const employeeRoomAssignmentApi = createApi({
  reducerPath: "employeeRoomAssignmentApi",
  baseQuery: axiosBaseQuery("/employee-room-assignments"),
  tagTypes: ["EmployeeRoomAssignment", "employeeRoom"],
  endpoints: (builder) => ({
    getEmployeeRoomAssignmentsInCurrentSession: builder.query<
      EmployeeRoomAssignment[],
      void
    >({
      query: () => ({
        url: `/current-session`,
        method: "GET",
      }),
      providesTags: ["EmployeeRoomAssignment"],
    }),
    getEmployeeRoomAssignments: builder.query<
      EmployeeRoomAssignment[],
      {filter: FilterEmployeeRoomAssignment}
    >({
      query: ({ filter }) => ({
        url: `/`,
        method: "GET",
        params: filter,
      }),
      providesTags: ["EmployeeRoomAssignment"],
    }),
    getCurrentEmployeeRoomAssignment: builder.query<
      ApiResponse<EmployeeRoomAssignment>,
      string
    >({
      query: (id) => ({
        url: `/${id}/user`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetEmployeeRoomAssignmentsInCurrentSessionQuery,
  useGetEmployeeRoomAssignmentsQuery,
  useGetCurrentEmployeeRoomAssignmentQuery,
} = employeeRoomAssignmentApi;
