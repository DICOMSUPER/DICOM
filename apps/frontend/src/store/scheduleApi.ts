import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ScheduleFormData } from "@/schemas/schedule-schema";
import { Department } from "@/types";

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId?: string;
  isVerified: boolean;
  role?: string;
  departmentId?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  queueStats?: {
    currentInProgress: { queueNumber: number | null };
    maxWaiting: { queueNumber: number | null };
  };
}

export interface Room {
  room_id: string;
  room_code: string;
  room_type: "CT" | "WC";
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  id: string;
  roomCode: string;
  roomType: string;
  floor: string;
  department: Department;
}

export interface ShiftTemplate {
  shift_template_id: string;
  shift_name: string;
  shift_type: "morning" | "afternoon" | "night" | "full_day" | "custom";
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  description?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeSchedule {
  schedule_id: string;
  employee_id: string;
  room_id?: string;
  shift_template_id?: string;
  work_date: string;
  actual_start_time?: string;
  actual_end_time?: string;
  schedule_status:
    | "scheduled"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "no_show";
  notes?: string;
  overtime_hours: number;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  employee: User;
  room?: Room;
  shift_template?: ShiftTemplate;
}

export interface ScheduleSearchFilters {
  employee_id?: string;
  room_id?: string;
  work_date_from?: string;
  work_date_to?: string;
  schedule_status?: string;
  search?: string;
  search_field?: string;
  sort_field?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Working Hours Interfaces
export interface WorkingHours {
  id: string;
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  description?: string;
  breakTimes?: BreakTime[];
  createdAt: string;
  updatedAt: string;
}

export interface BreakTime {
  id: string;
  breakName: string;
  startTime: string;
  endTime: string;
  workingHoursId: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SpecialHours {
  id: string;
  date: string;
  startTime?: string;
  endTime?: string;
  isHoliday: boolean;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHoursFormData {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  description?: string;
}

export interface BreakTimeFormData {
  breakName: string;
  startTime: string;
  endTime: string;
  workingHoursId: string;
  description?: string;
}

export interface SpecialHoursFormData {
  date: string;
  startTime?: string;
  endTime?: string;
  isHoliday: boolean;
  description?: string;
}

export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
  baseQuery: axiosBaseQuery(""),
  tagTypes: [
    "EmployeeSchedule",
    "ShiftTemplate",
    "Room",
    "ScheduleStats",
    "WorkingHours",
    "BreakTimes",
    "SpecialHours",
  ],
  endpoints: (builder) => ({
    // Employee Schedules
    getEmployeeSchedules: builder.query<
      PaginatedResponse<EmployeeSchedule>,
      {
        page?: number;
        limit?: number;
        employee_id?: string;
        room_id?: string;
        work_date_from?: string;
        work_date_to?: string;
        schedule_status?: string;
        search?: string;
        search_field?: string;
        sort_field?: string;
        order?: "asc" | "desc";
      }
    >({
      query: (params: any) => ({
        url: "/employee-schedules",
        method: "GET",
        params,
      }),
      providesTags: ["EmployeeSchedule"],
    }),

    getEmployeeScheduleById: builder.query<EmployeeSchedule, string>({
      query: (id: string) => ({
        url: `/employee-schedules/${id}`,
        method: "GET",
      }),
      providesTags: (result: any, error: any, id: string) => [
        { type: "EmployeeSchedule", id },
      ],
    }),

    createEmployeeSchedule: builder.mutation<
      EmployeeSchedule,
      ScheduleFormData
    >({
      query: (schedule: ScheduleFormData) => ({
        url: "/employee-schedules",
        method: "POST",
        data: schedule,
      }),
      invalidatesTags: ["EmployeeSchedule"],
    }),

    updateEmployeeSchedule: builder.mutation<
      EmployeeSchedule,
      { id: string; updates: Partial<ScheduleFormData> }
    >({
      query: ({
        id,
        updates,
      }: {
        id: string;
        updates: Partial<ScheduleFormData>;
      }) => ({
        url: `/employee-schedules/${id}`,
        method: "PATCH",
        data: updates,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: "EmployeeSchedule", id },
        "EmployeeSchedule",
      ],
    }),

    deleteEmployeeSchedule: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `/employee-schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmployeeSchedule"],
    }),

    // Shift Templates
    getShiftTemplates: builder.query<
      PaginatedResponse<ShiftTemplate>,
      {
        page?: number;
        limit?: number;
        shift_type?: string;
        is_active?: boolean;
      }
    >({
      query: (params: any) => ({
        url: "/shift-templates",
        method: "GET",
        params,
      }),
      providesTags: ["ShiftTemplate"],
    }),

    getShiftTemplateById: builder.query<ShiftTemplate, string>({
      query: (id: string) => ({
        url: `/shift-templates/${id}`,
        method: "GET",
      }),
      providesTags: (result: any, error: any, id: string) => [
        { type: "ShiftTemplate", id },
      ],
    }),

    getShiftTemplatesByType: builder.query<ShiftTemplate[], string>({
      query: (shift_type: string) => ({
        url: `/shift-templates/type/${shift_type}`,
        method: "GET",
      }),
      providesTags: ["ShiftTemplate"],
    }),

    getActiveShiftTemplates: builder.query<ShiftTemplate[], void>({
      query: () => ({
        url: "/shift-templates/active",
        method: "GET",
      }),
      providesTags: ["ShiftTemplate"],
    }),

    createShiftTemplate: builder.mutation<ShiftTemplate, any>({
      query: (template: any) => ({
        url: "/shift-templates",
        method: "POST",
        data: template,
      }),
      invalidatesTags: ["ShiftTemplate"],
    }),

    updateShiftTemplate: builder.mutation<
      ShiftTemplate,
      { id: string; updates: any }
    >({
      query: ({ id, updates }: { id: string; updates: any }) => ({
        url: `/shift-templates/${id}`,
        method: "PATCH",
        data: updates,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: "ShiftTemplate", id },
        "ShiftTemplate",
      ],
    }),

    deleteShiftTemplate: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `/shift-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ShiftTemplate"],
    }),

    // Rooms
    getRooms: builder.query<
      PaginatedResponse<Room>,
      {
        page?: number;
        limit?: number;
        room_type?: string;
        is_active?: boolean;
      }
    >({
      query: (params: any) => ({
        url: "/rooms",
        method: "GET",
        params,
      }),
      providesTags: ["Room"],
    }),

    getRoomById: builder.query<Room, string>({
      query: (id: string) => ({
        url: `/rooms/${id}`,
        method: "GET",
      }),
      providesTags: (result: any, error: any, id: string) => [
        { type: "Room", id },
      ],
    }),

    getRoomsByType: builder.query<Room[], string>({
      query: (room_type: string) => ({
        url: `/rooms/type/${room_type}`,
        method: "GET",
      }),
      providesTags: ["Room"],
    }),

    createRoom: builder.mutation<Room, any>({
      query: (room: any) => ({
        url: "/rooms",
        method: "POST",
        data: room,
      }),
      invalidatesTags: ["Room"],
    }),

    updateRoom: builder.mutation<Room, { id: string; updates: any }>({
      query: ({ id, updates }: { id: string; updates: any }) => ({
        url: `/rooms/${id}`,
        method: "PATCH",
        data: updates,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: "Room", id },
        "Room",
      ],
    }),

    deleteRoom: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `/rooms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),

    // Schedule Statistics
    getScheduleStats: builder.query<any, { employee_id?: string }>({
      query: ({ employee_id }: { employee_id?: string }) => ({
        url: "/employee-schedules/stats",
        method: "GET",
        params: { employee_id },
      }),
      providesTags: ["ScheduleStats"],
    }),

    // Working Hours
    getWorkingHours: builder.query<
      PaginatedResponse<WorkingHours>,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: (params: any) => ({
        url: "/working-hours",
        method: "GET",
        params,
      }),
      providesTags: ["WorkingHours"],
    }),

    getWorkingHoursById: builder.query<WorkingHours, string>({
      query: (id: string) => ({
        url: `/working-hours/${id}`,
        method: "GET",
      }),
      providesTags: (result: any, error: any, id: string) => [
        { type: "WorkingHours", id },
      ],
    }),

    createWorkingHours: builder.mutation<WorkingHours, WorkingHoursFormData>({
      query: (data: WorkingHoursFormData) => ({
        url: "/working-hours",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["WorkingHours"],
    }),

    updateWorkingHours: builder.mutation<
      WorkingHours,
      { id: string; data: Partial<WorkingHoursFormData> }
    >({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<WorkingHoursFormData>;
      }) => ({
        url: `/working-hours/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: "WorkingHours", id },
        "WorkingHours",
      ],
    }),

    deleteWorkingHours: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/working-hours/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WorkingHours"],
    }),

    // Break Times
    getBreakTimes: builder.query<BreakTime[], string>({
      query: (workingHoursId: string) => ({
        url: `/working-hours/break-times/${workingHoursId}`,
        method: "GET",
      }),
      providesTags: ["BreakTimes"],
    }),

    createBreakTime: builder.mutation<BreakTime, BreakTimeFormData>({
      query: (data: BreakTimeFormData) => ({
        url: "/working-hours/break-times",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["BreakTimes", "WorkingHours"],
    }),

    updateBreakTime: builder.mutation<
      BreakTime,
      { id: string; data: Partial<BreakTimeFormData> }
    >({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<BreakTimeFormData>;
      }) => ({
        url: `/working-hours/break-times/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: "BreakTimes", id },
        "BreakTimes",
        "WorkingHours",
      ],
    }),

    deleteBreakTime: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/working-hours/break-times/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BreakTimes", "WorkingHours"],
    }),

    // Special Hours
    getSpecialHours: builder.query<
      PaginatedResponse<SpecialHours>,
      {
        page?: number;
        limit?: number;
      }
    >({
      query: (params: any) => ({
        url: "/working-hours/special-hours",
        method: "GET",
        params,
      }),
      providesTags: ["SpecialHours"],
    }),

    getSpecialHoursById: builder.query<SpecialHours, string>({
      query: (id: string) => ({
        url: `/working-hours/special-hours/${id}`,
        method: "GET",
      }),
      providesTags: (result: any, error: any, id: string) => [
        { type: "SpecialHours", id },
      ],
    }),

    createSpecialHours: builder.mutation<SpecialHours, SpecialHoursFormData>({
      query: (data: SpecialHoursFormData) => ({
        url: "/working-hours/special-hours",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["SpecialHours"],
    }),

    updateSpecialHours: builder.mutation<
      SpecialHours,
      { id: string; data: Partial<SpecialHoursFormData> }
    >({
      query: ({
        id,
        data,
      }: {
        id: string;
        data: Partial<SpecialHoursFormData>;
      }) => ({
        url: `/working-hours/special-hours/${id}`,
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: "SpecialHours", id },
        "SpecialHours",
      ],
    }),

    deleteSpecialHours: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/working-hours/special-hours/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SpecialHours"],
    }),

    // Working Hours Utilities
    checkTimeAvailability: builder.query<
      boolean,
      {
        date: string;
        start_time: string;
        end_time: string;
      }
    >({
      query: (params: any) => ({
        url: "/working-hours/check-availability",
        method: "GET",
        params,
      }),
    }),

    getWorkingHoursForDate: builder.query<
      {
        workingHours: WorkingHours | null;
        specialHours: SpecialHours | null;
      },
      string
    >({
      query: (date: string) => ({
        url: `/working-hours/for-date/${date}`,
        method: "GET",
      }),
    }),

    // Bulk Operations
    createBulkSchedules: builder.mutation<
      EmployeeSchedule[],
      ScheduleFormData[]
    >({
      query: (schedules: ScheduleFormData[]) => ({
        url: "/employee-schedules/bulk",
        method: "POST",
        data: { schedules },
      }),
      invalidatesTags: ["EmployeeSchedule"],
    }),

    updateBulkSchedules: builder.mutation<
      EmployeeSchedule[],
      { updates: { id: string; data: Partial<ScheduleFormData> }[] }
    >({
      query: (data: {
        updates: { id: string; data: Partial<ScheduleFormData> }[];
      }) => ({
        url: "/employee-schedules/bulk",
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["EmployeeSchedule"],
    }),

    deleteBulkSchedules: builder.mutation<boolean, { ids: string[] }>({
      query: (data: { ids: string[] }) => ({
        url: "/employee-schedules/bulk",
        method: "DELETE",
        data: data,
      }),
      invalidatesTags: ["EmployeeSchedule"],
    }),

    copyWeekSchedules: builder.mutation<
      EmployeeSchedule[],
      {
        source_week_start: string;
        target_week_start: string;
        employee_id?: string;
      }
    >({
      query: (data: {
        source_week_start: string;
        target_week_start: string;
        employee_id?: string;
      }) => ({
        url: "/employee-schedules/copy-week",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["EmployeeSchedule"],
    }),

    // Conflict Detection
    checkScheduleConflict: builder.query<
      {
        hasConflict: boolean;
        conflictingSchedule?: EmployeeSchedule;
      },
      {
        employee_id: string;
        date: string;
        start_time: string;
        end_time: string;
        exclude_schedule_id?: string;
      }
    >({
      query: (params: any) => ({
        url: "/employee-schedules/check-conflict",
        method: "POST",
        data: params,
      }),
    }),

    validateSchedulesAgainstWorkingHours: builder.query<
      {
        valid: boolean;
        violations: { schedule: EmployeeSchedule; reason: string }[];
      },
      { schedules: EmployeeSchedule[] }
    >({
      query: (data: { schedules: EmployeeSchedule[] }) => ({
        url: "/employee-schedules/validate-working-hours",
        method: "POST",
        data: data,
      }),
    }),

    // Template Operations
    duplicateShiftTemplate: builder.mutation<
      ShiftTemplate,
      { id: string; new_name: string }
    >({
      query: (data: { id: string; new_name: string }) => ({
        url: `/shift-templates/duplicate/${data.id}`,
        method: "POST",
        data: { new_name: data.new_name },
      }),
      invalidatesTags: ["ShiftTemplate"],
    }),

    createSchedulesFromTemplate: builder.mutation<
      {
        success: number;
        failed: number;
        errors: string[];
      },
      {
        template_id: string;
        dates: string[];
        employee_ids: string[];
      }
    >({
      query: (data: {
        template_id: string;
        dates: string[];
        employee_ids: string[];
      }) => ({
        url: "/shift-templates/create-from-template",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["EmployeeSchedule", "ShiftTemplate"],
    }),

    applyTemplateToEmployees: builder.mutation<
      {
        success: number;
        failed: number;
        errors: string[];
      },
      {
        template_id: string;
        employee_ids: string[];
        start_date: string;
        end_date: string;
      }
    >({
      query: (data: {
        template_id: string;
        employee_ids: string[];
        start_date: string;
        end_date: string;
      }) => ({
        url: "/shift-templates/apply-to-employees",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["EmployeeSchedule", "ShiftTemplate"],
    }),
  }),
});

export const {
  useGetEmployeeSchedulesQuery,
  useGetEmployeeScheduleByIdQuery,
  useCreateEmployeeScheduleMutation,
  useUpdateEmployeeScheduleMutation,
  useDeleteEmployeeScheduleMutation,
  useGetShiftTemplatesQuery,
  useGetShiftTemplateByIdQuery,
  useGetShiftTemplatesByTypeQuery,
  useGetActiveShiftTemplatesQuery,
  useCreateShiftTemplateMutation,
  useUpdateShiftTemplateMutation,
  useDeleteShiftTemplateMutation,
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useGetRoomsByTypeQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetScheduleStatsQuery,
  // Working Hours
  useGetWorkingHoursQuery,
  useGetWorkingHoursByIdQuery,
  useCreateWorkingHoursMutation,
  useUpdateWorkingHoursMutation,
  useDeleteWorkingHoursMutation,
  // Break Times
  useGetBreakTimesQuery,
  useCreateBreakTimeMutation,
  useUpdateBreakTimeMutation,
  useDeleteBreakTimeMutation,
  // Special Hours
  useGetSpecialHoursQuery,
  useGetSpecialHoursByIdQuery,
  useCreateSpecialHoursMutation,
  useUpdateSpecialHoursMutation,
  useDeleteSpecialHoursMutation,
  // Working Hours Utilities
  useCheckTimeAvailabilityQuery,
  useGetWorkingHoursForDateQuery,
  // Bulk Operations
  useCreateBulkSchedulesMutation,
  useUpdateBulkSchedulesMutation,
  useDeleteBulkSchedulesMutation,
  useCopyWeekSchedulesMutation,
  // Conflict Detection
  useCheckScheduleConflictQuery,
  useValidateSchedulesAgainstWorkingHoursQuery,
  // Template Operations
  useDuplicateShiftTemplateMutation,
  useCreateSchedulesFromTemplateMutation,
  useApplyTemplateToEmployeesMutation,
} = scheduleApi;
