import { QueueStatus } from "@/enums/patient.enum";
import { BaseEntity } from "../base.interface";

export interface QueueAssignment extends BaseEntity {
  queue_id: string;
  queue_number: string;
  room_id?: string;
  priority_level?: number;
  assigned_at?: Date;
  assignment_expires_date?: Date;
  priority_reason?: string;
  status?: QueueStatus;
  created_by?: string;
}