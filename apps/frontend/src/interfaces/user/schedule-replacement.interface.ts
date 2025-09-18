import { ScheduleStatus } from "@/enums/schedule.enum";
import { BaseEntity } from "../base.interface";

export interface ScheduleReplacement extends BaseEntity {
  replacement_id: string;
  original_schedule_id: string;
  replacement_employee_id: string;
  reason: string;
  replacement_status?: ScheduleStatus;
  created_by?: string;
}
