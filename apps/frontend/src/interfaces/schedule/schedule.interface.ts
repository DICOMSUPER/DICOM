// Employee Schedule Interfaces
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  departmentId?: string;
  department?: Department;
}

export interface Department {
  id: string;
  departmentName: string;
  departmentCode: string;
  description?: string;
  isActive: boolean;
}

export interface Room {
  id: string;
  roomCode: string;
  roomType: string;
  department?: string;
  floor?: number;
  capacity?: number;
  pricePerDay?: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  description?: string;
  hasTV: boolean;
  hasAirConditioning: boolean;
  hasWiFi: boolean;
  hasTelephone: boolean;
  hasAttachedBathroom: boolean;
  isWheelchairAccessible: boolean;
  hasOxygenSupply: boolean;
  hasNurseCallButton: boolean;
  notes?: string;
  isActive: boolean;
}

export interface ShiftTemplate {
  shift_template_id: string;
  shift_name: string;
  shift_type: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'FULL_DAY';
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  description?: string;
  is_active: boolean;
}

export interface RoomSchedule {
  schedule_id: string;
  employee_id: string;
  room_id?: string;
  shift_template_id?: string;
  work_date: string;
  actual_start_time?: string;
  actual_end_time?: string;
  schedule_status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  overtime_hours: number;
  created_by?: string;
  employee: Employee;
  room?: Room;
  shift_template?: ShiftTemplate;
}

// DTOs for API calls
export interface CreateRoomScheduleDto {
  employee_id: string;
  room_id?: string;
  shift_template_id?: string;
  work_date: string;
  actual_start_time?: string;
  actual_end_time?: string;
  schedule_status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  overtime_hours?: number;
}

export interface UpdateRoomScheduleDto {
  room_id?: string;
  shift_template_id?: string;
  work_date?: string;
  actual_start_time?: string;
  actual_end_time?: string;
  schedule_status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  overtime_hours?: number;
}

export interface RoomScheduleSearchFilters {
  employee_id?: string;
  room_id?: string;
  work_date?: string;
  schedule_status?: string;
  department_id?: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ScheduleStats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
  today: number;
  this_week: number;
  this_month: number;
}

// Time slot interface for UI
export interface TimeSlot {
  time: string;
  hour: number;
}

// View mode types
export type ViewMode = 'day' | 'week' | 'month' | 'list';
