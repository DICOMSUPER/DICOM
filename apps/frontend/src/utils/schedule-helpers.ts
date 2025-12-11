import { format, parse, isValid, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { Calendar, CheckCircle, RefreshCw, Check, X, HelpCircle, LucideIcon } from 'lucide-react';

// Time utilities
export const formatTime = (time: string, format24Hour: boolean = false): string => {
  if (!time) return '';
  
  try {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return format(date, format24Hour ? 'HH:mm' : 'h:mm a');
  } catch (error) {
    return time;
  }
};

export const parseTime = (timeString: string): Date | null => {
  try {
    return parse(timeString, 'HH:mm', new Date());
  } catch (error) {
    return null;
  }
};

export const isValidTime = (time: string): boolean => {
  const parsed = parseTime(time);
  return parsed !== null && isValid(parsed);
};

export const checkTimeOverlap = (
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean => {
  const start1Time = parseTime(start1);
  const end1Time = parseTime(end1);
  const start2Time = parseTime(start2);
  const end2Time = parseTime(end2);

  if (!start1Time || !end1Time || !start2Time || !end2Time) {
    return false;
  }

  return start1Time < end2Time && end1Time > start2Time;
};

export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = parseTime(startTime);
  const end = parseTime(endTime);
  
  if (!start || !end) return 0;
  
  const diffMs = end.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60)); // Return hours
};

export const isWithinWorkingHours = (
  time: string,
  workingStartTime: string = '08:00',
  workingEndTime: string = '17:00'
): boolean => {
  const timeObj = parseTime(time);
  const startObj = parseTime(workingStartTime);
  const endObj = parseTime(workingEndTime);
  
  if (!timeObj || !startObj || !endObj) return false;
  
  const timeHours = timeObj.getHours();
  const timeMinutes = timeObj.getMinutes();
  const startHours = startObj.getHours();
  const startMinutes = startObj.getMinutes();
  const endHours = endObj.getHours();
  const endMinutes = endObj.getMinutes();
  
  const timeInMinutes = timeHours * 60 + timeMinutes;
  const startInMinutes = startHours * 60 + startMinutes;
  const endInMinutes = endHours * 60 + endMinutes;
  
  return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
};


// Date utilities
export const formatScheduleDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

export const formatScheduleTime = (schedule: { actual_start_time?: string; actual_end_time?: string }): string => {
  if (!schedule.actual_start_time || !schedule.actual_end_time) {
    return 'No time set';
  }
  
  const start = formatTime(schedule.actual_start_time, true);
  const end = formatTime(schedule.actual_end_time, true);
  return `${start} - ${end}`;
};

export const formatTimeValue = (time?: string): string => {
  if (!time) return "--:--";
  return time;
};

export const formatTimeRange = (startTime?: string, endTime?: string, separator: string = " – "): string => {
  if (!startTime && !endTime) return "--:--";
  const start = formatTimeValue(startTime);
  const end = formatTimeValue(endTime);
  if (start === "--:--" && end === "--:--") return "--:--";
  return `${start}${separator}${end}`;
};

export const getWeekDates = (date: Date): { start: Date; end: Date; dates: Date[] } => {
  const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
  const dates = eachDayOfInterval({ start, end });
  
  return { start, end, dates };
};

export const getMonthDates = (date: Date): Date[] => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  return eachDayOfInterval({ start: firstDay, end: lastDay });
};

// Schedule status utilities
export const getScheduleStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getScheduleStatusIcon = (status: string): LucideIcon => {
  const statusIcons: Record<string, LucideIcon> = {
    scheduled: Calendar,
    in_progress: RefreshCw,
    completed: Check,
    cancelled: X,
  };
  
  return statusIcons[status] || HelpCircle;
};

// Conflict detection utilities
export const detectScheduleConflicts = (schedules: any[]): Array<{ schedule: any; conflicts: any[] }> => {
  const conflicts: Array<{ schedule: any; conflicts: any[] }> = [];
  
  for (let i = 0; i < schedules.length; i++) {
    const schedule = schedules[i];
    const scheduleConflicts: any[] = [];
    
    for (let j = i + 1; j < schedules.length; j++) {
      const otherSchedule = schedules[j];
      
      // Check if same employee and same date
      if (schedule.employee_id === otherSchedule.employee_id && 
          schedule.work_date === otherSchedule.work_date) {
        
        // Check time overlap
        if (schedule.actual_start_time && schedule.actual_end_time &&
            otherSchedule.actual_start_time && otherSchedule.actual_end_time) {
          
          if (checkTimeOverlap(
            schedule.actual_start_time, 
            schedule.actual_end_time,
            otherSchedule.actual_start_time, 
            otherSchedule.actual_end_time
          )) {
            scheduleConflicts.push(otherSchedule);
          }
        }
      }
    }
    
    if (scheduleConflicts.length > 0) {
      conflicts.push({ schedule, conflicts: scheduleConflicts });
    }
  }
  
  return conflicts;
};


// Template utilities
export const generateScheduleFromTemplate = (
  template: { startTime: string; endTime: string; breakStartTime?: string; breakEndTime?: string },
  workDate: string,
  employeeId: string
): any => {
  return {
    employee_id: employeeId,
    work_date: workDate,
    actual_start_time: template.startTime,
    actual_end_time: template.endTime,
    schedule_status: 'scheduled',
    notes: `Generated from template`,
  };
};

// Pagination utilities
export const calculatePagination = (total: number, page: number, limit: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;
  
  return {
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex: (page - 1) * limit,
    endIndex: Math.min(page * limit, total),
  };
};

// Search utilities
export const filterSchedules = (
  schedules: any[],
  filters: {
    employeeId?: string;
    roomId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): any[] => {
  return schedules.filter(schedule => {
    if (filters.employeeId && schedule.employee_id !== filters.employeeId) {
      return false;
    }
    
    if (filters.roomId && schedule.room_id !== filters.roomId) {
      return false;
    }
    
    if (filters.status && schedule.schedule_status !== filters.status) {
      return false;
    }
    
    if (filters.dateFrom && schedule.work_date < filters.dateFrom) {
      return false;
    }
    
    if (filters.dateTo && schedule.work_date > filters.dateTo) {
      return false;
    }
    
    return true;
  });
};

// Export all utilities
export const scheduleHelpers = {
  formatTime,
  parseTime,
  isValidTime,
  checkTimeOverlap,
  calculateDuration,
  isWithinWorkingHours,
  formatScheduleDate,
  formatScheduleTime,
  formatTimeValue,
  formatTimeRange,
  getWeekDates,
  getMonthDates,
  getScheduleStatusColor,
  getScheduleStatusIcon,
  detectScheduleConflicts,
  generateScheduleFromTemplate,
  calculatePagination,
  filterSchedules,
};
