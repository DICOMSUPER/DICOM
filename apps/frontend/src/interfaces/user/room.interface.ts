import { RoomType } from "@/enums/patient.enum";
import { BaseEntity } from "../base.interface";


export interface Room {
  room_id: string;
  room_code: string;
  room_type?: RoomType;
  description?: string;
  is_active?: boolean;
}
export interface RoomAssignment extends BaseEntity {
  assignment_id: string;
  room_id: string;
  employee_id: string;
  assigned_from: Date;
  assigned_to?: Date;
  role_in_room?: string;
  is_primary?: boolean;
  is_active?: boolean;
  created_by?: string;
}