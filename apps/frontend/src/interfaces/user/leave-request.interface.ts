import { LeaveStatus, LeaveType } from "@/enums/schedule.enum";
import { BaseEntity } from "../base.interface";


export interface LeaveRequest extends BaseEntity {
  leave_id: string;
  employee_id: string;
  leave_type: LeaveType;
  start_date: Date;
  end_date: Date;
  total_days: number;
  reason: string;
  leave_status?: LeaveStatus;
  approved_by?: string;
  approved_at?: Date;
  rejection_reason?: string;
}