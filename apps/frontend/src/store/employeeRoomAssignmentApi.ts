import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/common/lib/axiosBaseQuery";
import { ApiResponse } from "@/common/interfaces/api-response/api-response.interface";
import {
  FilterEmployeeRoomAssignment,
  EmployeeRoomAssignment,
  EmployeeRoomAssignmentStats,
} from "@/common/interfaces/user/employee-room-assignment.interface";

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
      { filter: FilterEmployeeRoomAssignment }
    >({
      query: ({ filter }) => ({
        url: `/`,
        method: "GET",
        params: {
          ...filter,
          sortField: filter?.sortBy, // Map sortBy to sortField for backend
          order: filter?.order,
        },
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
      invalidatesTags: (result, error, { roomScheduleId }) => [
        { type: "EmployeeRoomAssignment", id: roomScheduleId },
        "EmployeeRoomAssignment",
        { type: "RoomSchedule", id: roomScheduleId },
        "RoomSchedule",
      ],
    }),
    bulkCreateEmployeeRoomAssignments: builder.mutation<
      ApiResponse<EmployeeRoomAssignment[]>,
      { roomScheduleId: string; employeeIds: string[]; isActive?: boolean }
    >({
      query: ({ roomScheduleId, employeeIds, isActive = true }) => ({
        url: "/bulk",
        method: "POST",
        data: employeeIds.map((employeeId) => ({
          roomScheduleId,
          employeeId,
          isActive,
        })),
      }),
      invalidatesTags: (result, error, { roomScheduleId }) => [
        { type: "EmployeeRoomAssignment", id: roomScheduleId },
        "EmployeeRoomAssignment",
        { type: "RoomSchedule", id: roomScheduleId },
        "RoomSchedule",
      ],
    }),
    updateEmployeeRoomAssignment: builder.mutation<
      ApiResponse<EmployeeRoomAssignment>,
      {
        id: string;
        data: Partial<{
          roomScheduleId: string;
          employeeId: string;
          isActive: boolean;
        }>;
      }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (result, error, { id, data }) => {
        const tags: any[] = [
          { type: "EmployeeRoomAssignment", id },
          "EmployeeRoomAssignment",
        ];
        if (data.roomScheduleId || result?.data?.roomScheduleId) {
          const scheduleId =
            data.roomScheduleId || result?.data?.roomScheduleId;
          if (scheduleId) {
            tags.push({ type: "RoomSchedule", id: scheduleId }, "RoomSchedule");
          }
        } else {
          tags.push("RoomSchedule");
        }
        return tags;
      },
    }),
    deleteEmployeeRoomAssignment: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => {
        return [
          { type: "EmployeeRoomAssignment", id },
          "EmployeeRoomAssignment",
          "RoomSchedule",
        ];
      },
    }),

    getEmployeeRoomAssignmentStats: builder.query<
      ApiResponse<{
        totalAssignments: number;
        activeAssignments: number;
        inactiveAssignments: number;
        uniqueRooms: number;
        uniqueEmployees: number;
      }>,
      void
    >({
      query: () => ({
        url: `/stats`,
        method: "GET",
      }),
    }),

    getEmployeeRoomAssignmentStatsOverTime: builder.query<
      ApiResponse<EmployeeRoomAssignmentStats>,
      { id: string; startDate?: string | Date; endDate?: string | Date }
    >({
      query: ({ id, startDate, endDate }) => ({
        url: `/stats/employee`,
        method: "GET",
        params: {
          startDate:
            startDate instanceof Date
              ? startDate?.toISOString().split("T")[0]
              : startDate,
          endDate:
            endDate instanceof Date
              ? endDate?.toISOString().split("T")[0]
              : endDate,
        },
      }),
    }),

    getEmployeeRoomAssignmentInWorkDate: builder.query<
      ApiResponse<EmployeeRoomAssignment[]>,
      string
    >({
      query: (work_date) => ({
        url: "/by-date",
        method: "GET",
        params: { work_date },
      }),
    }),
  }),
});

export const {
  useGetEmployeeRoomAssignmentsInCurrentSessionQuery,
  useGetEmployeeRoomAssignmentsQuery,
  useGetCurrentEmployeeRoomAssignmentQuery,
  useCreateEmployeeRoomAssignmentMutation,
  useBulkCreateEmployeeRoomAssignmentsMutation,
  useUpdateEmployeeRoomAssignmentMutation,
  useDeleteEmployeeRoomAssignmentMutation,
  useGetEmployeeRoomAssignmentStatsQuery,
  useGetEmployeeRoomAssignmentStatsOverTimeQuery,
  useGetEmployeeRoomAssignmentInWorkDateQuery,
} = employeeRoomAssignmentApi;
