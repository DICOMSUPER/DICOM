import { EmployeeRoomAssignment } from "@/interfaces/user/employee-room-assignment.interface";

export type AssignmentWithMeta = EmployeeRoomAssignment & {
  __optimistic?: boolean;
};

