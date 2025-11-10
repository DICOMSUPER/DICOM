import { BaseEntity } from "../base.interface";
import { RoomSchedule } from "./room-schedule.interface";
import { User } from "./user.interface";

export interface EmployeeRoomAssignment extends BaseEntity {
  id: string;
  roomScheduleId: string;
  employeeId: string;
  isActive: boolean;
  roomSchedule?: RoomSchedule;
  employee?: User;
}
