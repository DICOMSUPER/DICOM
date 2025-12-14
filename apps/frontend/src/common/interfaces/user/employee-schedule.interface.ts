import { ScheduleStatus } from "@/common/enums/schedule.enum";
import { BaseEntity } from "../base.interface";

export interface EmployeeSchedule extends BaseEntity {
  schedule_id: string;
  room_id?: string;
  shift_template_id?: string;
  work_date: Date;
  actual_start_time?: string;
  actual_end_time?: string;
  schedule_status?: ScheduleStatus;
  notes?: string;
  overtime_hours?: number;
  created_by?: string;
}
