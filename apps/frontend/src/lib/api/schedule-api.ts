import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from './base-query';

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
  limit?: number;
  offset?: number;
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
  reducerPath: 'scheduleApi',
  baseQuery,
  tagTypes: ['EmployeeSchedule', 'ShiftTemplate', 'Room', 'ScheduleStats'],
  endpoints: (builder) => ({
    // Employee Schedules
    getEmployeeSchedules: builder.query<PaginatedResponse<EmployeeSchedule>, {
      page?: number;
      limit?: number;
      search?: string;
      searchField?: string;
      sortField?: string;
      order?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/employee-schedules',
        params,
      }),
      providesTags: ['EmployeeSchedule'],
    }),

    getEmployeeScheduleById: builder.query<EmployeeSchedule, string>({
      query: (id) => `/employee-schedules/${id}`,
      providesTags: (result, error, id) => [{ type: 'EmployeeSchedule', id }],
    }),

    getSchedulesByEmployee: builder.query<EmployeeSchedule[], { employeeId: string; limit?: number }>({
      query: ({ employeeId, limit }) => ({
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
      query: ({ startDate, endDate, employeeId }) => ({
        url: '/employee-schedules/date-range',
        params: { startDate, endDate, employeeId },
      }),
      providesTags: ['EmployeeSchedule'],
    }),

    getSchedulesByRoomAndDate: builder.query<EmployeeSchedule[], {
      roomId: string;
      workDate: string;
    }>({
      query: ({ roomId, workDate }) => ({
        url: `/employee-schedules/room/${roomId}/date/${workDate}`,
      }),
      providesTags: ['EmployeeSchedule'],
    }),

    createEmployeeSchedule: builder.mutation<EmployeeSchedule, Partial<EmployeeSchedule>>({
      query: (schedule) => ({
        url: '/employee-schedules',
        method: 'POST',
        body: schedule,
      }),
      invalidatesTags: ['EmployeeSchedule', 'ScheduleStats'],
    }),

    updateEmployeeSchedule: builder.mutation<EmployeeSchedule, {
      id: string;
      updates: Partial<EmployeeSchedule>;
    }>({
      query: ({ id, updates }) => ({
        url: `/employee-schedules/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'EmployeeSchedule', id },
        'EmployeeSchedule',
        'ScheduleStats'
      ],
    }),

    deleteEmployeeSchedule: builder.mutation<void, string>({
      query: (id) => ({
        url: `/employee-schedules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['EmployeeSchedule', 'ScheduleStats'],
    }),

    // Shift Templates
    getShiftTemplates: builder.query<PaginatedResponse<ShiftTemplate>, {
      page?: number;
      limit?: number;
      search?: string;
      searchField?: string;
      sortField?: string;
      order?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/shift-templates',
        params,
      }),
      providesTags: ['ShiftTemplate'],
    }),

    getShiftTemplateById: builder.query<ShiftTemplate, string>({
      query: (id) => `/shift-templates/${id}`,
      providesTags: (result, error, id) => [{ type: 'ShiftTemplate', id }],
    }),

    getActiveShiftTemplates: builder.query<ShiftTemplate[], void>({
      query: () => '/shift-templates/active',
      providesTags: ['ShiftTemplate'],
    }),

    getShiftTemplatesByType: builder.query<ShiftTemplate[], string>({
      query: (shiftType) => `/shift-templates/type/${shiftType}`,
      providesTags: ['ShiftTemplate'],
    }),

    createShiftTemplate: builder.mutation<ShiftTemplate, Partial<ShiftTemplate>>({
      query: (template) => ({
        url: '/shift-templates',
        method: 'POST',
        body: template,
      }),
      invalidatesTags: ['ShiftTemplate'],
    }),

    updateShiftTemplate: builder.mutation<ShiftTemplate, {
      id: string;
      updates: Partial<ShiftTemplate>;
    }>({
      query: ({ id, updates }) => ({
        url: `/shift-templates/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'ShiftTemplate', id },
        'ShiftTemplate'
      ],
    }),

    deleteShiftTemplate: builder.mutation<void, string>({
      query: (id) => ({
        url: `/shift-templates/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ShiftTemplate'],
    }),

    // Rooms
    getRooms: builder.query<PaginatedResponse<Room>, {
      page?: number;
      limit?: number;
      search?: string;
      searchField?: string;
      sortField?: string;
      order?: 'asc' | 'desc';
    }>({
      query: (params) => ({
        url: '/rooms',
        params,
      }),
      providesTags: ['Room'],
    }),

    getRoomById: builder.query<Room, string>({
      query: (id) => `/rooms/${id}`,
      providesTags: (result, error, id) => [{ type: 'Room', id }],
    }),

    getActiveRooms: builder.query<Room[], void>({
      query: () => '/rooms/active',
      providesTags: ['Room'],
    }),

    getRoomsByType: builder.query<Room[], string>({
      query: (roomType) => `/rooms/type/${roomType}`,
      providesTags: ['Room'],
    }),

    createRoom: builder.mutation<Room, Partial<Room>>({
      query: (room) => ({
        url: '/rooms',
        method: 'POST',
        body: room,
      }),
      invalidatesTags: ['Room'],
    }),

    updateRoom: builder.mutation<Room, {
      id: string;
      updates: Partial<Room>;
    }>({
      query: ({ id, updates }) => ({
        url: `/rooms/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Room', id },
        'Room'
      ],
    }),

    deleteRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Room'],
    }),

    // Statistics
    getScheduleStats: builder.query<any, { employeeId?: string }>({
      query: ({ employeeId }) => ({
        url: '/employee-schedules/stats',
        params: { employeeId },
      }),
      providesTags: ['ScheduleStats'],
    }),

    getShiftTemplateStats: builder.query<any, void>({
      query: () => '/shift-templates/stats',
      providesTags: ['ScheduleStats'],
    }),

    getRoomStats: builder.query<any, void>({
      query: () => '/rooms/stats',
      providesTags: ['ScheduleStats'],
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
  useGetActiveShiftTemplatesQuery,
  useGetShiftTemplatesByTypeQuery,
  useCreateShiftTemplateMutation,
  useUpdateShiftTemplateMutation,
  useDeleteShiftTemplateMutation,
  useGetRoomsQuery,
  useGetRoomByIdQuery,
  useGetActiveRoomsQuery,
  useGetRoomsByTypeQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetScheduleStatsQuery,
  useGetShiftTemplateStatsQuery,
  useGetRoomStatsQuery,
} = scheduleApi;
