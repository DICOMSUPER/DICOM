import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/lib/axiosBaseQuery";
import { ScheduleFormData } from "@/lib/validation/schedule-schema";
import { Department } from "@/interfaces/user/department.interface";


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
    currentInProgress?: { queueNumber: number | null };
    maxWaiting?: { queueNumber: number | null };
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
  queueStats?: {
    currentInProgress?: {
      queueNumber?: number;
      qa?: QueueAssignment;
    };
    maxWaiting?: {
      queueNumber?: number;
      qa?: QueueAssignment;
    };
  };
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

export interface ShiftTemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  inactiveTemplates: number;
  templatesByType?: Array<{ type: string; count: string }>;
}

export interface RoomSchedule {
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


export const scheduleApi = createApi({
  reducerPath: "scheduleApi",
  baseQuery: axiosBaseQuery(""),
  tagTypes: [
    "RoomSchedule",
    "ShiftTemplate",
    "Room",
    "ScheduleStats",
  ],
  endpoints: (builder) => ({
    // Employee Schedules
    getRoomSchedules: builder.query<
      PaginatedResponse<RoomSchedule>,
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
        url: "/room-schedules",
        method: "GET",
        params,
      }),
      providesTags: ["RoomSchedule"],
    }),

    getRoomScheduleById: builder.query<RoomSchedule, string>({
      query: (id: string) => ({
        url: `/room-schedules/${id}`,
        method: "GET",
      }),
      providesTags: (result: any, error: any, id: string) => [
        { type: "RoomSchedule", id },
      ],
    }),

    createRoomSchedule: builder.mutation<
      RoomSchedule,
      ScheduleFormData
    >({
      query: (schedule: ScheduleFormData) => ({
        url: "/room-schedules",
        method: "POST",
        data: schedule,
      }),
      transformResponse: (response: any) => {
        // Handle response structure: { data: { schedule: ... }, ... } or { schedule: ... } or direct schedule
        if (response?.data?.schedule) {
          return response.data.schedule;
        }
        if (response?.schedule) {
          return response.schedule;
        }
        return response;
      },
      invalidatesTags: ["RoomSchedule"],
    }),

    updateRoomSchedule: builder.mutation<
      RoomSchedule,
      { id: string; updates: Partial<ScheduleFormData> }
    >({
      query: ({
        id,
        updates,
      }: {
        id: string;
        updates: Partial<ScheduleFormData>;
      }) => ({
        url: `/room-schedules/${id}`,
        method: "PATCH",
        data: updates,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: "RoomSchedule", id },
        "RoomSchedule",
      ],
    }),

    deleteRoomSchedule: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `/room-schedules/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["RoomSchedule"],
    }),

    // Shift Templates
    getShiftTemplates: builder.query<
      PaginatedResponse<ShiftTemplate>,
      {
        page?: number;
        limit?: number;
        shift_type?: string;
        is_active?: boolean;
        includeInactive?: boolean;
        includeDeleted?: boolean;
        sortBy?: string;
        order?: "asc" | "desc";
      }
    >({
      query: (params: any) => ({
        url: "/shift-templates",
        method: "GET",
        params: {
          ...params,
          sortField: params?.sortBy || params?.sort_field, // Map sortBy to sortField for backend
          order: params?.order,
        },
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

    getShiftTemplateStats: builder.query<ShiftTemplateStats, void>({
      query: () => ({
        url: "/shift-templates/stats",
        method: "GET",
      }),
      transformResponse: (response: any) => response?.data || response,
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
        url: "/room-schedules/stats",
        method: "GET",
        params: { employee_id },
      }),
      providesTags: ["ScheduleStats"],
    }),

    // Bulk Operations
    createBulkSchedules: builder.mutation<
      RoomSchedule[],
      ScheduleFormData[]
    >({
      query: (schedules: ScheduleFormData[]) => ({
        url: "/room-schedules/bulk",
        method: "POST",
        data: { schedules },
      }),
      invalidatesTags: ["RoomSchedule"],
    }),

    updateBulkSchedules: builder.mutation<
      RoomSchedule[],
      { updates: { id: string; data: Partial<ScheduleFormData> }[] }
    >({
      query: (data: {
        updates: { id: string; data: Partial<ScheduleFormData> }[];
      }) => ({
        url: "/room-schedules/bulk",
        method: "PATCH",
        data: data,
      }),
      invalidatesTags: ["RoomSchedule"],
    }),

    deleteBulkSchedules: builder.mutation<boolean, { ids: string[] }>({
      query: (data: { ids: string[] }) => ({
        url: "/room-schedules/bulk",
        method: "DELETE",
        data: data,
      }),
      invalidatesTags: ["RoomSchedule"],
    }),

    copyWeekSchedules: builder.mutation<
      RoomSchedule[],
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
        url: "/room-schedules/copy-week",
        method: "POST",
        data: data,
      }),
      invalidatesTags: ["RoomSchedule"],
    }),

    // Conflict Detection
    checkScheduleConflict: builder.query<
      {
        hasConflict: boolean;
        conflictingSchedule?: RoomSchedule;
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
        url: "/room-schedules/check-conflict",
        method: "POST",
        data: params,
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
      invalidatesTags: ["RoomSchedule", "ShiftTemplate"],
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
      invalidatesTags: ["RoomSchedule", "ShiftTemplate"],
    }),
  }),
});

export const {
  useGetRoomSchedulesQuery,
  useGetRoomScheduleByIdQuery,
  useCreateRoomScheduleMutation,
  useUpdateRoomScheduleMutation,
  useDeleteRoomScheduleMutation,
  useGetShiftTemplatesQuery,
  useGetShiftTemplateByIdQuery,
  useGetShiftTemplatesByTypeQuery,
  useGetActiveShiftTemplatesQuery,
  useGetShiftTemplateStatsQuery,
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
  // Bulk Operations
  useCreateBulkSchedulesMutation,
  useUpdateBulkSchedulesMutation,
  useDeleteBulkSchedulesMutation,
  useCopyWeekSchedulesMutation,
  // Conflict Detection
  useCheckScheduleConflictQuery,
  // Template Operations
  useDuplicateShiftTemplateMutation,
  useCreateSchedulesFromTemplateMutation,
  useApplyTemplateToEmployeesMutation,
} = scheduleApi;
