import { BaseEntity } from "../base.interface";
import { RoomSchedule } from "./room-schedule.interface";
import { User } from "./user.interface";

export interface FilterEmployeeRoomAssignment {
  roomScheduleId?: string;
  employeeId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface EmployeeRoomAssignment extends BaseEntity {
  id: string;
  roomScheduleId: string;
  employeeId: string;
  isActive: boolean;
  roomSchedule?: RoomSchedule;
  employee?: User;
}

export interface EmployeeRoomAssignmentStats {
  [day: string]: number;
}
