import { EmployeeRoomAssignment } from "@/interfaces/user/employee-room-assignment.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ApiResponse } from "@/services/imagingApi";
import { createApi } from "@reduxjs/toolkit/query/react";

export const employeeRoomAssignmentApi = createApi({
  reducerPath: "employeeRoomAssignmentApi",
  baseQuery: axiosBaseQuery("/employee-room-assignments"),
  tagTypes: ["employeeRoom"],
  endpoints: (builder) => ({
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

export const { useGetCurrentEmployeeRoomAssignmentQuery } =
  employeeRoomAssignmentApi;
