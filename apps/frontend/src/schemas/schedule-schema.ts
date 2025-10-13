import { z } from "zod";

// Working Hours Schemas
export const workingHoursSchema = z.object({
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isEnabled: z.boolean().default(true),
  description: z.string().optional(),
});

export const breakTimeSchema = z.object({
  breakName: z.string().min(1, "Break name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  workingHoursId: z.string().uuid("Invalid working hours ID"),
  description: z.string().optional(),
});

export const specialHoursSchema = z.object({
  date: z.string().min(1, "Date is required"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  isHoliday: z.boolean().default(false),
  description: z.string().optional(),
});

// Schedule Schemas
export const scheduleFormSchema = z.object({
  employee_id: z.string().uuid("Invalid employee ID"),
  room_id: z.string().uuid("Invalid room ID").optional(),
  shift_template_id: z.string().uuid("Invalid shift template ID").optional(),
  work_date: z.string().min(1, "Work date is required"),
  actual_start_time: z.string().optional(),
  actual_end_time: z.string().optional(),
  schedule_status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  overtime_hours: z.number().min(0).optional(),
  created_by: z.string().uuid("Invalid created by ID").optional(),
}).refine((data) => {
  // If start and end times are provided, start must be before end
  if (data.actual_start_time && data.actual_end_time) {
    return data.actual_start_time < data.actual_end_time;
  }
  return true;
}, {
  message: "Start time must be before end time",
  path: ["actual_start_time"],
});

export const bulkScheduleSchema = z.object({
  schedules: z.array(scheduleFormSchema).min(1, "At least one schedule is required"),
});

export const copyWeekSchema = z.object({
  sourceWeekStart: z.string().min(1, "Source week start date is required"),
  targetWeekStart: z.string().min(1, "Target week start date is required"),
  employeeId: z.string().uuid("Invalid employee ID").optional(),
});

export const conflictCheckSchema = z.object({
  employeeId: z.string().uuid("Invalid employee ID"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  excludeScheduleId: z.string().uuid("Invalid schedule ID").optional(),
});

// Template Schemas
export const duplicateTemplateSchema = z.object({
  id: z.string().uuid("Invalid template ID"),
  newName: z.string().min(1, "New name is required"),
});

export const createFromTemplateSchema = z.object({
  templateId: z.string().uuid("Invalid template ID"),
  dates: z.array(z.string()).min(1, "At least one date is required"),
  employeeIds: z.array(z.string().uuid("Invalid employee ID")).min(1, "At least one employee is required"),
});

export const applyTemplateToEmployeesSchema = z.object({
  templateId: z.string().uuid("Invalid template ID"),
  employeeIds: z.array(z.string().uuid("Invalid employee ID")).min(1, "At least one employee is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

// Search and Filter Schemas
export const scheduleSearchSchema = z.object({
  employeeId: z.string().uuid("Invalid employee ID").optional(),
  roomId: z.string().uuid("Invalid room ID").optional(),
  workDateFrom: z.string().optional(),
  workDateTo: z.string().optional(),
  scheduleStatus: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled']).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// Time validation helpers
export const timeValidationSchema = z.object({
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
}).refine((data) => {
  return data.startTime < data.endTime;
}, {
  message: "Start time must be before end time",
  path: ["startTime"],
});

// Date validation helpers
export const dateRangeSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
}).refine((data) => {
  return new Date(data.startDate) <= new Date(data.endDate);
}, {
  message: "Start date must be before or equal to end date",
  path: ["startDate"],
});

// Export types
export type WorkingHoursFormData = z.infer<typeof workingHoursSchema>;
export type BreakTimeFormData = z.infer<typeof breakTimeSchema>;
export type SpecialHoursFormData = z.infer<typeof specialHoursSchema>;
export type ScheduleFormData = z.infer<typeof scheduleFormSchema>;
export type BulkScheduleData = z.infer<typeof bulkScheduleSchema>;
export type CopyWeekData = z.infer<typeof copyWeekSchema>;
export type ConflictCheckData = z.infer<typeof conflictCheckSchema>;
export type DuplicateTemplateData = z.infer<typeof duplicateTemplateSchema>;
export type CreateFromTemplateData = z.infer<typeof createFromTemplateSchema>;
export type ApplyTemplateToEmployeesData = z.infer<typeof applyTemplateToEmployeesSchema>;
export type ScheduleSearchData = z.infer<typeof scheduleSearchSchema>;
export type TimeValidationData = z.infer<typeof timeValidationSchema>;
export type DateRangeData = z.infer<typeof dateRangeSchema>;
