import { BaseEntity } from "../base.interface";

export interface WeeklySchedulePattern extends BaseEntity {
  pattern_id: string;
  employee_id: string;
  room_id?: string;
  monday_shift_id?: string;
  tuesday_shift_id?: string;
  wednesday_shift_id?: string;
  thursday_shift_id?: string;
  friday_shift_id?: string;
  saturday_shift_id?: string;
  sunday_shift_id?: string;
  effective_from: Date;
  effective_to?: Date;
  is_active?: boolean;
  created_by?: string;
}