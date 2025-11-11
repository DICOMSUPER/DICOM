import { RoomSchedule } from "./room-schedule.interface";
import { User } from "./user.interface";

export interface IEmployeeRoomAssignment {
  id: string;
  roomScheduleId: string;
  employeeId: string;
  roomSchedule: RoomSchedule;
  employee: User;
  isActive: boolean;
}

export interface FilterEmployeeRoomAssignment {
  roomScheduleId?: string;
  employeeId?: string;
  isActive?: boolean;
}