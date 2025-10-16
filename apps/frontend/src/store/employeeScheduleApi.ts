import { createApi } from "@reduxjs/toolkit/query/react";
import {
  EmployeeSchedule,
  CreateEmployeeScheduleDto,
  UpdateEmployeeScheduleDto,
  EmployeeScheduleSearchFilters,
  PaginatedResponse,
  ScheduleStats,
  Employee,
  Room,
  ShiftTemplate,
} from "@/interfaces/schedule/schedule.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";

export const employeeScheduleApi = createApi({
  reducerPath: "employeeScheduleApi",
  baseQuery: axiosBaseQuery("/employee-schedules"),
  tagTypes: ["EmployeeSchedule", "Employee", "Room", "ShiftTemplate", "Stats"],
  endpoints: (builder) => ({
    // Get all employee schedules with filters
    getEmployeeSchedules: builder.query<EmployeeSchedule[], EmployeeScheduleSearchFilters>({
      query: (filters) => ({
        url: "",
        method: "GET",
        params: filters,
      }),
      transformResponse: (response: any) => {
        // Handle both array and paginated response
        return Array.isArray(response) ? response : (response?.data || []);
      },
      providesTags: ["EmployeeSchedule"],
    }),

    // Get paginated employee schedules
    getEmployeeSchedulesPaginated: builder.query<
      PaginatedResponse<EmployeeSchedule>,
      {
        page: number;
        limit: number;
        filters: Omit<EmployeeScheduleSearchFilters, "limit" | "offset">;
      }
    >({
      query: ({ page, limit, filters }) => ({
        url: "/paginated",
        method: "GET",
        params: { page, limit, ...filters },
      }),
      providesTags: ["EmployeeSchedule"],
    }),

    // Get employee schedule by ID
    getEmployeeScheduleById: builder.query<EmployeeSchedule, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "EmployeeSchedule", id }],
    }),

    // Get schedules for current user
    getMySchedules: builder.query<EmployeeSchedule[], { limit?: number }>({
      query: ({ limit }) => ({
        url: "/me",
        method: "GET",
        params: limit ? { limit } : undefined,
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response from backend
        return Array.isArray(response) ? response : (response?.data || []);
      },
      providesTags: ["EmployeeSchedule"],
    }),

    // Get current user's schedules by date
    getMySchedulesByDate: builder.query<
      EmployeeSchedule[],
      { date: string }
    >({
      query: ({ date }) => ({
        url: "/me",
        method: "GET",
        params: { start_date: date, end_date: date },
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response from backend
        return Array.isArray(response) ? response : (response?.data || []);
      },
      providesTags: ["EmployeeSchedule"],
    }),

    // Get current user's schedules by date range
    getMySchedulesByDateRange: builder.query<
      EmployeeSchedule[],
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: "/me",
        method: "GET",
        params: { start_date: startDate, end_date: endDate },
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response from backend
        return Array.isArray(response) ? response : (response?.data || []);
      },
      providesTags: ["EmployeeSchedule"],
    }),

    // Get schedules by date range
    getSchedulesByDateRange: builder.query<
      EmployeeSchedule[],
      { startDate: string; endDate: string; filters?: Partial<EmployeeScheduleSearchFilters> }
    >({
      query: ({ startDate, endDate, filters }) => ({
        url: "",
        method: "GET",
        params: { workDateFrom: startDate, workDateTo: endDate, ...filters },
      }),
      transformResponse: (response: any) => {
        // Handle both array and paginated response
        return Array.isArray(response) ? response : (response?.data || []);
      },
      providesTags: ["EmployeeSchedule"],
    }),

    // Get schedules for specific date
    getSchedulesByDate: builder.query<
      EmployeeSchedule[],
      { date: string; filters?: Partial<EmployeeScheduleSearchFilters> }
    >({
      query: ({ date, filters }) => ({
        url: "",
        method: "GET",
        params: { workDateFrom: date, workDateTo: date, ...filters },
      }),
      transformResponse: (response: any) => {
        // Handle both array and paginated response
        return Array.isArray(response) ? response : (response?.data || []);
      },
      providesTags: ["EmployeeSchedule"],
    }),

    // Get schedule statistics
    getScheduleStats: builder.query<ScheduleStats, EmployeeScheduleSearchFilters>({
      query: (filters) => ({
        url: "/stats",
        method: "GET",
        params: filters,
      }),
      providesTags: ["Stats"],
    }),

    // Create employee schedule
    createEmployeeSchedule: builder.mutation<EmployeeSchedule, CreateEmployeeScheduleDto>({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: ["EmployeeSchedule", "Stats"],
    }),

    // Update employee schedule
    updateEmployeeSchedule: builder.mutation<
      EmployeeSchedule,
      { id: string; data: UpdateEmployeeScheduleDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmployeeSchedule", id },
        "EmployeeSchedule",
        "Stats",
      ],
    }),

    // Delete employee schedule
    deleteEmployeeSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeSchedule", "Stats"],
    }),

    // Bulk create schedules
    bulkCreateSchedules: builder.mutation<EmployeeSchedule[], CreateEmployeeScheduleDto[]>({
      query: (data) => ({
        url: "/bulk",
        method: "POST",
        data,
      }),
      invalidatesTags: ["EmployeeSchedule", "Stats"],
    }),

    // Update schedule status
    updateScheduleStatus: builder.mutation<
      EmployeeSchedule,
      { id: string; status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' }
    >({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        data: { schedule_status: status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "EmployeeSchedule", id },
        "EmployeeSchedule",
        "Stats",
      ],
    }),

    // Get available employees for scheduling
    getAvailableEmployees: builder.query<Employee[], { date: string; time?: string }>({
      query: ({ date, time }) => ({
        url: "/available-employees",
        method: "GET",
        params: { date, time },
      }),
      providesTags: ["Employee"],
    }),

    // Get available rooms for scheduling
    getAvailableRooms: builder.query<Room[], { date: string; time?: string }>({
      query: ({ date, time }) => ({
        url: "/available-rooms",
        method: "GET",
        params: { date, time },
      }),
      providesTags: ["Room"],
    }),

    // Get shift templates
    getShiftTemplates: builder.query<ShiftTemplate[], void>({
      query: () => ({
        url: "/shift-templates",
        method: "GET",
      }),
      providesTags: ["ShiftTemplate"],
    }),
  }),
});

export const {
  // Employee Schedule hooks
  useGetEmployeeSchedulesQuery,
  useGetEmployeeSchedulesPaginatedQuery,
  useGetEmployeeScheduleByIdQuery,
  useGetMySchedulesQuery,
  useGetMySchedulesByDateQuery,
  useGetMySchedulesByDateRangeQuery,
  useGetSchedulesByDateRangeQuery,
  useGetSchedulesByDateQuery,
  useGetScheduleStatsQuery,
  useCreateEmployeeScheduleMutation,
  useUpdateEmployeeScheduleMutation,
  useDeleteEmployeeScheduleMutation,
  useBulkCreateSchedulesMutation,
  useUpdateScheduleStatusMutation,
  useGetAvailableEmployeesQuery,
  useGetAvailableRoomsQuery,
  useGetShiftTemplatesQuery,
} = employeeScheduleApi;
