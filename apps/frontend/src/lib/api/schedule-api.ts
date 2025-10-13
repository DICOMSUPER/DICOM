import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './axiosBaseQuery';
import { ScheduleFormData } from '@/schemas/schedule-schema';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
}

export interface Room {
  id: string;
  roomCode: string;
  roomType: 'CT' | 'WC';
  description: string;
  isActive: boolean;
}

export interface ShiftTemplate {
  id: string;
  shiftName: string;
  shiftType: 'morning' | 'afternoon' | 'night' | 'full_day' | 'custom';
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  description?: string;
  isActive: boolean;
}

export interface EmployeeSchedule {
  id: string;
  employee: Employee;
  room?: Room;
  shiftTemplate?: ShiftTemplate;
  workDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  scheduleStatus: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  overtimeHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSearchFilters {
  employeeId?: string;
  roomId?: string;
  workDateFrom?: string;
  workDateTo?: string;
  scheduleStatus?: string;
  search?: string;
  searchField?: string;
  sortField?: string;
  order?: 'asc' | 'desc';
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
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
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
  reducerPath: 'scheduleApi',
  baseQuery,
  tagTypes: ['EmployeeSchedule', 'ShiftTemplate', 'Room', 'ScheduleStats', 'WorkingHours', 'BreakTimes', 'SpecialHours'],
  endpoints: (builder) => ({
    // Employee Schedules
    getEmployeeSchedules: builder.query<PaginatedResponse<EmployeeSchedule>, {
      page?: number;
      limit?: number;
      employeeId?: string;
      roomId?: string;
      workDateFrom?: string;
      workDateTo?: string;
      scheduleStatus?: string;
      search?: string;
      searchField?: string;
      sortField?: string;
      order?: 'asc' | 'desc';
    }>({
      query: (params: any) => ({
        url: '/employee-schedules',
        params,
      }),
      providesTags: ['EmployeeSchedule'],
    }),

    getEmployeeScheduleById: builder.query<EmployeeSchedule, string>({
      query: (id: string) => `/employee-schedules/${id}`,
      providesTags: (result: any, error: any, id: string) => [{ type: 'EmployeeSchedule', id }],
    }),

    getSchedulesByEmployee: builder.query<EmployeeSchedule[], { employeeId: string; limit?: number }>({
      query: ({ employeeId, limit }: { employeeId: string; limit?: number }) => ({
        url: `/employee-schedules/employee/${employeeId}`,
        params: { limit },
      }),
      providesTags: ['EmployeeSchedule'],
    }),

    getSchedulesByDateRange: builder.query<EmployeeSchedule[], {
      startDate: string;
      endDate: string;
      employeeId?: string;
    }>({
      query: ({ startDate, endDate, employeeId }: { startDate: string; endDate: string; employeeId?: string }) => ({
        url: '/employee-schedules/date-range',
        params: { startDate, endDate, employeeId },
      }),
      providesTags: ['EmployeeSchedule'],
    }),

    getSchedulesByRoomAndDate: builder.query<EmployeeSchedule[], { roomId: string; workDate: string }>({
      query: ({ roomId, workDate }: { roomId: string; workDate: string }) => ({
        url: '/employee-schedules/room-date',
        params: { roomId, workDate },
      }),
      providesTags: ['EmployeeSchedule'],
    }),

    createEmployeeSchedule: builder.mutation<EmployeeSchedule, ScheduleFormData>({
      query: (schedule: ScheduleFormData) => ({
        url: '/employee-schedules',
        method: 'POST',
        body: schedule,
      }),
      invalidatesTags: ['EmployeeSchedule'],
    }),

    updateEmployeeSchedule: builder.mutation<EmployeeSchedule, { id: string; updates: Partial<ScheduleFormData> }>({
      query: ({ id, updates }: { id: string; updates: Partial<ScheduleFormData> }) => ({
        url: `/employee-schedules/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: 'EmployeeSchedule', id },
        'EmployeeSchedule'
      ],
    }),

    deleteEmployeeSchedule: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `/employee-schedules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmployeeSchedule'],
    }),

    // Shift Templates
    getShiftTemplates: builder.query<PaginatedResponse<ShiftTemplate>, {
      page?: number;
      limit?: number;
      shiftType?: string;
      isActive?: boolean;
    }>({
      query: (params: any) => ({
        url: '/shift-templates',
        params,
      }),
      providesTags: ['ShiftTemplate'],
    }),

    getShiftTemplateById: builder.query<ShiftTemplate, string>({
      query: (id: string) => `/shift-templates/${id}`,
      providesTags: (result: any, error: any, id: string) => [{ type: 'ShiftTemplate', id }],
    }),

    getShiftTemplatesByType: builder.query<ShiftTemplate[], string>({
      query: (shiftType: string) => `/shift-templates/type/${shiftType}`,
      providesTags: ['ShiftTemplate'],
    }),

    getActiveShiftTemplates: builder.query<ShiftTemplate[], void>({
      query: () => '/shift-templates/active',
      providesTags: ['ShiftTemplate'],
    }),

    createShiftTemplate: builder.mutation<ShiftTemplate, any>({
      query: (template: any) => ({
        url: '/shift-templates',
        method: 'POST',
        body: template,
      }),
      invalidatesTags: ['ShiftTemplate'],
    }),

    updateShiftTemplate: builder.mutation<ShiftTemplate, { id: string; updates: any }>({
      query: ({ id, updates }: { id: string; updates: any }) => ({
        url: `/shift-templates/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: 'ShiftTemplate', id },
        'ShiftTemplate'
      ],
    }),

    deleteShiftTemplate: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `/shift-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShiftTemplate'],
    }),

    // Rooms
    getRooms: builder.query<PaginatedResponse<Room>, {
      page?: number;
      limit?: number;
      roomType?: string;
      isActive?: boolean;
    }>({
      query: (params: any) => ({
        url: '/rooms',
        params,
      }),
      providesTags: ['Room'],
    }),

    getRoomById: builder.query<Room, string>({
      query: (id: string) => `/rooms/${id}`,
      providesTags: (result: any, error: any, id: string) => [{ type: 'Room', id }],
    }),

    getRoomsByType: builder.query<Room[], string>({
      query: (roomType: string) => `/rooms/type/${roomType}`,
      providesTags: ['Room'],
    }),

    createRoom: builder.mutation<Room, any>({
      query: (room: any) => ({
        url: '/rooms',
        method: 'POST',
        body: room,
      }),
      invalidatesTags: ['Room'],
    }),

    updateRoom: builder.mutation<Room, { id: string; updates: any }>({
      query: ({ id, updates }: { id: string; updates: any }) => ({
        url: `/rooms/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: 'Room', id },
        'Room'
      ],
    }),

    deleteRoom: builder.mutation<boolean, string>({
      query: (id: string) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),

    // Schedule Statistics
    getScheduleStats: builder.query<any, { employeeId?: string }>({
      query: ({ employeeId }: { employeeId?: string }) => ({
        url: '/employee-schedules/stats',
        params: { employeeId },
      }),
      providesTags: ['ScheduleStats'],
    }),

    // Working Hours
    getWorkingHours: builder.query<PaginatedResponse<WorkingHours>, {
      page?: number;
      limit?: number;
    }>({
      query: (params: any) => ({
        url: '/working-hours',
        params,
      }),
      providesTags: ['WorkingHours'],
    }),

    getWorkingHoursById: builder.query<WorkingHours, string>({
      query: (id: string) => `/working-hours/${id}`,
      providesTags: (result: any, error: any, id: string) => [{ type: 'WorkingHours', id }],
    }),

    createWorkingHours: builder.mutation<WorkingHours, WorkingHoursFormData>({
      query: (data: WorkingHoursFormData) => ({
        url: '/working-hours',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WorkingHours'],
    }),

    updateWorkingHours: builder.mutation<WorkingHours, { id: string; data: Partial<WorkingHoursFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<WorkingHoursFormData> }) => ({
        url: `/working-hours/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: 'WorkingHours', id },
        'WorkingHours'
      ],
    }),

    deleteWorkingHours: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/working-hours/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WorkingHours'],
    }),

    // Break Times
    getBreakTimes: builder.query<BreakTime[], string>({
      query: (workingHoursId: string) => `/working-hours/break-times/${workingHoursId}`,
      providesTags: ['BreakTimes'],
    }),

    createBreakTime: builder.mutation<BreakTime, BreakTimeFormData>({
      query: (data: BreakTimeFormData) => ({
        url: '/working-hours/break-times',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['BreakTimes', 'WorkingHours'],
    }),

    updateBreakTime: builder.mutation<BreakTime, { id: string; data: Partial<BreakTimeFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<BreakTimeFormData> }) => ({
        url: `/working-hours/break-times/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: 'BreakTimes', id },
        'BreakTimes',
        'WorkingHours'
      ],
    }),

    deleteBreakTime: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/working-hours/break-times/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BreakTimes', 'WorkingHours'],
    }),

    // Special Hours
    getSpecialHours: builder.query<PaginatedResponse<SpecialHours>, {
      page?: number;
      limit?: number;
    }>({
      query: (params: any) => ({
        url: '/working-hours/special-hours',
        params,
      }),
      providesTags: ['SpecialHours'],
    }),

    getSpecialHoursById: builder.query<SpecialHours, string>({
      query: (id: string) => `/working-hours/special-hours/${id}`,
      providesTags: (result: any, error: any, id: string) => [{ type: 'SpecialHours', id }],
    }),

    createSpecialHours: builder.mutation<SpecialHours, SpecialHoursFormData>({
      query: (data: SpecialHoursFormData) => ({
        url: '/working-hours/special-hours',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SpecialHours'],
    }),

    updateSpecialHours: builder.mutation<SpecialHours, { id: string; data: Partial<SpecialHoursFormData> }>({
      query: ({ id, data }: { id: string; data: Partial<SpecialHoursFormData> }) => ({
        url: `/working-hours/special-hours/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: 'SpecialHours', id },
        'SpecialHours'
      ],
    }),

    deleteSpecialHours: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/working-hours/special-hours/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SpecialHours'],
    }),

    // Working Hours Utilities
    checkTimeAvailability: builder.query<boolean, {
      date: string;
      startTime: string;
      endTime: string;
    }>({
      query: (params: any) => ({
        url: '/working-hours/check-availability',
        params,
      }),
    }),

    getWorkingHoursForDate: builder.query<{
      workingHours: WorkingHours | null;
      specialHours: SpecialHours | null;
    }, string>({
      query: (date: string) => `/working-hours/for-date/${date}`,
    }),

    // Bulk Operations
    createBulkSchedules: builder.mutation<EmployeeSchedule[], ScheduleFormData[]>({
      query: (schedules: ScheduleFormData[]) => ({
        url: '/employee-schedules/bulk',
        method: 'POST',
        body: { schedules },
      }),
      invalidatesTags: ['EmployeeSchedule'],
    }),

    updateBulkSchedules: builder.mutation<EmployeeSchedule[], { updates: { id: string; data: Partial<ScheduleFormData> }[] }>({
      query: (data: { updates: { id: string; data: Partial<ScheduleFormData> }[] }) => ({
        url: '/employee-schedules/bulk',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['EmployeeSchedule'],
    }),

    deleteBulkSchedules: builder.mutation<boolean, { ids: string[] }>({
      query: (data: { ids: string[] }) => ({
        url: '/employee-schedules/bulk',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['EmployeeSchedule'],
    }),

    copyWeekSchedules: builder.mutation<EmployeeSchedule[], {
      sourceWeekStart: string;
      targetWeekStart: string;
      employeeId?: string;
    }>({
      query: (data: { sourceWeekStart: string; targetWeekStart: string; employeeId?: string }) => ({
        url: '/employee-schedules/copy-week',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EmployeeSchedule'],
    }),

    // Conflict Detection
    checkScheduleConflict: builder.query<{
      hasConflict: boolean;
      conflictingSchedule?: EmployeeSchedule;
    }, {
      employeeId: string;
      date: string;
      startTime: string;
      endTime: string;
      excludeScheduleId?: string;
    }>({
      query: (params: any) => ({
        url: '/employee-schedules/check-conflict',
        method: 'POST',
        body: params,
      }),
    }),

    validateSchedulesAgainstWorkingHours: builder.query<{
      valid: boolean;
      violations: { schedule: EmployeeSchedule; reason: string }[];
    }, { schedules: EmployeeSchedule[] }>({
      query: (data: { schedules: EmployeeSchedule[] }) => ({
        url: '/employee-schedules/validate-working-hours',
        method: 'POST',
        body: data,
      }),
    }),

    // Template Operations
    duplicateShiftTemplate: builder.mutation<ShiftTemplate, { id: string; newName: string }>({
      query: (data: { id: string; newName: string }) => ({
        url: `/shift-templates/duplicate/${data.id}`,
        method: 'POST',
        body: { newName: data.newName },
      }),
      invalidatesTags: ['ShiftTemplate'],
    }),

    createSchedulesFromTemplate: builder.mutation<{
      success: number;
      failed: number;
      errors: string[];
    }, {
      templateId: string;
      dates: string[];
      employeeIds: string[];
    }>({
      query: (data: { templateId: string; dates: string[]; employeeIds: string[] }) => ({
        url: '/shift-templates/create-from-template',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EmployeeSchedule', 'ShiftTemplate'],
    }),

    applyTemplateToEmployees: builder.mutation<{
      success: number;
      failed: number;
      errors: string[];
    }, {
      templateId: string;
      employeeIds: string[];
      startDate: string;
      endDate: string;
    }>({
      query: (data: { templateId: string; employeeIds: string[]; startDate: string; endDate: string }) => ({
        url: '/shift-templates/apply-to-employees',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['EmployeeSchedule', 'ShiftTemplate'],
    }),
  }),
});

export const {
  useGetEmployeeSchedulesQuery,
  useGetEmployeeScheduleByIdQuery,
  useGetSchedulesByEmployeeQuery,
  useGetSchedulesByDateRangeQuery,
  useGetSchedulesByRoomAndDateQuery,
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
