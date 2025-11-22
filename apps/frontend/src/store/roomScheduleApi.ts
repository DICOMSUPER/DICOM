import { createApi } from "@reduxjs/toolkit/query/react";
import {
  RoomSchedule,
  CreateRoomScheduleDto,
  UpdateRoomScheduleDto,
  RoomScheduleSearchFilters,
  PaginatedResponse,
  ScheduleStats,
  Employee,
  Room,
  ShiftTemplate,
} from "@/interfaces/schedule/schedule.interface";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ApiResponse } from "@/interfaces/api-response/api-response.interface";

export const RoomScheduleApi = createApi({
  reducerPath: "RoomScheduleApi",
  baseQuery: axiosBaseQuery("/room-schedules"),
  tagTypes: ["RoomSchedule", "Employee", "Room", "ShiftTemplate", "Stats"],
  keepUnusedDataFor: 60, // Keep unused data for 60 seconds
  endpoints: (builder) => ({
    // Get all employee schedules with filters (no pagination - for calendar)
    getRoomSchedules: builder.query<RoomSchedule[], RoomScheduleSearchFilters>({
      query: (filters) => {
        // Map frontend filter names to backend API parameter names
        const params: any = {};
        if (filters.employee_id) params.employee_id = filters.employee_id;
        if (filters.room_id) params.room_id = filters.room_id;
        if (filters.work_date_from) params.work_date_from = filters.work_date_from;
        if (filters.work_date_to) params.work_date_to = filters.work_date_to;
        if (filters.start_date) params.work_date_from = filters.start_date;
        if (filters.end_date) params.work_date_to = filters.end_date;
        if (filters.start_time) params.start_time = filters.start_time;
        if (filters.end_time) params.end_time = filters.end_time;
        if (filters.schedule_status) params.schedule_status = filters.schedule_status;
        if (filters.role) params.role = filters.role;
        if (filters.sort_by) params.sort_by = filters.sort_by;
        if (filters.sort_order) params.sort_order = filters.sort_order;
        if (filters.limit) params.limit = filters.limit;
        if (filters.offset) params.offset = filters.offset;
        
        return {
          url: "/all",
          method: "GET",
          params,
        };
      },
      transformResponse: (response: any) => {
        // Handle both array and wrapped response
        return Array.isArray(response) ? response : (response?.data || []);
      },
      providesTags: ["RoomSchedule"],
      keepUnusedDataFor: 300, // Keep calendar data for 5 minutes when not in use
    }),

    // Get paginated employee schedules
    getRoomSchedulesPaginated: builder.query<
      PaginatedResponse<RoomSchedule>,
      {
        page: number;
        limit: number;
        filters: Omit<RoomScheduleSearchFilters, "limit" | "offset">;
      }
    >({
      query: ({ page, limit, filters }) => {
        const params: any = { page, limit };
        if (filters.employee_id) params.employee_id = filters.employee_id;
        if (filters.room_id) params.room_id = filters.room_id;
        if (filters.work_date_from) params.work_date_from = filters.work_date_from;
        if (filters.work_date_to) params.work_date_to = filters.work_date_to;
        if (filters.start_date) params.work_date_from = filters.start_date;
        if (filters.end_date) params.work_date_to = filters.end_date;
        if (filters.start_time) params.start_time = filters.start_time;
        if (filters.end_time) params.end_time = filters.end_time;
        if (filters.schedule_status) params.schedule_status = filters.schedule_status;
        if (filters.role) params.role = filters.role;
        if (filters.sort_by) params.sort_field = filters.sort_by;
        if (filters.sort_order) params.order = filters.sort_order;
        if (filters.search) params.search = filters.search;
        
        return {
          url: "",
          method: "GET",
          params,
        };
      },
      transformResponse: (response: any) => {
        if (response?.data && Array.isArray(response.data)) {
          return response;
        }
        if (response?.total !== undefined) {
          return response;
        }
        return {
          data: Array.isArray(response) ? response : [],
          total: Array.isArray(response) ? response.length : 0,
          page: 1,
          limit: Array.isArray(response) ? response.length : 10,
          totalPages: 1,
        };
      },
      providesTags: ["RoomSchedule"],
      keepUnusedDataFor: 300, // Keep paginated data for 5 minutes when not in use
    }),

    // Get employee schedule by ID
    getRoomScheduleById: builder.query<RoomSchedule, string>({
      query: (id) => ({ url: `/${id}`, method: "GET" }),
      providesTags: (result, error, id) => [{ type: "RoomSchedule", id }],
    }),

    // Get schedules for current user
    getMySchedules: builder.query<ApiResponse<RoomSchedule[]>, { limit?: number }>({
      query: ({ limit }) => ({
        url: "/me",
        method: "GET",
        params: limit ? { limit } : undefined,
      }),
      transformResponse: (response: any) => {
        // Handle wrapped response from backend
        return Array.isArray(response) ? response : (response?.data || []);
      },
      providesTags: ["RoomSchedule"],
    }),

    // Get current user's schedules by date
    getMySchedulesByDate: builder.query<
      RoomSchedule[],
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
      providesTags: ["RoomSchedule"],
    }),

    // Get current user's schedules by date range
    getMySchedulesByDateRange: builder.query<
      RoomSchedule[],
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
      providesTags: ["RoomSchedule"],
    }),

    // Get schedules by date range
    getSchedulesByDateRange: builder.query<
     RoomSchedule[],
      { startDate: string; endDate: string; filters?: Partial<RoomScheduleSearchFilters> }
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
      providesTags: ["RoomSchedule"],
    }),

    // Get schedules for specific date
    getSchedulesByDate: builder.query<
      RoomSchedule[],
      { date: string; filters?: Partial<RoomScheduleSearchFilters> }
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
      providesTags: ["RoomSchedule"],
    }),

    // Get schedule statistics
    getScheduleStats: builder.query<ScheduleStats, RoomScheduleSearchFilters>({
      query: (filters) => ({
        url: "/stats",
        method: "GET",
        params: filters,
      }),
      providesTags: ["Stats"],
    }),

    // Create employee schedule
    createRoomSchedule: builder.mutation<RoomSchedule, CreateRoomScheduleDto>({
      query: (data) => ({
        url: "",
        method: "POST",
        data,
      }),
      invalidatesTags: (result, error) => {
        if (result?.schedule_id) {
          return [
            { type: "RoomSchedule", id: result.schedule_id },
            "RoomSchedule",
            "Stats",
          ];
        }
        return ["RoomSchedule", "Stats"];
      },
    }),

    // Update employee schedule
    updateRoomSchedule: builder.mutation<
      RoomSchedule,
      { id: string; data: UpdateRoomScheduleDto }
    >({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RoomSchedule", id },
        "RoomSchedule",
        "Stats",
      ],
    }),

    // Delete employee schedule
    deleteRoomSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RoomSchedule", "Stats"],
    }),

    // Bulk create schedules
    bulkCreateSchedules: builder.mutation<RoomSchedule[], CreateRoomScheduleDto[]>({
      query: (data) => ({
        url: "/bulk",
        method: "POST",
        data,
      }),
      invalidatesTags: ["RoomSchedule", "Stats"],
    }),

    // Update schedule status
    updateScheduleStatus: builder.mutation<
      RoomSchedule,
      { id: string; status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' }
    >({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        data: { schedule_status: status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RoomSchedule", id },
        "RoomSchedule",
        "Stats",
      ],
    }),

    // Get available employees for scheduling
    getAvailableEmployees: builder.query<Employee[], { 
      date: string; 
      time?: string; 
      startTime?: string; 
      endTime?: string;
      search?: string;
      role?: string;
      departmentId?: string;
    }>({
      query: ({ date, time, startTime, endTime, search, role, departmentId }) => {
        const params: Record<string, string> = { date };
        if (time) params.time = time;
        if (startTime) params.startTime = startTime;
        if (endTime) params.endTime = endTime;
        if (search) params.search = search;
        if (role) params.role = role;
        if (departmentId) params.departmentId = departmentId;
        return {
          url: "/available-employees",
          method: "GET",
          params,
        };
      },
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
  useGetRoomSchedulesQuery,
  useGetRoomSchedulesPaginatedQuery,
  useGetRoomScheduleByIdQuery,
  useGetMySchedulesQuery,
  useGetMySchedulesByDateQuery,
  useGetMySchedulesByDateRangeQuery,
  useGetSchedulesByDateRangeQuery,
  useGetSchedulesByDateQuery,
  useGetScheduleStatsQuery,
  useCreateRoomScheduleMutation,
  useUpdateRoomScheduleMutation,
  useDeleteRoomScheduleMutation,
  useBulkCreateSchedulesMutation,
  useUpdateScheduleStatusMutation,
  useGetAvailableEmployeesQuery,
  useGetAvailableRoomsQuery,
  useGetShiftTemplatesQuery,
} = RoomScheduleApi;
