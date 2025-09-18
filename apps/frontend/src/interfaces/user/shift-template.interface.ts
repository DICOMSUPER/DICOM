import { ShiftType } from "@/enums/schedule.enum";
import { BaseEntity } from "../base.interface";
export interface ShiftTemplate extends BaseEntity {
  shift_template_id: string;
  shift_name: string;
  shift_type: ShiftType;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  description?: string;
  is_active?: boolean;
  created_by?: string;
}