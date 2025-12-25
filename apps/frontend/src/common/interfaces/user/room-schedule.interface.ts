import { ScheduleStatus } from "@/common/enums/schedule.enum";
import { BaseEntity } from "../base.interface";
import { Room } from "./room.interface";
import { ShiftTemplate } from "./shift-template.interface";

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
