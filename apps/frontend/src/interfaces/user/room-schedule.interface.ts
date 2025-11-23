import { ScheduleStatus } from "@/enums/schedule.enum";
import { BaseEntity } from "../base.interface";
import { Room } from "./room.interface";

export interface ShiftTemplate {
  shift_template_id: string;
  shift_name: string;
  shift_type: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'FULL_DAY' | 'morning' | 'afternoon' | 'night' | 'full_day' | 'custom';
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  description?: string;
  is_active: boolean;
}

export interface RoomSchedule extends BaseEntity {
  schedule_id: string;
  room_id?: string;
  room?: Room;
  shift_template_id?: string;
  shift_template?: ShiftTemplate;
  work_date: Date | string;
  actual_start_time?: string;
  actual_end_time?: string;
  schedule_status: ScheduleStatus;
  notes?: string;
  overtime_hours: number;
  created_by?: string;
}
