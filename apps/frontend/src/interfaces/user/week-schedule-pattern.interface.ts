import { BaseEntity } from "../base.interface";

export interface WeeklySchedulePattern extends BaseEntity {
  id: string;
  userId: string;
  dayOfWeek: number;
  shiftTemplateId: string;
  customStartTime: string;
  customEndTime: string;
  isWorkingDay: boolean;
  effectiveFrom: string;
  effectiveUntil: string;
  isActive: boolean;
  notes?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    isActive: boolean;
  };
  shiftTemplate?: {
    shift_template_id: string;
    shift_name: string;
    shift_type: string;
    start_time: string;
    end_time: string;
    break_start_time?: string;
    break_end_time?: string;
    description?: string;
    is_active: boolean;
  };
}
export interface CreateWeeklySchedulePatternDto {
  userId: string;
  dayOfWeek: number;
  shiftTemplateId: string;
  customStartTime?: string;
  customEndTime?: string;
  isWorkingDay: boolean;
  effectiveFrom: string;
  effectiveUntil: string;
  notes?: string;
}

export interface UpdateWeeklySchedulePatternDto
  extends Partial<CreateWeeklySchedulePatternDto> { }