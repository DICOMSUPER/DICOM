import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";
import { FilterEmployeeRoomAssignment, EmployeeRoomAssignment } from "@/interfaces/user/employee-room-assignment.interface";

export const employeeRoomAssignmentApi = createApi({
  reducerPath: "employeeRoomAssignmentApi",
  baseQuery: axiosBaseQuery("/employee-room-assignments"),
  tagTypes: ["EmployeeRoomAssignment", "employeeRoom", "RoomSchedule"],
  endpoints: (builder) => ({
    getEmployeeRoomAssignmentsInCurrentSession: builder.query<
      ApiResponse<EmployeeRoomAssignment[]>,
      void
    >({
      query: () => ({
        url: `/current-session`,
        method: "GET",
      }),
      providesTags: ["EmployeeRoomAssignment"],
    }),
    getEmployeeRoomAssignments: builder.query<
      ApiResponse<EmployeeRoomAssignment[]>,
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
    createEmployeeRoomAssignment: builder.mutation<
      ApiResponse<EmployeeRoomAssignment>,
      { roomScheduleId: string; employeeId: string; isActive?: boolean }
    >({
      query: (data) => ({
        url: "/",
        method: "POST",
        data,
      }),
      invalidatesTags: ["EmployeeRoomAssignment", "RoomSchedule"],
    }),
    updateEmployeeRoomAssignment: builder.mutation<
      ApiResponse<EmployeeRoomAssignment>,
      { id: string; data: Partial<{ roomScheduleId: string; employeeId: string; isActive: boolean }> }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmployeeRoomAssignment", id },
        "EmployeeRoomAssignment",
      ],
    }),
    deleteEmployeeRoomAssignment: builder.mutation<
      ApiResponse<void>,
      string
    >({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeRoomAssignment", "RoomSchedule"],
    }),
  }),
});

export const {
  useGetEmployeeRoomAssignmentsInCurrentSessionQuery,
  useGetEmployeeRoomAssignmentsQuery,
  useGetCurrentEmployeeRoomAssignmentQuery,
  useCreateEmployeeRoomAssignmentMutation,
  useUpdateEmployeeRoomAssignmentMutation,
  useDeleteEmployeeRoomAssignmentMutation,
} = employeeRoomAssignmentApi;
